import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './App.css';
import AdminDashboard from './AdminDashboard';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';

const translations = {
  english: {
    welcomeTitle: "Hello.",
    welcomeDesc: "How can I help you today?",
    newChat: "New chat",
    recent: "Recent",
    adminPanel: "Admin Panel",
    adminLogin: "Admin Login",
    askAnything: "Ask anything",
    fireSafety: "🔥 Fire Safety",
    gasLeak: "⚠️ Gas Leak",
    ppeRules: "⛑ PPE Rules",
    vehicleInfo: "🚛 Vehicle Info",
    deptInfo: "🏢 Department Info",
    emergencyContacts: "☎ Emergency Contacts",
    raiseAlert: "🚨 Raise Alert",
    vehicleSearch: "🚛 Vehicle Search",
    safetyRules: "📚 Safety Rules",
    sopDocs: "📄 SOP Documents",
    logout: "Logout"
  },
  hindi: {
    welcomeTitle: "नमस्ते।",
    welcomeDesc: "आज मैं आपकी कैसे मदद कर सकता हूँ?",
    newChat: "नई चैट",
    recent: "पुरानी चैट",
    adminPanel: "एडमिन पैनल",
    adminLogin: "एडमिन लॉगिन",
    askAnything: "कोई भी सवाल पूछें...",
    fireSafety: "🔥 आग लगना",
    gasLeak: "⚠️ गैस लीकेज",
    ppeRules: "⛑ सेफ्टी के नियम",
    vehicleInfo: "🚛 गाड़ी की जानकारी",
    deptInfo: "🏢 डिपार्टमेंट की जानकारी",
    emergencyContacts: "☎ इमरजेंसी नंबर",
    raiseAlert: "🚨 अलर्ट भेजें",
    vehicleSearch: "🚛 गाड़ी खोजें",
    safetyRules: "📚 सेफ्टी नियम",
    sopDocs: "📄 SOP डाक्यूमेंट्स",
    logout: "लॉगआउट करें"
  },
  hinglish: {
    welcomeTitle: "Hello.",
    welcomeDesc: "Aaj main aapki kaise madad kar sakta hoon?",
    newChat: "New chat",
    recent: "Recent",
    adminPanel: "Admin Panel",
    adminLogin: "Admin Login",
    askAnything: "Ask anything",
    fireSafety: "🔥 Fire Safety",
    gasLeak: "⚠️ Gas Leak",
    ppeRules: "⛑ PPE Rules",
    vehicleInfo: "🚛 Vehicle Info",
    deptInfo: "🏢 Department Info",
    emergencyContacts: "☎ Emergency Contacts",
    raiseAlert: "🚨 Raise Alert",
    vehicleSearch: "🚛 Vehicle Search",
    safetyRules: "📚 Safety Rules",
    sopDocs: "📄 Safety Documents"
  }
};


