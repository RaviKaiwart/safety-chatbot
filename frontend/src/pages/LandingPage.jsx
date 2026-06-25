import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './LandingPage.css';

const I18N = {
  en: {
    eyebrow: "AI-Based Industrial Safety Chatbot",
    title: "AI-Based Industrial Safety Assistant System",
    newchat: "+ New chat", recent: "Recent", directory: "Directory",
    departments: "Departments", documents: "Safety Documents",
    emergency: "Emergency Contacts", admin: "Admin Login",
    greeting: "Namaste. What do you need help with today?",
    greetsub: "Select a category, or type your question below in English, Hindi or Hinglish.",
    ph: "Ask anything about safety...", raise: "Raise Alert", standby: "Standby",
    "c-fire": "Fire Safety", "c-fire-q": '"Fire hone par kya kare?"',
    "c-gas": "Gas Leak", "c-gas-q": '"Gas leak hone par kya kare?"',
    "c-elec": "Electrical Hazard", "c-elec-q": '"Electric shock lagne par first aid kya hai?"',
    "c-ppe": "PPE Rules", "c-ppe-q": '"PPE mandatory hai kya?"',
    "c-aid": "First Aid", "c-aid-q": '"Helmet kyu zaruri hai?"',
    "c-contacts": "Emergency Contacts", "c-contacts-q": "Fire · Ambulance · Security · Medical",
    "c-dept": "Department Information", "c-dept-q": "Safety · Security · Medical · Maintenance",
    "c-docs": "Safety Documents", "c-docs-q": "SOPs · Manuals · Guidelines",
    toast: "Alert submitted - Officer notified via email."
  },
  hi: {
    eyebrow: "एआई-आधारित इंडस्ट्रियल सेफ्टी चैटबॉट",
    title: "एआई-आधारित औद्योगिक सुरक्षा सहायक प्रणाली",
    newchat: "+ नई चैट", recent: "हाल की चैट", directory: "डायरेक्टरी",
    departments: "विभाग", documents: "सुरक्षा दस्तावेज़",
    emergency: "आपातकालीन संपर्क", admin: "एडमिन लॉगिन",
    greeting: "नमस्ते। आज आपको किस चीज़ में मदद चाहिए?",
    greetsub: "एक श्रेणी चुनें, या नीचे अपना सवाल हिंदी, अंग्रेज़ी या हिंग्लिश में लिखें।",
    ph: "सुरक्षा से जुड़ा कोई भी सवाल पूछें...", raise: "अलर्ट भेजें", standby: "सामान्य",
    "c-fire": "अग्नि सुरक्षा", "c-fire-q": '"फायर होने पर क्या करें?"',
    "c-gas": "गैस लीक", "c-gas-q": '"गैस लीक होने पर क्या करें?"',
    "c-elec": "विद्युत खतरा", "c-elec-q": '"बिजली का झटका लगने पर फर्स्ट एड क्या है?"',
    "c-ppe": "पीपीई नियम", "c-ppe-q": '"पीपीई पहनना ज़रूरी है क्या?"',
    "c-aid": "प्राथमिक उपचार", "c-aid-q": '"हेलमेट क्यों ज़रूरी है?"',
    "c-contacts": "आपातकालीन संपर्क", "c-contacts-q": "फायर · एम्बुलेंस · सुरक्षा · मेडिकल",
    "c-dept": "विभाग जानकारी", "c-dept-q": "सुरक्षा · सिक्योरिटी · मेडिकल · मेंटेनेंस",
    "c-docs": "सुरक्षा दस्तावेज़", "c-docs-q": "एसओपी · मैनुअल · गाइडलाइंस",
    toast: "अलर्ट भेज दिया गया।"
  },
  hien: {
    eyebrow: "AI-Based Industrial Safety Chatbot",
    title: "AI-Based Industrial Safety Assistant System",
    newchat: "+ Nayi chat", recent: "Recent", directory: "Directory",
    departments: "Departments", documents: "Safety Documents",
    emergency: "Emergency Contacts", admin: "Admin Login",
    greeting: "Namaste. Aaj kis baare mein madad chahiye?",
    greetsub: "Ek category chuno, ya niche apna sawaal English, Hindi ya Hinglish mein likho.",
    ph: "Koi bhi safety sawaal pucho...", raise: "Alert Bhejein", standby: "Standby",
    "c-fire": "Fire Safety", "c-fire-q": '"Fire hone par kya kare?"',
    "c-gas": "Gas Leak", "c-gas-q": '"Gas leak hone par kya kare?"',
    "c-elec": "Electrical Hazard", "c-elec-q": '"Electric shock lagne par first aid kya hai?"',
    "c-ppe": "PPE Rules", "c-ppe-q": '"PPE mandatory hai kya?"',
    "c-aid": "First Aid", "c-aid-q": '"Helmet kyu zaruri hai?"',
    "c-contacts": "Emergency Contacts", "c-contacts-q": "Fire · Ambulance · Security · Medical",
    "c-dept": "Department Information", "c-dept-q": "Safety · Security · Medical · Maintenance",
    "c-docs": "Safety Documents", "c-docs-q": "SOPs · Manuals · Guidelines",
    toast: "Alert bhej diya gaya - Officer ko email mil gayi hai."
  }
};

