import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './App.css';
import AdminDashboard from './AdminDashboard';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';

// Helper to persist language in localStorage
const getInitialLanguage = () => localStorage.getItem('language') || 'en';

function App() {
  // App State
  const [currentPage, setCurrentPage] = useState('landing');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Language: 'en' | 'hi' | 'hien' — default English, persisted in localStorage
  const [language, setLanguageState] = useState(getInitialLanguage);

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  // Auth State
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('username') || '');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // Chat State
  const [messages, setMessages] = useState([]);
  const [recentChats, setRecentChats] = useState([
    "Safety Guidelines",
    "Gate Entry Status"
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Camera State
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const fileInputRef = useRef(null);
  const [alertPhoto, setAlertPhoto] = useState(null);

  // WebRTC Camera State
  const [showWebcam, setShowWebcam] = useState(false);
  const [webcamMode, setWebcamMode] = useState('chat');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const startWebcam = async (mode) => {
    setWebcamMode(mode);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setShowWebcam(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 150);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Camera access denied or not available: " + err.message);
      setShowWebcam(false);
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowWebcam(false);
  };

  const captureWebcamPhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      if (webcamMode === 'chat') {
        setCapturedPhoto(dataUrl);
      } else {
        setAlertPhoto(dataUrl);
      }
      stopWebcam();
    }
  };

  const handlePhotoCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setInputText(transcript);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
        recognitionRef.current.start();
        setIsRecording(true);
      } else {
        alert("Microphone is not supported in this browser.");
      }
    }
  };

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();

      if (res.ok) {
        setToken(data.token);
        setCurrentUser(data.username);
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        setIsAdminMode(true);
      } else {
        setLoginError(data.error || 'Login failed');
      }
    } catch (err) {
      setLoginError('Server connection error. Is backend running?');
    }
  };

  const handleLogout = () => {
    setToken('');
    setCurrentUser('');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsAdminMode(false);
    setMessages([]); // Clear admin session messages when logging out
    setCurrentPage('landing');
  };

  const sendMessage = async (text, isEmergencyFlag = false) => {
    // Allow send if there's text or a captured photo
    if (!text.trim() && !capturedPhoto) return;
    const messageText = text.trim() || '📷 [Image attached — please describe what you see]';

    const newUserMsg = { sender: 'user', text: messageText, isEmergency: isEmergencyFlag };
    if (capturedPhoto) {
      newUserMsg.photo = capturedPhoto;
    }

    if (messages.length === 0) {
      setRecentChats(prev => [messageText.substring(0, 25) + (messageText.length > 25 ? "..." : ""), ...prev]);
    }

    setMessages(prev => [...prev, newUserMsg]);
    setInputText('');
    const photoToSend = capturedPhoto;
    setCapturedPhoto(null);
    setIsLoading(true);

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const payload = { message: messageText, language };
      if (photoToSend) {
        payload.imageBase64 = photoToSend;
      }

      const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        let botReply = data.reply;
        let hindiSub = '';

        // Helper: convert Devanagari numerals to Arabic
        const fixNumerals = (str) => str.replace(/[०-९]/g, d => '०१२३४५६७८९'.indexOf(d));

        // Helper: strip stray |SUBTITLE| marker and any "subtitle" word lines
        const cleanEnglishReply = (str) => str
          .replace(/\|SUBTITLE\|[\s\S]*/i, '')   // strip everything from |SUBTITLE| onwards
          .replace(/^subtitle[:\s]*/gim, '')       // strip lines starting with "subtitle"
          .trim();

        // Only Hinglish (hien) mode gets Hindi subtitle
        // Hindi (hi) mode = full Hindi reply, no subtitle
        // English (en) mode = full English reply, no subtitle
        if (language === 'hien') {
          if (botReply.includes('|SUBTITLE|')) {
            const parts = botReply.split('|SUBTITLE|');
            botReply = parts[0].trim();
            hindiSub = fixNumerals(parts[1].trim());
          } else if (botReply.includes('\n')) {
            // Fallback: if last paragraph block is Devanagari, treat it as subtitle
            const lines = botReply.split('\n');
            const lastLine = lines[lines.length - 1];
            if (/[\u0900-\u097F]/.test(lastLine)) {
              hindiSub = fixNumerals(lastLine);
              botReply = lines.slice(0, lines.length - 1).join('\n').trim();
            }
          }
          botReply = cleanEnglishReply(botReply);
        } else {
          // en or hi mode — strip any accidental |SUBTITLE| or subtitle text
          botReply = cleanEnglishReply(botReply);
          if (language === 'hi') {
            botReply = fixNumerals(botReply);
          }
        }

        const newBotMsg = {
          sender: 'bot',
          text: botReply,
          hindiSubtitle: hindiSub,
          alertCreated: data.alertCreated
        };
        setMessages(prev => [...prev, newBotMsg]);
      } else {
        setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I encountered an error. Please try again.' }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Network Error: Cannot connect to the server. Please check if the backend is running on port 5000.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerEmergency = (type) => {
    const emergencyText = `Emergency: ${type} at Plant Area`;
    sendMessage(emergencyText, true);
  };

  if (isAdminMode && token) {
    return <AdminDashboard
      token={token}
      currentUser={currentUser}
      onLogout={() => handleLogout()}
      messages={messages}
      sendMessage={sendMessage}
      isLoading={isLoading}
      language={language}
      setLanguage={setLanguage}
      recentChats={recentChats}
      clearChat={() => setMessages([])}
      isRecording={isRecording}
      toggleRecording={toggleRecording}
      onAttachClick={() => fileInputRef.current?.click()}
      capturedPhoto={capturedPhoto}
      clearPhoto={() => setCapturedPhoto(null)}
      chatInput={inputText}
      setChatInput={setInputText}
    />;
  }

  const handleLoginSuccess = (loginToken, loginUsername) => {
    setToken(loginToken);
    setCurrentUser(loginUsername);
    localStorage.setItem('token', loginToken);
    localStorage.setItem('username', loginUsername);
    setIsAdminMode(true);
    setMessages([]); // Clear user session messages when entering admin panel
  };

  return (
    <>
      {currentPage === 'landing' && (
        <>
          <LandingPage
            onAdminClick={() => {
              if (token) {
                setIsAdminMode(true);
              } else {
                setCurrentPage('login');
              }
            }}
            messages={messages}
            sendMessage={sendMessage}
            isLoading={isLoading}
            language={language}
            setLanguage={setLanguage}
            recentChats={recentChats}
            clearChat={() => setMessages([])}
            isRecording={isRecording}
            toggleRecording={toggleRecording}
            onAttachClick={() => fileInputRef.current?.click()}
            capturedPhoto={capturedPhoto}
            clearPhoto={() => setCapturedPhoto(null)}
            chatInput={inputText}
            setChatInput={setInputText}
          />
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handlePhotoCapture}
          />
        </>
      )}

      {currentPage === 'login' && (
        <LoginPage
          onLogin={handleLoginSuccess}
          onBack={() => setCurrentPage('landing')}
        />
      )}

      {/* WebRTC Camera Modal */}
      {showWebcam && (
        <div className="full-screen-camera-overlay">
          <div className="camera-video-container">
            <video ref={videoRef} autoPlay playsInline className="full-screen-video"></video>
          </div>

          <div className="camera-bottom-actions">
            <button type="button" className="camera-action-btn" onClick={() => {
              stopWebcam();
              setTimeout(() => {
                const currentMode = streamRef.current?.getVideoTracks()[0]?.getSettings()?.facingMode;
                const newMode = currentMode === 'user' ? 'environment' : 'user';
                navigator.mediaDevices.getUserMedia({ video: { facingMode: newMode } })
                  .then(stream => {
                    streamRef.current = stream;
                    if (videoRef.current) videoRef.current.srcObject = stream;
                    setShowWebcam(true);
                  }).catch(err => {
                    console.error(err);
                    startWebcam(webcamMode);
                  });
              }, 100);
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
            </button>

            <button type="button" className="capture-circle-btn" onClick={captureWebcamPhoto}></button>

            <button type="button" className="camera-action-btn" onClick={stopWebcam}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
        </div>
      )}
    </>
  );
}

export default App;
