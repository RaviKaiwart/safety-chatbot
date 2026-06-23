import React, { useState } from 'react';
import './LoginPage.css';

function LoginPage({ onLogin, onBack }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return;

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      
      if (res.ok) {
        setError(false);
        onLogin(data.token, data.username);
      } else {
        setError(true);
        setErrorMsg(data.error || 'Login failed');
        setTimeout(() => setError(false), 3500);
      }
    } catch (err) {
      setError(true);
      setErrorMsg('Server connection error. Is backend running?');
      setTimeout(() => setError(false), 3500);
    }
  };

  return (
    <div className="raksha-login-page">
      <div className="raksha-login-orb orb-1"></div>
      <div className="raksha-login-orb orb-2"></div>

      <div className="raksha-login-container">
        <div className="raksha-login-brand">
          <svg width="36" height="36" viewBox="0 0 30 30" fill="none">
            <path d="M15 2 L27 7 V14 C27 21.5 22 26.5 15 28 C8 26.5 3 21.5 3 14 V7 Z" stroke="#F4B400" strokeWidth="2" fill="none"/>
            <path d="M15 9 V16 M15 20 V20.3" stroke="#F4B400" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
          <div>
            <div className="raksha-login-word">AI-BASED</div>
            <div className="raksha-login-sub">Industrial Safety Chatbot</div>
          </div>
        </div>

        <div className="raksha-login-header">
          <div className="raksha-login-eyebrow">SECURE ACCESS</div>
          <h1 className="raksha-login-title">Admin Login</h1>
          <p className="raksha-login-subtitle">Sign in to access the safety operations dashboard, verify alerts, and manage system settings.</p>
        </div>

        {/* Note: changed to div to prevent password manager reload issues we fixed earlier */}
        <div className="raksha-login-form">
          {error && (
            <div className="raksha-login-error">
              ⚠️ {errorMsg}
            </div>
          )}

          <div className="raksha-login-field">
            <label>Username / Email</label>
            <div className="raksha-login-input-wrap">
              <span className="raksha-login-icon">👤</span>
              <input 
                type="text" 
                className="raksha-login-input" 
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                required
              />
            </div>
          </div>

          <div className="raksha-login-field">
            <label>Password</label>
            <div className="raksha-login-input-wrap">
              <span className="raksha-login-icon">🔒</span>
              <input 
                type={showPass ? "text" : "password"} 
                className="raksha-login-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                required
              />
              <button 
                type="button" 
                className="raksha-toggle-pass"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="raksha-login-options">
            <label className="raksha-remember">
              <input type="checkbox" /> Remember me
            </label>
            <a href="#" className="raksha-forgot">Forgot password?</a>
          </div>

          <button type="button" className="raksha-login-submit" onClick={handleSubmit}>
            🔓 Sign In to Dashboard
          </button>

          <div className="raksha-login-divider">OR</div>

          <button type="button" className="raksha-login-back" onClick={onBack}>
            ← Back to Safety Assistant
          </button>
        </div>

        <div className="raksha-login-footer">
          <div>This is a restricted access portal.</div>
          <div>Unauthorized access is strictly prohibited.</div>
          <div className="raksha-credits">AI-BASED INDUSTRIAL SAFETY CHATBOT · v1.0</div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