const CATEGORIES = [
  { cls: "fire", titleKey: "c-fire", qKey: "c-fire-q", prompt: "Fire hone par kya kare?", tag: "Fire equipment", icon: "🔥" },
  { cls: "warn", titleKey: "c-gas", qKey: "c-gas-q", prompt: "Gas leak hone par kya kare?", tag: "Warning", icon: "⚠️" },
  { cls: "warn", titleKey: "c-elec", qKey: "c-elec-q", prompt: "Electric shock lagne par first aid kya hai?", tag: "Warning", icon: "⚡" },
  { cls: "mand", titleKey: "c-ppe", qKey: "c-ppe-q", prompt: "PPE mandatory hai kya?", tag: "Mandatory", icon: "🦺" },
  { cls: "safe", titleKey: "c-aid", qKey: "c-aid-q", prompt: "Helmet kyu zaruri hai?", tag: "Emergency", icon: "🏥" },
  { cls: "safe", titleKey: "c-contacts", qKey: "c-contacts-q", prompt: "Fire team ka contact kya hai?", tag: "Emergency", icon: "📞" },
  { cls: "info", titleKey: "c-dept", qKey: "c-dept-q", prompt: "Maintenance department ka contact kya hai?", tag: "Information", icon: "🏢" },
  { cls: "info", titleKey: "c-docs", qKey: "c-docs-q", prompt: "Evacuation procedure kya hai?", tag: "Information", icon: "📄" }
];