function App() {
  // App State
  const [currentPage, setCurrentPage] = useState('landing');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showEmergencyPanel, setShowEmergencyPanel] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [language, setLanguage] = useState('hinglish');
  
  const t = translations[language] || translations['hinglish'];
  
  const renderUI = (key) => {
    if (language === 'hinglish') {
      return (
        <span style={{ display: 'inline-flex', flexDirection: 'column', lineHeight: '1.2', alignItems: 'inherit' }}>
          <span>{translations.english[key]}</span>
          <span style={{ fontSize: '0.75em', opacity: 0.8, marginTop: '1px' }}>{translations.hindi[key]}</span>
        </span>
      );
    }
    return t[key];
  };
  
  // Auth State
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('username') || '');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // Chat State
  const [messages, setMessages] = useState([]);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [showVehicleSearch, setShowVehicleSearch] = useState(false);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [recentChats, setRecentChats] = useState([
    "Safety Guidelines",
    "Gate Entry Status"
  ]);
  
  const categoryQuestions = {
    'Fire Safety': ['Fire hone par kya kare?', 'Kaunsa extinguisher use kare?', 'Evacuation procedure kya hai?', 'Fire team ka contact kya hai?'],
    'Gas Leak': ['Gas leak hone par kya kare?', 'Gas mask kab pehne?', 'Emergency exit kahan hai?'],
    'Electrical Hazard': ['Electric shock lagne par first aid kya hai?', 'LOTO procedure kya hai?'],
    'PPE Rules': ['Helmet kyu zaruri hai?', 'Safety shoes kab pehne chahiye?', 'Goggles kab use karne chahiye?'],
    'First Aid': ['Burns ke liye first aid kya hai?', 'First aid box kahan milega?'],
    'Safety Documents': ['Fire safety manual dikhao', 'PPE SOP kahan hai?'],
    'Department Info': ['Safety department ka contact do', 'Medical department details'],
    'Emergency Contacts': ['Ambulance ka number kya hai?', 'Fire control room ka contact?']
  };

  const handleCategorySelect = (cat) => {
    if (categoryQuestions[cat]) {
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: `Please select a question from the ${cat} category, or type your own:`,
        suggestions: categoryQuestions[cat]
      }]);
    }
  };

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Camera State
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const fileInputRef = useRef(null);
  const [alertPhoto, setAlertPhoto] = useState(null);
  const alertFileInputRef = useRef(null);

  // WebRTC Camera State
  const [showWebcam, setShowWebcam] = useState(false);
  const [webcamMode, setWebcamMode] = useState('chat'); // 'chat' or 'alert'
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const startWebcam = async (mode) => {
    setWebcamMode(mode);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setShowWebcam(true); // Mount the modal
      
      // Give React a moment to render the video element
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
        // Automatically switch language for better detection
        recognitionRef.current.lang = language === 'hindi' ? 'hi-IN' : 'en-IN';
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
      const res = await fetch('/api/auth/login', {
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
        setShowLoginModal(false);
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
    setCurrentPage('landing');
  };

  const sendMessage = async (text, isEmergencyFlag = false) => {
    if (!text.trim()) return;

    // Add user message to UI
    const newUserMsg = { sender: 'user', text, isEmergency: isEmergencyFlag };
    if (capturedPhoto) {
      newUserMsg.photo = capturedPhoto;
    }
    
    if (messages.length === 0) {
      setRecentChats(prev => [text.substring(0, 25) + (text.length > 25 ? "..." : ""), ...prev]);
    }

    setMessages(prev => [...prev, newUserMsg]);
    setInputText('');
    const photoToSend = capturedPhoto;
    setCapturedPhoto(null);
    setIsLoading(true);

    try {
      // In a real scenario you might not need a token for the chatbot, 
      // but if the backend requires it, we provide it. If not required, it just ignores it.
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const payload = { message: text, language };
      if (photoToSend) {
        payload.imageBase64 = photoToSend;
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();

      if (res.ok) {
        // Parse Hindi subtitle if Hinglish mode (we assume the backend appends it on a new line or we just show the raw reply)
        let botReply = data.reply;
        let hindiSub = '';
        
        if (language === 'hinglish' && botReply.includes('|SUBTITLE|')) {
          const parts = botReply.split('|SUBTITLE|');
          botReply = parts[0].trim();
          hindiSub = parts[1].trim();
        } else if (language === 'hinglish' && botReply.includes('\n')) {
          const lines = botReply.split('\n');
          const lastLine = lines[lines.length - 1];
          if (/[\u0900-\u097F]/.test(lastLine)) {
            hindiSub = lastLine;
            botReply = lines.slice(0, lines.length - 1).join('\n');
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

  const handleQuickAction = (text) => {
    sendMessage(text);
  };

  const triggerEmergency = (type) => {
    setShowEmergencyPanel(false);
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
    />;
  }

  const handleLoginSuccess = (loginToken, loginUsername) => {
    setToken(loginToken);
    setCurrentUser(loginUsername);
    localStorage.setItem('token', loginToken);
    localStorage.setItem('username', loginUsername);
    setIsAdminMode(true);
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

      {/* WebRTC Camera Modal (Full Screen, kept from previous version) */}
      {showWebcam && (
        <div className="full-screen-camera-overlay">
          <div className="camera-video-container">
            <video ref={videoRef} autoPlay playsInline className="full-screen-video"></video>
          </div>
          
          <div className="camera-bottom-actions">
            {/* Flip Camera */}
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

            {/* Capture Button */}
            <button type="button" className="capture-circle-btn" onClick={captureWebcamPhoto}></button>

            {/* Close Button */}
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
