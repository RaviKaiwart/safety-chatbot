import React, { useState, useEffect } from "react";



const NAV_ITEMS = [
  { icon: "📊", label: "Dashboard", section: "main" },
  { icon: "📞", label: "Contacts", section: "manage" },
  { icon: "🏢", label: "Departments", section: "manage" },
  { icon: "🛡️", label: "Safety Rules", section: "manage" },
  { icon: "📄", label: "Smart Entry", section: "manage" },
];

export default function AdminDashboard({ token, currentUser, onBackToChat, onLogout }) {
  const [activeNav, setActiveNav] = useState("Dashboard");

  // Data states
  const [alerts, setAlerts] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [rules, setRules] = useState([]);

  // Form states
  const [docForm, setDocForm] = useState({ title: '', category: '', link: '', content: '' });
  const [contactForm, setContactForm] = useState({ name: '', title: '', contactNumber: '' });
  const [deptForm, setDeptForm] = useState({ name: '', details: '', contactNumber: '', email: '' });
  const [ruleForm, setRuleForm] = useState({ category: 'fire', title: '', content: '' });

  // Edit IDs
  const [editingId, setEditingId] = useState(null);

  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: "admin", text: "Aaj kitne fire alerts aaye hain?" },
    { role: "ai", text: "Dashboard check karke main bata sakta hoon." },
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeNav]);

  const fetchData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      if (activeNav === 'Dashboard') {
        const res = await fetch('http://localhost:5000/api/alerts', { headers });
        const data = await res.json();
        setAlerts(Array.isArray(data) ? data : []);
      } else if (activeNav === 'Smart Entry') {
        const res = await fetch('http://localhost:5000/api/documents', { headers });
        const data = await res.json();
        setDocuments(Array.isArray(data) ? data : []);
      } else if (activeNav === 'Contacts') {
        const res = await fetch('http://localhost:5000/api/contacts', { headers });
        const data = await res.json();
        setContacts(Array.isArray(data) ? data : []);
      } else if (activeNav === 'Departments') {
        const res = await fetch('http://localhost:5000/api/departments', { headers });
        const data = await res.json();
        setDepartments(Array.isArray(data) ? data : []);
      } else if (activeNav === 'Safety Rules') {
        const res = await fetch('http://localhost:5000/api/safetyrules', { headers });
        const data = await res.json();
        setRules(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Fetch error:', e);
    }
  };

  const pendingAlerts = alerts.filter((a) => a.status === "Pending");
  const verifiedAlerts = alerts.filter((a) => a.status === "Verified");
  const fireCount = alerts.filter((a) => a.category === "Fire").length;

  // Dynamic Chart Calculations
  const gasCount = alerts.filter((a) => a.category === "Gas Leak").length;
  const electricCount = alerts.filter((a) => a.category === "Electrical Hazard").length;
  const otherCount = alerts.length - (fireCount + gasCount + electricCount);
  const totalCount = alerts.length || 1; // avoid division by zero

  const C = 2 * Math.PI * 28; // Circumference ≈ 176
  const fireDash = (fireCount / totalCount) * C;
  const gasDash = (gasCount / totalCount) * C;
  const electricDash = (electricCount / totalCount) * C;
  const otherDash = (otherCount / totalCount) * C;

  const fireOffset = 0;
  const gasOffset = -fireDash;
  const electricOffset = gasOffset - gasDash;
  const otherOffset = electricOffset - electricDash;

  const last7Days = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0,0,0,0);
    return d;
  });

  const weeklyLabels = last7Days.map(d => d.toLocaleDateString('en-US', { weekday: 'short' }));
  const weeklyData = last7Days.map(day => {
    const nextDay = new Date(day);
    nextDay.setDate(nextDay.getDate() + 1);
    return alerts.filter(a => {
      const d = new Date(a.timestamp);
      return d >= day && d < nextDay;
    }).length;
  });

  // Verification operations
  const handleVerifyAlert = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:5000/api/alerts/${id}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const crudSubmit = async (e, endpoint, formState, setFormState, emptyForm) => {
    e.preventDefault();
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
    try {
      if (editingId) {
        await fetch(`http://localhost:5000/api/${endpoint}/${editingId}`, { method: 'PUT', headers, body: JSON.stringify(formState) });
      } else {
        await fetch(`http://localhost:5000/api/${endpoint}`, { method: 'POST', headers, body: JSON.stringify(formState) });
      }
      setFormState(emptyForm);
      setEditingId(null);
      fetchData();
    } catch (e) { console.error(e); }
  };

  const crudDelete = async (endpoint, id) => {
    try {
      await fetch(`http://localhost:5000/api/${endpoint}/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      fetchData();
    } catch (e) { console.error(e); }
  };

  // Edit Handlers
  const startEditDocument = (doc) => { setEditingId(doc._id); setDocForm({ title: doc.title, category: doc.category, link: doc.link, content: doc.content || '' }); };
  const startEditContact = (c) => { setEditingId(c._id); setContactForm({ name: c.name, title: c.title, contactNumber: c.contactNumber }); };
  const startEditDept = (d) => { setEditingId(d._id); setDeptForm({ name: d.name, details: d.details, contactNumber: d.contactNumber, email: d.email }); };
  const startEditRule = (r) => { setEditingId(r._id); setRuleForm({ category: r.category, title: r.title, content: r.content }); };

  const cancelEdit = () => {
    setEditingId(null);
    setDocForm({ title: '', category: '', link: '', content: '' });
    setContactForm({ name: '', title: '', contactNumber: '' });
    setDeptForm({ name: '', details: '', contactNumber: '', email: '' });
    setRuleForm({ category: 'fire', title: '', content: '' });
  };

  async function handleChat() {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatHistory((prev) => [...prev, { role: "admin", text: userMsg }]);
    setAiLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          userMsg,
          messages: chatHistory,
          contextStats: { pending: pendingAlerts.length, verified: verifiedAlerts.length, fire: fireCount }
        }),
      });
      const data = await res.json();
      setChatHistory((prev) => [...prev, { role: "ai", text: data.reply || "Kuch error aa gaya." }]);
    } catch {
      setChatHistory((prev) => [...prev, { role: "ai", text: "Network error. Please try again." }]);
    }
    setAiLoading(false);
  }

  const maxBar = Math.max(...weeklyData, 5);

  const styles = {
    app: {
      display: "flex", height: "100vh", background: "#1a1a2e",
      fontFamily: "'Inter', 'Segoe UI', sans-serif", fontSize: "13px", color: "#c0c0e0",
      position: "fixed", top: 0, left: 0, width: "100vw", zIndex: 1000 // Overrides normal page flow
    },
    sidebar: {
      width: "210px", background: "#12121e", borderRight: "1px solid #2a2a3e",
      display: "flex", flexDirection: "column", flexShrink: 0,
    },
    logoArea: {
      padding: "14px 16px", borderBottom: "1px solid #2a2a3e",
      display: "flex", alignItems: "center", gap: "10px",
    },
    logoDot: { width: "9px", height: "9px", borderRadius: "50%", background: "#e24b4a", flexShrink: 0 },
    logoText: { fontSize: "13px", fontWeight: 600, color: "#e0e0f0" },
    logoSub: { fontSize: "9px", color: "#5a5a7a", marginTop: "1px" },
    nav: { padding: "8px", flex: 1, overflowY: "auto" },
    navLabel: { fontSize: "9px", color: "#4a4a6a", padding: "10px 8px 4px", letterSpacing: ".07em" },
    navItem: (active) => ({
      display: "flex", alignItems: "center", gap: "8px", padding: "7px 9px",
      borderRadius: "8px", cursor: "pointer", marginBottom: "1px",
      background: active ? "#1f1f38" : "transparent",
      color: active ? "#c0c0e0" : "#7070a0",
      border: active ? "0.5px solid #3a3a5e" : "0.5px solid transparent",
      transition: "all .15s",
    }),
    badge: {
      marginLeft: "auto", fontSize: "9px", padding: "1px 6px", borderRadius: "6px",
      background: "#2a1010", color: "#e24b4a", border: "0.5px solid #4a1a1a",
    },
    sidebarBottom: { padding: "10px", borderTop: "1px solid #2a2a3e" },
    adminBtn: {
      display: "flex", alignItems: "center", gap: "8px", background: "#1a1a2e",
      border: "0.5px solid #3a3a5e", borderRadius: "8px", padding: "8px 10px",
      color: "#7070a0", width: "100%", cursor: "pointer",
    },
    main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#1a1a2e" },
    topbar: {
      display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px",
      borderBottom: "1px solid #2a2a3e", background: "#12121e", flexShrink: 0,
    },
    topbarTitle: { fontSize: "14px", fontWeight: 600, color: "#e0e0f0", flex: 1 },
    accentText: { color: "#6c63ff" },
    searchWrap: {
      display: "flex", alignItems: "center", gap: "6px", background: "#1a1a2e",
      border: "0.5px solid #3a3a5e", borderRadius: "8px", padding: "5px 10px",
      width: "210px", color: "#4a4a6a", fontSize: "11px",
    },
    aiReportBtn: {
      display: "flex", alignItems: "center", gap: "5px", background: "#2a1f4e",
      border: "1px solid #534AB7", borderRadius: "8px", padding: "5px 11px",
      color: "#AFA9EC", fontSize: "11px", cursor: "pointer", whiteSpace: "nowrap",
    },
    langBtn: {
      display: "flex", alignItems: "center", gap: "4px", background: "#1a1a2e",
      border: "0.5px solid #3a3a5e", borderRadius: "8px", padding: "5px 8px",
      color: "#7070a0", fontSize: "10px", cursor: "pointer",
    },
    avatar: {
      width: "30px", height: "30px", borderRadius: "50%", background: "#6c63ff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "13px", color: "#fff", fontWeight: 600, flexShrink: 0, cursor: "pointer"
    },
    content: {
      flex: 1, overflowY: "auto", padding: "14px 16px",
      display: "flex", flexDirection: "column", gap: "12px",
    },
    statRow: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px" },
    stat: {
      background: "#12121e", border: "0.5px solid #2a2a3e",
      borderRadius: "10px", padding: "11px 13px",
    },
    statLbl: { fontSize: "10px", color: "#5a5a7a", marginBottom: "5px" },
    statVal: (color) => ({
      fontSize: "24px", fontWeight: 700,
      color: { red: "#e24b4a", green: "#1d9e75", amber: "#ef9f27" }[color],
    }),
    statTrend: { fontSize: "9px", color: "#4a4a6a", marginTop: "2px" },
    row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
    row3: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px", marginBottom: "12px" },
    card: {
      background: "#12121e", border: "0.5px solid #2a2a3e",
      borderRadius: "10px", padding: "12px",
    },
    cardHead: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" },
    cardTitle: { fontSize: "12px", fontWeight: 600, color: "#c0c0e0" },
    tag: (type) => {
      const map = {
        danger: { bg: "#2a1010", color: "#e24b4a", border: "#4a1a1a" },
        warn:   { bg: "#251a08", color: "#ef9f27", border: "#3a2808" },
        ok:     { bg: "#0a1e14", color: "#1d9e75", border: "#0a2e1a" },
        ai:     { bg: "#1a1535", color: "#7F77DD", border: "#3a2a6e" },
      };
      const t = map[type] || map.ai;
      return {
        fontSize: "9px", padding: "2px 7px", borderRadius: "6px",
        background: t.bg, color: t.color, border: `0.5px solid ${t.border}`,
      };
    },
    alertRow: {
      display: "flex", alignItems: "center", gap: "8px",
      padding: "7px 0", borderBottom: "0.5px solid #1f1f35",
    },
    alertIcon: (type) => {
      const map = { Fire: "#2a1010", "Gas Leak": "#251a08", "Electrical Hazard": "#0a1525", Accident: "#1a1a2e" };
      return {
        width: "28px", height: "28px", borderRadius: "7px",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "14px", flexShrink: 0, background: map[type] || "#1a1a2e",
      };
    },
    alertLoc: { fontSize: "11px", fontWeight: 500, color: "#c0c0e0" },
    alertTime: { fontSize: "9px", color: "#4a4a6a", marginTop: "1px" },
    btnV: {
      background: "#0a1e14", color: "#1d9e75", border: "0.5px solid #0a2e1a",
      borderRadius: "6px", padding: "3px 8px", fontSize: "10px", cursor: "pointer",
    },
    btnR: {
      background: "#2a1010", color: "#e24b4a", border: "0.5px solid #4a1a1a",
      borderRadius: "6px", padding: "3px 8px", fontSize: "10px", cursor: "pointer",
    },
    aiPanel: {
      background: "#12121e", border: "1px solid #3a2a6e",
      borderRadius: "10px", padding: "12px",
    },
    aiPanelHead: { display: "flex", alignItems: "center", gap: "7px", marginBottom: "8px" },
    aiText: { fontSize: "11px", color: "#8888cc", lineHeight: 1.7 },
    aiWarning: {
      background: "#251018", border: "0.5px solid #6a2020",
      borderRadius: "7px", padding: "7px 10px", marginTop: "8px",
      fontSize: "10px", color: "#e24b4a", display: "flex", alignItems: "center", gap: "6px",
    },
    chatQ: {
      background: "#1f1f38", borderRadius: "8px", padding: "7px 10px",
      fontSize: "11px", color: "#8888aa", lineHeight: 1.5, marginBottom: "6px",
    },
    chatA: {
      background: "#1a1535", border: "0.5px solid #3a2a6e",
      borderRadius: "8px", padding: "7px 10px",
      fontSize: "11px", color: "#AFA9EC", lineHeight: 1.5, marginBottom: "7px",
    },
    chatInputRow: { display: "flex", gap: "6px" },
    chatInput: {
      flex: 1, background: "#1a1a2e", border: "0.5px solid #3a3a5e",
      borderRadius: "7px", padding: "6px 10px", fontSize: "11px",
      color: "#c0c0e0", outline: "none",
    },
    chatSend: {
      background: "#2a1f4e", border: "1px solid #534AB7",
      borderRadius: "7px", padding: "6px 12px",
      fontSize: "11px", color: "#AFA9EC", cursor: "pointer",
    },
    // CRUD Styles
    crudInput: { background: "#1a1a2e", border: "1px solid #3a3a5e", borderRadius: "6px", padding: "8px 10px", color: "#c0c0e0", flex: 1, fontSize: "12px" },
    crudTable: { width: "100%", borderCollapse: "collapse", marginTop: "16px" },
    crudTh: { textAlign: "left", padding: "10px 8px", borderBottom: "1px solid #3a3a5e", color: "#7070a0", fontSize: "11px" },
    crudTd: { padding: "10px 8px", borderBottom: "1px solid #2a2a3e", fontSize: "12px", color: "#c0c0e0" },
    crudEditBtn: { background: "#1f1f38", color: "#7F77DD", border: "1px solid #3a2a6e", borderRadius: "4px", padding: "4px 8px", cursor: "pointer", marginRight: "6px" },
    crudDelBtn: { background: "#2a1010", color: "#e24b4a", border: "1px solid #4a1a1a", borderRadius: "4px", padding: "4px 8px", cursor: "pointer" }
  };

  return (
    <div style={styles.app}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.logoArea}>
          <div style={styles.logoDot} />
          <div>
            <div style={styles.logoText}>SafetyOps</div>
            <div style={styles.logoSub}>Admin Panel · {currentUser}</div>
          </div>
        </div>

        <div style={styles.nav}>
          {["main", "manage"].map((section) => (
            <div key={section}>
              <div style={styles.navLabel}>
                {{ main: "MAIN", manage: "MANAGE" }[section]}
              </div>
              {NAV_ITEMS.filter((n) => n.section === section).map((item) => (
                <div
                  key={item.label}
                  style={styles.navItem(activeNav === item.label)}
                  onClick={() => { setActiveNav(item.label); cancelEdit(); }}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                  {item.label === "Dashboard" && pendingAlerts.length > 0 && (
                    <span style={styles.badge}>{pendingAlerts.length}</span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={styles.sidebarBottom}>
          <button style={styles.adminBtn} onClick={onBackToChat}>
            ◀
            <div style={{ textAlign: "left" }}>
              <span style={{ display: "block", fontSize: "11px", color: "#c0c0e0" }}>Back to Chat</span>
              <small style={{ fontSize: "9px", color: "#4a4a6a" }}>चैट पर वापस जाएँ</small>
            </div>
          </button>
          <button 
            style={{ ...styles.adminBtn, marginTop: "8px", border: "0.5px solid rgba(239, 68, 68, 0.3)", color: "#fca5a5", background: "rgba(239, 68, 68, 0.05)" }} 
            onClick={onLogout}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            <div style={{ textAlign: "left" }}>
              <span style={{ display: "block", fontSize: "11px", color: "#fca5a5" }}>Logout Admin</span>
            </div>
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={styles.main}>
        {/* Topbar */}
        <div style={styles.topbar}>
          <div style={styles.topbarTitle}>
            AI-Based Industrial Safety <span style={styles.accentText}>Chatbot</span>
          </div>
          <div style={styles.searchWrap}>🔍 "Search database..."</div>
          <button style={styles.aiReportBtn}>✨ Gemini Analytics</button>
          <div style={styles.langBtn}>🌐 EN/HI ▾</div>
          <div style={styles.avatar} onClick={onBackToChat}>X</div>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {activeNav === "Dashboard" && (
            <>
              {/* Stats */}
              <div style={styles.statRow}>
                {[
                  { lbl: "Pending Alerts", val: pendingAlerts.length, color: "red", trend: "+2 aaj" },
                  { lbl: "Verified Today", val: verifiedAlerts.length, color: "green", trend: "Database Sync" },
                  { lbl: "Fire Incidents", val: fireCount, color: "amber", trend: "Total Logged" },
                ].map((s) => (
                  <div key={s.lbl} style={styles.stat}>
                    <div style={styles.statLbl}>{s.lbl}</div>
                    <div style={styles.statVal(s.color)}>{s.val}</div>
                    <div style={styles.statTrend}>{s.trend}</div>
                  </div>
                ))}
              </div>

              {/* Alert + Chart */}
              <div style={styles.row2}>
                {/* Alerts */}
                <div style={styles.card}>
                  <div style={styles.cardHead}>
                    <span style={styles.cardTitle}>🚨 Alert Verification</span>
                    <span style={styles.tag("danger")}>{pendingAlerts.length} pending</span>
                  </div>
                  {pendingAlerts.map((a) => (
                    <div key={a._id} style={styles.alertRow}>
                      <div style={styles.alertIcon(a.category)}>
                        {a.category === 'Fire' ? '🔥' : a.category === 'Gas Leak' ? '💧' : a.category === 'Electrical Hazard' ? '⚡' : '⚠️'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={styles.alertLoc}>{a.category} — {a.location}</div>
                        <div style={styles.alertTime}>{new Date(a.timestamp).toLocaleString()} · {a.reporter}</div>
                      </div>
                      <button style={styles.btnV} onClick={() => handleVerifyAlert(a._id, 'Verified')}>✓ Verify</button>
                      <button style={styles.btnR} onClick={() => handleVerifyAlert(a._id, 'Rejected')}>✗</button>
                    </div>
                  ))}
                  {pendingAlerts.length === 0 && (
                    <div style={{ textAlign: "center", color: "#1d9e75", padding: "16px", fontSize: "12px" }}>
                      ✓ Saare alerts verify ho gaye!
                    </div>
                  )}
                </div>

                {/* Chart */}
                <div style={styles.card}>
                  <div style={styles.cardHead}>
                    <span style={styles.cardTitle}>📈 Alert Breakdown</span>
                    <span style={styles.tag("ai")}>Live · Visual</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "10px" }}>
                    <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="40" cy="40" r="28" fill="none" stroke="#12121e" strokeWidth="16" />
                      {fireCount > 0 && <circle cx="40" cy="40" r="28" fill="none" stroke="#e24b4a" strokeWidth="16" strokeDasharray={`${fireDash} ${C}`} strokeDashoffset={fireOffset} />}
                      {gasCount > 0 && <circle cx="40" cy="40" r="28" fill="none" stroke="#ef9f27" strokeWidth="16" strokeDasharray={`${gasDash} ${C}`} strokeDashoffset={gasOffset} />}
                      {electricCount > 0 && <circle cx="40" cy="40" r="28" fill="none" stroke="#378add" strokeWidth="16" strokeDasharray={`${electricDash} ${C}`} strokeDashoffset={electricOffset} />}
                      {otherCount > 0 && <circle cx="40" cy="40" r="28" fill="none" stroke="#1d9e75" strokeWidth="16" strokeDasharray={`${otherDash} ${C}`} strokeDashoffset={otherOffset} />}
                    </svg>
                    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                      {[["#e24b4a","Fire"],["#ef9f27","Gas Leak"],["#378add","Electrical"],["#1d9e75","Other"]].map(([c,l]) => (
                        <div key={l} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "10px", color: "#7070a0" }}>
                          <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: c, flexShrink: 0 }} />
                          {l}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: "60px" }}>
                    {weeklyData.map((v, i) => (
                      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
                        <div style={{ width: "100%", borderRadius: "3px 3px 0 0", background: "#e24b4a", opacity: 0.75, height: `${Math.round((v / maxBar) * 55)}px`, minHeight: "4px", transition: 'height 0.3s ease' }} />
                        <span style={{ fontSize: "9px", color: "#4a4a6a" }}>{weeklyLabels[i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Analytics & AI Row */}
              <div style={styles.row3}>
                {/* Alert Status Overview */}
                <div style={{...styles.card, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                  <div style={styles.cardHead}>
                    <span style={styles.cardTitle}>📊 Alert Status Distribution</span>
                    <span style={styles.tag("ai")}>Real-time Progress</span>
                  </div>
                  
                  {/* Progress Bar representation */}
                  <div style={{ marginBottom: "20px", marginTop: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#7070a0", marginBottom: "8px" }}>
                      <span>Resolution Progress</span>
                      <span>{verifiedAlerts.length} / {totalCount} Verified</span>
                    </div>
                    <div style={{ width: "100%", height: "12px", background: "#2a2a3e", borderRadius: "6px", overflow: "hidden", display: "flex" }}>
                      <div style={{ width: `${(verifiedAlerts.length / totalCount) * 100}%`, background: "#1d9e75", transition: "width 0.5s" }} title="Verified" />
                      <div style={{ width: `${(pendingAlerts.length / totalCount) * 100}%`, background: "#e24b4a", transition: "width 0.5s" }} title="Pending" />
                      <div style={{ width: `${((totalCount - verifiedAlerts.length - pendingAlerts.length) / totalCount) * 100}%`, background: "#5a5a7a", transition: "width 0.5s" }} title="Rejected/Other" />
                    </div>
                    <div style={{ display: "flex", gap: "10px", marginTop: "8px", fontSize: "9px", color: "#7070a0" }}>
                      <div style={{display:'flex', alignItems:'center', gap:'4px'}}><div style={{width:'6px', height:'6px', background:'#1d9e75', borderRadius:'50%'}}></div> Verified</div>
                      <div style={{display:'flex', alignItems:'center', gap:'4px'}}><div style={{width:'6px', height:'6px', background:'#e24b4a', borderRadius:'50%'}}></div> Pending</div>
                      <div style={{display:'flex', alignItems:'center', gap:'4px'}}><div style={{width:'6px', height:'6px', background:'#5a5a7a', borderRadius:'50%'}}></div> Rejected</div>
                    </div>
                  </div>

                  {/* 7-Day Line Trend Graph */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                    <div style={{ fontSize: "10px", color: "#7070a0", marginBottom: "8px" }}>7-Day Alert Trend</div>
                    <svg width="100%" height="60" viewBox="0 0 100 60" preserveAspectRatio="none" style={{ overflow: "visible" }}>
                      <polyline 
                        fill="none" 
                        stroke="#6c63ff" 
                        strokeWidth="2" 
                        points={weeklyData.map((val, idx) => {
                          const x = (idx / (weeklyData.length - 1 || 1)) * 100;
                          const y = 60 - ((val / (maxBar || 1)) * 50) - 5;
                          return `${x},${y}`;
                        }).join(' ')} 
                      />
                      {weeklyData.map((val, idx) => {
                        const x = (idx / (weeklyData.length - 1 || 1)) * 100;
                        const y = 60 - ((val / (maxBar || 1)) * 50) - 5;
                        return <circle key={idx} cx={x} cy={y} r="2.5" fill="#6c63ff" />;
                      })}
                    </svg>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
                      {weeklyLabels.map((lbl, idx) => (
                        <span key={idx} style={{ fontSize: "8px", color: "#4a4a6a" }}>{lbl}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI Risk Panel */}
                <div style={{...styles.aiPanel, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                  <div style={styles.aiPanelHead}>
                    <span style={{ fontSize: "15px" }}>✨</span>
                    <span style={{ fontSize: "11px", fontWeight: 600, color: "#AFA9EC", flex: 1 }}>
                      AI Risk Analysis — Auto-generated by Gemini
                    </span>
                    <span style={styles.tag("ai")}>Risk Detected</span>
                  </div>
                  <div style={styles.aiText}>
                    {fireCount > 0 ? "Fire incidents database me report ho rahe hain. Plant me fire safety audits and evacuation drills conduct karna recommended hai. Safety guidelines aur PPE rules check karte rahein." : "No critical recurring risks identified recently. Continue monitoring safety protocols."}
                  </div>
                  <div style={styles.aiWarning}>
                    ⚠️ High Priority: Review Pending Alerts regularly.
                  </div>
                </div>
              </div>

              {/* AI Chat */}
              <div style={styles.card}>
                <div style={styles.cardHead}>
                  <span style={styles.cardTitle}>✨ Gemini Assistant — Safety & Alert Queries</span>
                  <span style={styles.tag("ai")}>Hinglish · Backend Sync</span>
                </div>
                <div style={{ maxHeight: "160px", overflowY: "auto", marginBottom: "8px" }}>
                  {chatHistory.map((m, i) => (
                    <div key={i} style={m.role === "admin" ? styles.chatQ : styles.chatA}>
                      <strong style={{ color: m.role === "admin" ? "#7070a0" : "#AFA9EC" }}>
                        {m.role === "admin" ? "Admin: " : "Gemini: "}
                      </strong>
                      {m.text}
                    </div>
                  ))}
                  {aiLoading && (
                    <div style={styles.chatA}>
                      <strong style={{ color: "#AFA9EC" }}>Gemini: </strong>
                      <span style={{ color: "#5a5a7a" }}>Soch raha hun...</span>
                    </div>
                  )}
                </div>
                <div style={styles.chatInputRow}>
                  <input
                    style={styles.chatInput}
                    placeholder="Safety ya alert ke baare mein kuch bhi poochein..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleChat()}
                  />
                  <button style={styles.chatSend} onClick={handleChat} disabled={aiLoading}>
                    {aiLoading ? "..." : "Send"}
                  </button>
                </div>
              </div>
            </>
          )}

          {activeNav === "Smart Entry" && (
            <div style={styles.card}>
              <div style={styles.cardHead}><span style={styles.cardTitle}>📄 Manage Safety Documents</span></div>
              <form onSubmit={(e) => crudSubmit(e, 'documents', docForm, setDocForm, { title: '', category: '', link: '', content: '' })} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <input style={styles.crudInput} type="text" placeholder="Title" value={docForm.title} onChange={e => setDocForm({...docForm, title: e.target.value})} required />
                <input style={styles.crudInput} type="text" placeholder="Category" value={docForm.category} onChange={e => setDocForm({...docForm, category: e.target.value})} required />
                <input style={styles.crudInput} type="url" placeholder="URL Link" value={docForm.link} onChange={e => setDocForm({...docForm, link: e.target.value})} required />
                <button style={styles.btnPrimary} type="submit">{editingId ? 'Update' : 'Add'}</button>
                {editingId && <button style={styles.btnDanger} type="button" onClick={cancelEdit}>Cancel</button>}
              </form>
              <table style={styles.crudTable}>
                <thead><tr><th style={styles.crudTh}>Title</th><th style={styles.crudTh}>Category</th><th style={styles.crudTh}>Link</th><th style={styles.crudTh}>Actions</th></tr></thead>
                <tbody>
                  {documents.map(d => (
                    <tr key={d._id}>
                      <td style={styles.crudTd}>{d.title}</td><td style={styles.crudTd}>{d.category}</td>
                      <td style={styles.crudTd}><a href={d.link} target="_blank" rel="noreferrer" style={{color:'#AFA9EC'}}>View</a></td>
                      <td style={styles.crudTd}>
                        <button style={styles.crudEditBtn} onClick={() => startEditDocument(d)}>Edit</button>
                        <button style={styles.crudDelBtn} onClick={() => crudDelete('documents', d._id)}>Del</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeNav === "Contacts" && (
            <div style={styles.card}>
              <div style={styles.cardHead}><span style={styles.cardTitle}>📞 Manage Emergency Contacts</span></div>
              <form onSubmit={(e) => crudSubmit(e, 'contacts', contactForm, setContactForm, { name: '', title: '', contactNumber: '' })} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <input style={styles.crudInput} type="text" placeholder="Name" value={contactForm.name} onChange={e => setContactForm({...contactForm, name: e.target.value})} required />
                <input style={styles.crudInput} type="text" placeholder="Title/Role" value={contactForm.title} onChange={e => setContactForm({...contactForm, title: e.target.value})} required />
                <input style={styles.crudInput} type="text" placeholder="Phone" value={contactForm.contactNumber} onChange={e => setContactForm({...contactForm, contactNumber: e.target.value})} required />
                <button style={styles.btnPrimary} type="submit">{editingId ? 'Update' : 'Add'}</button>
                {editingId && <button style={styles.btnDanger} type="button" onClick={cancelEdit}>Cancel</button>}
              </form>
              <table style={styles.crudTable}>
                <thead><tr><th style={styles.crudTh}>Name</th><th style={styles.crudTh}>Title</th><th style={styles.crudTh}>Contact</th><th style={styles.crudTh}>Actions</th></tr></thead>
                <tbody>
                  {contacts.map(c => (
                    <tr key={c._id}>
                      <td style={styles.crudTd}>{c.name}</td><td style={styles.crudTd}>{c.title}</td><td style={styles.crudTd}>{c.contactNumber}</td>
                      <td style={styles.crudTd}>
                        <button style={styles.crudEditBtn} onClick={() => startEditContact(c)}>Edit</button>
                        <button style={styles.crudDelBtn} onClick={() => crudDelete('contacts', c._id)}>Del</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeNav === "Departments" && (
            <div style={styles.card}>
              <div style={styles.cardHead}><span style={styles.cardTitle}>🏢 Manage Departments</span></div>
              <form onSubmit={(e) => crudSubmit(e, 'departments', deptForm, setDeptForm, { name: '', details: '', contactNumber: '', email: '' })} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <input style={styles.crudInput} type="text" placeholder="Department Name" value={deptForm.name} onChange={e => setDeptForm({...deptForm, name: e.target.value})} required />
                <input style={styles.crudInput} type="text" placeholder="Details" value={deptForm.details} onChange={e => setDeptForm({...deptForm, details: e.target.value})} required />
                <input style={styles.crudInput} type="text" placeholder="Phone" value={deptForm.contactNumber} onChange={e => setDeptForm({...deptForm, contactNumber: e.target.value})} required />
                <input style={styles.crudInput} type="email" placeholder="Email" value={deptForm.email} onChange={e => setDeptForm({...deptForm, email: e.target.value})} required />
                <button style={styles.btnPrimary} type="submit">{editingId ? 'Update' : 'Add'}</button>
                {editingId && <button style={styles.btnDanger} type="button" onClick={cancelEdit}>Cancel</button>}
              </form>
              <table style={styles.crudTable}>
                <thead><tr><th style={styles.crudTh}>Name</th><th style={styles.crudTh}>Details</th><th style={styles.crudTh}>Contact</th><th style={styles.crudTh}>Actions</th></tr></thead>
                <tbody>
                  {departments.map(d => (
                    <tr key={d._id}>
                      <td style={styles.crudTd}>{d.name}</td><td style={styles.crudTd}>{d.details}</td><td style={styles.crudTd}>{d.contactNumber}</td>
                      <td style={styles.crudTd}>
                        <button style={styles.crudEditBtn} onClick={() => startEditDept(d)}>Edit</button>
                        <button style={styles.crudDelBtn} onClick={() => crudDelete('departments', d._id)}>Del</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeNav === "Safety Rules" && (
            <div style={styles.card}>
              <div style={styles.cardHead}><span style={styles.cardTitle}>🛡️ Manage Safety Rules</span></div>
              <form onSubmit={(e) => crudSubmit(e, 'safetyrules', ruleForm, setRuleForm, { category: 'fire', title: '', content: '' })} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <select style={styles.crudInput} value={ruleForm.category} onChange={e => setRuleForm({...ruleForm, category: e.target.value})}>
                  <option value="fire">Fire</option><option value="gas">Gas</option><option value="electrical">Electrical</option><option value="ppe">PPE</option><option value="first_aid">First Aid</option>
                </select>
                <input style={styles.crudInput} type="text" placeholder="Rule Title" value={ruleForm.title} onChange={e => setRuleForm({...ruleForm, title: e.target.value})} required />
                <input style={styles.crudInput} type="text" placeholder="Content/Rule details" value={ruleForm.content} onChange={e => setRuleForm({...ruleForm, content: e.target.value})} required />
                <button style={styles.btnPrimary} type="submit">{editingId ? 'Update' : 'Add'}</button>
                {editingId && <button style={styles.btnDanger} type="button" onClick={cancelEdit}>Cancel</button>}
              </form>
              <table style={styles.crudTable}>
                <thead><tr><th style={styles.crudTh}>Category</th><th style={styles.crudTh}>Title</th><th style={styles.crudTh}>Content</th><th style={styles.crudTh}>Actions</th></tr></thead>
                <tbody>
                  {rules.map(r => (
                    <tr key={r._id}>
                      <td style={styles.crudTd}>{r.category}</td><td style={styles.crudTd}>{r.title}</td><td style={styles.crudTd}>{r.content.substring(0, 50)}...</td>
                      <td style={styles.crudTd}>
                        <button style={styles.crudEditBtn} onClick={() => startEditRule(r)}>Edit</button>
                        <button style={styles.crudDelBtn} onClick={() => crudDelete('safetyrules', r._id)}>Del</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