function LandingPage({
  onAdminClick,
  messages,
  sendMessage,
  isLoading,
  language,
  setLanguage,
  recentChats,
  clearChat,
  isRecording,
  toggleRecording,
  onAttachClick,
  capturedPhoto,
  clearPhoto,
  embedded = false
}) {
  const [chatInput, setChatInput] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [beaconActive, setBeaconActive] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [alertForm, setAlertForm] = useState({ type: 'Fire', location: '', description: '' });
  const [submittingAlert, setSubmittingAlert] = useState(false);
  const messagesEndRef = useRef(null);

  const t = I18N[language] || I18N.en;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCardClick = (prompt) => {
    sendMessage(prompt);
  };

  const handleSend = () => {
    if (chatInput.trim()) {
      sendMessage(chatInput);
      setChatInput('');
    }
  };

  const handleSubmitAlert = async () => {
    if (!alertForm.location.trim() || !alertForm.description.trim()) {
      alert('Please fill in location and description!');
      return;
    }

    setSubmittingAlert(true);

    try {
      console.log('Sending alert to backend...');

      const response = await fetch('/api/alerts/public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          category: alertForm.type,
          location: alertForm.location,
          description: alertForm.description,
          reporter: 'Anonymous Worker'
        })
      });

      const data = await response.json();
      console.log('Backend response:', data);

      if (data.success) {
        setModalOpen(false);
        setBeaconActive(true);
        setShowToast(true);

        const emailStatus = data.emailSent
          ? 'Officer has been notified via email.'
          : 'Alert saved (email pending).';

        const alertMsg = 'Alert Submitted! Type: ' + alertForm.type +
          ', Location: ' + alertForm.location +
          '. ' + emailStatus;

        sendMessage(alertMsg, true);

        setTimeout(() => setShowToast(false), 3200);
        setAlertForm({ type: 'Fire', location: '', description: '' });

        if (data.emailSent) {
          console.log('Email sent to officer!');
        } else {
          console.log('Email failed but alert saved');
        }
      } else {
        alert('Failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Network error! Make sure backend is running on port 5000.\n\nError: ' + error.message);
    } finally {
      setSubmittingAlert(false);
    }
  };

  return (
    <div className={`raksha-app ${embedded ? 'embedded-mode' : ''}`} style={embedded ? { height: '100%' } : {}}>
      {!embedded && (
        <aside className={`raksha-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="raksha-brand">
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
            <path d="M15 2 L27 7 V14 C27 21.5 22 26.5 15 28 C8 26.5 3 21.5 3 14 V7 Z" stroke="#F4B400" strokeWidth="2" fill="none" />
            <path d="M15 9 V16 M15 20 V20.3" stroke="#F4B400" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
          <div>
            <div className="raksha-brand-word">AI-BASED</div>
            <div className="raksha-brand-sub">Industrial Safety Chatbot</div>
          </div>
        </div>

        <button className="raksha-new-chat" onClick={clearChat}>
          <span style={{ fontSize: '16px' }}>+</span> {t.newchat.replace('+ ', '')}
        </button>

        <div className="raksha-side-label">{t.recent}</div>
        <ul className="raksha-side-list">
          {recentChats.map((chat, idx) => (
            <li key={idx}>
              <a href="#" onClick={(e) => {
                e.preventDefault();
                clearChat();
                setChatInput('Continued from: ' + chat);
                setSidebarOpen(false);
              }}>💬 {chat}</a>
            </li>
          ))}
        </ul>

        <div className="raksha-side-label">{t.directory}</div>
        <ul className="raksha-side-list">
          <li><a href="#" onClick={(e) => { e.preventDefault(); sendMessage("Department Info"); }}>🏢 {t.departments}</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); sendMessage("SOP Documents"); }}>📄 {t.documents}</a></li>
        </ul>

        <div style={{ flex: 1 }}></div>

        <div className="raksha-emergency-box">
          <div className="raksha-side-label" style={{ margin: '0 0 8px' }}>{t.emergency}</div>
          <div className="raksha-contact-row"><span>Fire Team</span><span className="num">101</span></div>
          <div className="raksha-contact-row"><span>Ambulance</span><span className="num">102</span></div>
          <div className="raksha-contact-row"><span>Security Control</span><span className="num">100</span></div>
        </div>

        <button className="raksha-admin-login" onClick={onAdminClick}>
          🔒 {t.admin}
        </button>
        </aside>
      )}

      <main className="raksha-main" style={embedded ? { marginLeft: 0, paddingLeft: 0, height: '100%', width: '100%' } : {}}>
        {!embedded && (
          <div className="raksha-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button className="raksha-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <div>
              <p className="raksha-eyebrow">{t.eyebrow}</p>
              <h1 className="raksha-title">{t.title}</h1>
            </div>
          </div>

          <div className="raksha-topbar-controls">
            <div className="raksha-lang-toggle">
              <button className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}>EN</button>
              <button className={language === 'hi' ? 'active' : ''} onClick={() => setLanguage('hi')}>HI</button>
              <button className={language === 'hien' ? 'active' : ''} onClick={() => setLanguage('hien')}>Hinglish</button>
            </div>
            <div className="raksha-beacon-wrap">
              <button
                className={`raksha-beacon ${beaconActive ? 'is-active' : ''}`}
                onClick={() => setModalOpen(true)}
              >
                🚨
              </button>
              <div className="raksha-beacon-label">
                <b>{t.raise}</b>
                <span>{beaconActive ? (language === 'hi' ? '1 लंबित' : '1 Pending') : t.standby}</span>
              </div>
            </div>
          </div>
        </div>
        )}

        <div className="raksha-content" style={embedded ? { paddingTop: '20px' } : {}}>
          {messages.length === 0 ? (
            <>
              <div className="raksha-greeting">
                <h2>{t.greeting}</h2>
                <p>{t.greetsub}</p>
              </div>

              <div className="raksha-legend">
                <span><i style={{ background: '#E2483D' }}></i>Fire equipment</span>
                <span><i style={{ background: '#F4B400' }}></i>Warning</span>
                <span><i style={{ background: '#3E8FD0' }}></i>Mandatory (PPE)</span>
                <span><i style={{ background: '#3FA66A' }}></i>Emergency / safe condition</span>
                <span><i style={{ background: '#8A93A6' }}></i>Information</span>
              </div>

              <div className="raksha-grid">
                {CATEGORIES.map((cat, i) => (
                  <button
                    key={i}
                    className="raksha-card"
                    data-cls={cat.cls}
                    onClick={() => handleCardClick(cat.prompt)}
                  >
                    <div className="raksha-card-badge">{cat.icon}</div>
                    <span className="raksha-class-tag">{cat.tag}</span>
                    <h3>{t[cat.titleKey]}</h3>
                    <p>{t[cat.qKey]}</p>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="raksha-chat-history">
              {messages.map((msg, idx) => (
                <div key={idx} className={`raksha-msg ${msg.sender === 'user' ? 'user' : 'bot'} ${msg.isEmergency ? 'emergency' : ''}`}>
                  <div className="raksha-avatar">
                    {msg.sender === 'user' ? 'U' : 'AI'}
                  </div>
                  <div className="raksha-msg-content">
                    {msg.sender === 'user' ? (
                      <div style={{ whiteSpace: 'pre-wrap' }}>
                        {msg.photo && <img src={msg.photo} alt="Attached" style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '8px' }} />}
                        {msg.text}
                      </div>
                    ) : (
                      <div className="markdown-body">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                      </div>
                    )}

                    {msg.hindiSubtitle && (
                      <div className="hindi-subtitle" style={{ marginTop: '10px', fontSize: '0.9em', color: 'var(--paper-dim)' }}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.hindiSubtitle}</ReactMarkdown>
                      </div>
                    )}

                    {msg.suggestions && (
                      <div className="suggestion-chips" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                        {msg.suggestions.map((sug, i) => (
                          <button
                            key={i}
                            style={{ background: 'var(--panel-2)', border: '1px solid var(--line)', color: 'var(--paper)', padding: '6px 12px', borderRadius: '16px', fontSize: '12px', cursor: 'pointer' }}
                            onClick={() => handleCardClick(sug)}
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    )}

                    {msg.alertCreated && (
                      <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#3FA66A', fontWeight: 'bold' }}>
                        ✅ Alert Registered & Email Sent to Officer
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="raksha-msg bot">
                  <div className="raksha-avatar">AI</div>
                  <div className="raksha-msg-content raksha-loading-dots">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="raksha-composer-dock">
          {capturedPhoto && (
            <div style={{ padding: '8px 12px 0 12px', maxWidth: '1080px', margin: '0 auto' }}>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: '10px' }}>
                <img src={capturedPhoto} alt="Captured" style={{ height: '80px', borderRadius: '8px', border: '1px solid var(--line)' }} />
                <button
                  onClick={clearPhoto}
                  style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--alert)', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}
                >
                  ✕
                </button>
              </div>
            </div>
          )}
          <div className="raksha-composer">
            <button className="raksha-circle-btn" onClick={onAttachClick}>📎</button>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t.ph}
            />
            <button className={`raksha-circle-btn ${isRecording ? 'active' : ''}`} onClick={toggleRecording}>
              {isRecording ? '⏹' : '🎤'}
            </button>
            <button className="raksha-circle-btn send" onClick={handleSend}>➤</button>
          </div>
        </div>
      </main>

      {modalOpen && (
        <div className="raksha-modal-veil" onClick={(e) => {
          if (e.target === e.currentTarget && !submittingAlert) {
            setModalOpen(false);
          }
        }}>
          <div className="raksha-modal">
            <h3>🚨 Report an Emergency</h3>
            <p className="raksha-modal-sub">This alert will be sent to officer via email for verification.</p>

            <div className="raksha-field">
              <label>Alert Type *</label>
              <select
                value={alertForm.type}
                onChange={(e) => setAlertForm({ ...alertForm, type: e.target.value })}
                disabled={submittingAlert}
              >
                <option>Fire</option>
                <option>Gas Leak</option>
                <option>Accident</option>
                <option>Electrical Hazard</option>
              </select>
            </div>
            <div className="raksha-field">
              <label>Location *</label>
              <input
                type="text"
                placeholder="e.g. Block C, Floor 2"
                value={alertForm.location}
                onChange={(e) => setAlertForm({ ...alertForm, location: e.target.value })}
                disabled={submittingAlert}
              />
            </div>
            <div className="raksha-field">
              <label>Description *</label>
              <textarea
                placeholder="Briefly describe what's happening"
                value={alertForm.description}
                onChange={(e) => setAlertForm({ ...alertForm, description: e.target.value })}
                disabled={submittingAlert}
                rows={3}
              />
            </div>

            <div className="raksha-modal-actions">
              <button
                className="raksha-btn-secondary"
                onClick={() => setModalOpen(false)}
                disabled={submittingAlert}
              >
                Cancel
              </button>
              <button
                className="raksha-btn-primary"
                onClick={handleSubmitAlert}
                disabled={submittingAlert}
                style={{ opacity: submittingAlert ? 0.6 : 1 }}
              >
                {submittingAlert ? 'Sending...' : 'Submit Alert'}
              </button>
            </div>

            <div style={{
              marginTop: '14px',
              padding: '10px 12px',
              background: 'var(--panel-2)',
              borderRadius: '8px',
              border: '1px dashed var(--line)',
              fontSize: '11.5px',
              color: 'var(--paper-dim)'
            }}>
              <strong style={{ color: 'var(--caution)' }}>ℹ️ Workflow:</strong> Alert → Email to Officer → Officer Approves/Rejects → Department Notified
            </div>
          </div>
        </div>
      )}

      {showToast && <div className="raksha-toast show">{t.toast}</div>}
    </div>
  );
}

export default LandingPage;