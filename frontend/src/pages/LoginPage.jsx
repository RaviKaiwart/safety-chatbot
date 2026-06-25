import React, { useState, useEffect } from 'react';
import './LoginPage.css';

function LoginPage({ onLogin, onBack }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  const [captchaText, setCaptchaText] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let captcha = '';
    for (let i = 0; i < 6; i++) {
      captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(captcha);
    setCaptchaInput('');
  };

  useEffect(() => {
    generateCaptcha();
  }, [isRegister]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isRegister) {
      if (!name || !email || !password) {
        setError(true);
        setErrorMsg('Please fill all required fields');
        setTimeout(() => setError(false), 3500);
        return;
      }
      if (password !== confirmPassword) {
        setError(true);
        setErrorMsg('Passwords do not match');
        setTimeout(() => setError(false), 3500);
        return;
      }
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, username: email, password, role: 'admin' })
        });
        const data = await res.json();
        
        if (res.ok) {
          setError(false);
          setSuccessMsg('Registration successful! Please login.');
          setIsRegister(false);
          setPassword('');
          setConfirmPassword('');
          setUsername(email);
          setTimeout(() => setSuccessMsg(''), 5000);
        } else {
          setError(true);
          setErrorMsg(data.error || 'Registration failed');
          setTimeout(() => setError(false), 3500);
        }
      } catch (err) {
        setError(true);
        setErrorMsg('Server connection error. Is backend running?');
        setTimeout(() => setError(false), 3500);
      }
    } else {
      if (!username || !password) return;
      
      if (captchaInput !== captchaText) {
        setError(true);
        setErrorMsg('Invalid Captcha! Please try again.');
        generateCaptcha();
        setTimeout(() => setError(false), 3500);
        return;
      }

      try {
        const res = await fetch('/api/auth/login', {
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
          generateCaptcha();
          setTimeout(() => setError(false), 3500);
        }
      } catch (err) {
        setError(true);
        setErrorMsg('Server connection error. Is backend running?');
        setTimeout(() => setError(false), 3500);
      }
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
          <h1 className="raksha-login-title">{isRegister ? "Admin Registration" : "Admin Login"}</h1>
          <p className="raksha-login-subtitle">
            {isRegister 
              ? "Create a new admin account to access the dashboard." 
              : "Sign in to access the safety operations dashboard, verify alerts, and manage system settings."}
          </p>
        </div>

        <div className="raksha-login-form">
          {successMsg && (
            <div className="raksha-login-error" style={{ background: 'rgba(63, 166, 106, 0.1)', color: '#3FA66A', border: '1px solid #3FA66A' }}>
              ✅ {successMsg}
            </div>
          )}
          {error && (
            <div className="raksha-login-error">
              ⚠️ {errorMsg}
            </div>
          )}

          {isRegister ? (
            <>
              <div className="raksha-login-field">
                <label>Name <span style={{color: 'red'}}>*</span></label>
                <div className="raksha-login-input-wrap">
                  <span className="raksha-login-icon">👤</span>
                  <input 
                    type="text" 
                    className="raksha-login-input" 
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                    required
                  />
                </div>
              </div>
              <div className="raksha-login-field">
                <label>Email <span style={{color: 'red'}}>*</span></label>
                <div className="raksha-login-input-wrap">
                  <span className="raksha-login-icon">✉️</span>
                  <input 
                    type="email" 
                    className="raksha-login-input" 
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                    required
                  />
                </div>
              </div>
            </>
          ) : (
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
          )}

          <div className="raksha-login-field">
            <label>Password {isRegister && <span style={{color: 'red'}}>*</span>}</label>
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

          {isRegister && (
            <div className="raksha-login-field">
              <label>Confirm Password <span style={{color: 'red'}}>*</span></label>
              <div className="raksha-login-input-wrap">
                <span className="raksha-login-icon">🔒</span>
                <input 
                  type={showPass ? "text" : "password"} 
                  className="raksha-login-input"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                  required
                />
              </div>
            </div>
          )}

          {!isRegister && (
            <>
              <div className="raksha-login-field" style={{ marginTop: '10px' }}>
                <label>Security Captcha</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                  <div className="raksha-captcha-display" style={{
                    background: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'40\'><rect width=\'100\' height=\'40\' fill=\'%23f0f0f0\'/><line x1=\'0\' y1=\'10\' x2=\'100\' y2=\'30\' stroke=\'%23ccc\' stroke-width=\'2\'/><line x1=\'0\' y1=\'30\' x2=\'100\' y2=\'10\' stroke=\'%23ccc\' stroke-width=\'2\'/></svg>")',
                    padding: '8px 15px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    letterSpacing: '5px',
                    color: '#333',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    userSelect: 'none',
                    fontFamily: 'monospace',
                    textDecoration: 'line-through'
                  }}>
                    {captchaText}
                  </div>
                  <button 
                    type="button" 
                    onClick={generateCaptcha}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
                    title="Reload Captcha"
                  >
                    🔄
                  </button>
                </div>
                <div className="raksha-login-input-wrap">
                  <span className="raksha-login-icon">🛡️</span>
                  <input 
                    type="text" 
                    className="raksha-login-input" 
                    placeholder="Enter captcha text"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                    required
                  />
                </div>
              </div>

              <div className="raksha-login-options">
                <label className="raksha-remember">
                  <input type="checkbox" /> Remember me
                </label>
                <a href="#" className="raksha-forgot">Forgot password?</a>
              </div>
            </>
          )}

          <button type="button" className="raksha-login-submit" onClick={handleSubmit}>
            {isRegister ? "📝 Register Account" : "🔓 Sign In to Dashboard"}
          </button>

          <div style={{ textAlign: 'center', marginTop: '15px' }}>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); setIsRegister(!isRegister); setError(false); setSuccessMsg(''); setCaptchaInput(''); }}
              style={{ color: '#F4B400', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}
            >
              {isRegister ? "Already have an account? Login here" : "Don't have an account? Register here"}
            </a>
          </div>

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
