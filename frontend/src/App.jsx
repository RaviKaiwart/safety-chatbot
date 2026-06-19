import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import AdminDashboard from './AdminDashboard';

function App() {
  // App State
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showEmergencyPanel, setShowEmergencyPanel] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [language, setLanguage] = useState('hinglish');
  
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
  
  const categoryQuestions = {
    'safety': ['Fire hone par kya kare?', 'Kaunsa extinguisher use kare?', 'Evacuation procedure kya hai?'],
    'vehicle': ['CG04AB1234 ka status', 'Gate entry rules', 'Parking details'],
    'department': ['Safety officer kon hai?', 'Medical team number', 'Maintenance head'],
    'emergency': ['Fire Emergency report', 'Ambulance call karo', 'Gas leak alert']
  };

  const handleCategorySelect = (cat) => {
    setMessages(prev => [...prev, {
      sender: 'bot',
      text: 'Here are some suggested questions you can ask:',
      suggestions: categoryQuestions[cat]
    }]);
  };

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
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
  };

  const sendMessage = async (text, isEmergencyFlag = false) => {
    if (!text.trim()) return;

    // Add user message to UI
    const newUserMsg = { sender: 'user', text, isEmergency: isEmergencyFlag };
    setMessages(prev => [...prev, newUserMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // In a real scenario you might not need a token for the chatbot, 
      // but if the backend requires it, we provide it. If not required, it just ignores it.
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: text, language })
      });
      
      const data = await res.json();

      if (res.ok) {
        // Parse Hindi subtitle if Hinglish mode (we assume the backend appends it on a new line or we just show the raw reply)
        let botReply = data.reply;
        let hindiSub = '';
        
        if (language === 'hinglish' && botReply.includes('\n')) {
          const lines = botReply.split('\n');
          // If the last line contains Hindi text (simplistic heuristic, we just grab the last line)
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
    return <AdminDashboard token={token} currentUser={currentUser} goBack={() => setIsAdminMode(false)} />;
  }

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <button 
            className="new-chat-btn" 
            onClick={() => {
              setMessages([{
                sender: 'bot',
                text: 'Hello! I am your Industrial Safety Assistant. How can I help you today?',
                hindiSubtitle: 'नमस्ते! मैं आपका औद्योगिक सुरक्षा सहायक हूँ। मैं आज आपकी कैसे मदद कर सकता हूँ?'
              }]);
              if(window.innerWidth <= 768) setIsSidebarOpen(false);
            }}
          >
            <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>+</span> New chat
          </button>
          {window.innerWidth <= 768 && (
            <button className="close-sidebar-btn" onClick={() => setIsSidebarOpen(false)}>✕</button>
          )}
        </div>
        
        <div className="sidebar-content">
          <div className="sidebar-section">
            <h3>Recent</h3>
            <div className="history-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              Safety Guidelines
            </div>
            <div className="history-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              Gate Entry Status
            </div>
          </div>
        </div>
        
        <div className="sidebar-footer">
          <div className="settings-item">
            {token ? (
              <button className="admin-login-btn sidebar-btn" onClick={() => setIsAdminMode(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                Admin Panel
              </button>
            ) : (
              <button className="admin-login-btn sidebar-btn" onClick={() => setShowLoginModal(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                Admin Login
              </button>
            )}
          </div>
        </div>
      </aside>

      <div className="app-container">
        {/* Top Header */}
        <header className="mobile-header">
           <button className="hamburger-btn" onClick={() => setIsSidebarOpen(true)}>
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
           </button>
           <h2 className="header-title">Industrial Safety & Information Assistant</h2>
           <div className="header-actions">
             <select 
               className="lang-selector header-select"
               value={language}
               onChange={(e) => setLanguage(e.target.value)}
             >
               <option value="english">EN</option>
               <option value="hinglish">HIN</option>
               <option value="hindi">हिंदी</option>
             </select>
             <div className="header-avatar">U</div>
           </div>
        </header>

        {/* Main Content */}
        <main className="main-content">
          <div className="chat-container">
          {/* Messages Area */}
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="welcome-screen">
                <div className="welcome-header-text" style={{ marginTop: '10vh' }}>
                  <h1 style={{ fontSize: '3rem' }}>Hello.</h1>
                  <p style={{ fontSize: '1.2rem', marginTop: '10px' }}>How can I help you with industrial safety today?</p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`message-bubble ${msg.sender === 'user' ? 'message-user' : 'message-bot'} ${msg.isEmergency ? 'message-emergency' : ''}`}
                  >
                    <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                    {msg.hindiSubtitle && (
                      <div className="hindi-subtitle">{msg.hindiSubtitle}</div>
                    )}
                    {msg.suggestions && (
                      <div className="suggestion-chips">
                        {msg.suggestions.map((sug, i) => (
                          <button key={i} className="sug-chip" onClick={() => handleQuickAction(sug)}>{sug}</button>
                        ))}
                      </div>
                    )}
                    {msg.alertCreated && (
                      <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#10b981', fontWeight: 'bold' }}>
                        ✅ Alert Registered & Sent to Admin
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="message-bubble message-bot typing-indicator">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="chat-input-area">
            {/* Bottom Quick Queries */}
            <div className="quick-actions">
              <button className="quick-btn" onClick={() => handleQuickAction("Fire Safety")}>🔥 Fire Safety</button>
              <button className="quick-btn" onClick={() => handleQuickAction("Gas Leak")}>⚠️ Gas Leak</button>
              <button className="quick-btn" onClick={() => handleQuickAction("PPE Rules")}>⛑ PPE Rules</button>
              <button className="quick-btn" onClick={() => handleQuickAction("Vehicle Info")}>🚛 Vehicle Info</button>
              <button className="quick-btn" onClick={() => handleQuickAction("Department Info")}>🏢 Department Info</button>
              <button className="quick-btn" onClick={() => handleQuickAction("Emergency Contacts")}>☎ Emergency Contacts</button>
            </div>
            
            {/* Input Form */}
            <form 
              className="input-form"
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(inputText);
              }}
            >
              <div className="chat-input-wrapper">
                {/* Left Plus Button & Menu */}
                <div className="plus-menu-container">
                  <button 
                    type="button" 
                    className="icon-btn plus-btn-left"
                    onClick={() => setShowPlusMenu(!showPlusMenu)}
                    title="More options"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  </button>
                  
                  {showPlusMenu && (
                    <div className="plus-dropdown-menu">
                      <button type="button" className="plus-menu-item" onClick={() => { setShowPlusMenu(false); setShowEmergencyPanel(true); }}>
                        <span className="em-icon">🚨</span> Raise Alert
                      </button>
                      <button type="button" className="plus-menu-item" onClick={() => { setShowPlusMenu(false); setShowVehicleSearch(true); }}>
                        <span className="em-icon">🚛</span> Vehicle Search
                      </button>
                      <button type="button" className="plus-menu-item" onClick={() => { setShowPlusMenu(false); handleQuickAction("Department Info"); }}>
                        <span className="em-icon">🏢</span> Department Info
                      </button>
                      <button type="button" className="plus-menu-item" onClick={() => { setShowPlusMenu(false); handleQuickAction("Emergency Contacts"); }}>
                        <span className="em-icon">☎</span> Emergency Contacts
                      </button>
                      <button type="button" className="plus-menu-item" onClick={() => { setShowPlusMenu(false); handleQuickAction("Safety Rules"); }}>
                        <span className="em-icon">📚</span> Safety Rules
                      </button>
                      <button type="button" className="plus-menu-item" onClick={() => { setShowPlusMenu(false); handleQuickAction("SOP Documents"); }}>
                        <span className="em-icon">📄</span> SOP Documents
                      </button>
                    </div>
                  )}
                </div>

                <input
                  type="text"
                  className="chat-input"
                  placeholder="Ask anything"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={isLoading}
                />
                
                <div className="input-actions">
                  {/* Camera Icon */}
                  <button type="button" className="icon-btn" title="Upload Photo">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                      <circle cx="12" cy="13" r="4"></circle>
                    </svg>
                  </button>

                  {/* Mic Icon */}
                  <button type="button" className="icon-btn" title="Voice message">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
                  </button>
                  
                  {/* Circular Send Button */}
                  <button 
                    type="submit" 
                    className={`icon-btn send-circle-btn ${inputText.trim() ? 'active' : ''}`}
                    disabled={isLoading || !inputText.trim()}
                    title="Send message"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Admin Login Modal */}
      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="login-modal" onClick={e => e.stopPropagation()}>
            <h2>Admin Access</h2>
            <form className="login-form" onSubmit={handleLogin}>
              <input 
                type="text" 
                placeholder="Username" 
                required 
                value={loginForm.username}
                onChange={e => setLoginForm({...loginForm, username: e.target.value})}
              />
              <input 
                type="password" 
                placeholder="Password" 
                required 
                value={loginForm.password}
                onChange={e => setLoginForm({...loginForm, password: e.target.value})}
              />
              {loginError && <div className="error-text">{loginError}</div>}
              <button type="submit" className="login-submit">Login</button>
              <button type="button" className="close-modal" onClick={() => setShowLoginModal(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {/* Raise Alert Panel */}
      {showEmergencyPanel && (
        <div className="modal-overlay" onClick={() => setShowEmergencyPanel(false)}>
          <div className="alert-modal" onClick={e => e.stopPropagation()}>
            <h2>🚨 RAISE ALERT</h2>
            <form onSubmit={(e) => { 
              e.preventDefault(); 
              setShowEmergencyPanel(false); 
              handleQuickAction(`Reported Alert: ${e.target.type.value} at ${e.target.location.value}. Details: ${e.target.desc.value}`); 
            }}>
              <div className="form-group">
                <label>Alert Type</label>
                <select name="type" className="modal-input" required>
                  <option value="Fire">🔥 Fire</option>
                  <option value="Gas Leak">⚠️ Gas Leak</option>
                  <option value="Electrical">⚡ Electrical Hazard</option>
                  <option value="Medical">🚑 Medical Emergency</option>
                </select>
              </div>
              <div className="form-group">
                <label>Location</label>
                <input type="text" name="location" className="modal-input" required placeholder="e.g. Blast Furnace Area 2" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="desc" className="modal-input" required placeholder="Briefly describe the incident..."></textarea>
              </div>
              <div className="modal-actions" style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="close-modal" style={{ flex: 1 }} onClick={() => setShowEmergencyPanel(false)}>Cancel</button>
                <button type="submit" className="login-submit" style={{ flex: 1, background: '#ef4444' }}>Submit Alert</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vehicle Search Modal */}
      {showVehicleSearch && (
        <div className="modal-overlay" onClick={() => setShowVehicleSearch(false)}>
          <div className="login-modal" onClick={e => e.stopPropagation()}>
            <h2>🚛 Vehicle Search</h2>
            <form className="login-form" onSubmit={(e) => {
              e.preventDefault();
              setShowVehicleSearch(false);
              handleQuickAction(`Search vehicle: ${vehicleNumber}`);
              setVehicleNumber('');
            }}>
              <input 
                type="text" 
                placeholder="Enter Vehicle No. (e.g. CG04AB1234)" 
                required 
                value={vehicleNumber}
                onChange={e => setVehicleNumber(e.target.value.toUpperCase())}
                className="modal-input"
              />
              <button type="submit" className="login-submit" style={{ marginTop: '10px' }}>Search</button>
              <button type="button" className="close-modal" onClick={() => setShowVehicleSearch(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

    </div>
    </div>
  );
}

export default App;
