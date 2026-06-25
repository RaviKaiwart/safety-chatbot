import React, { useState, useEffect } from "react";
import AnalyticsView from "./AnalyticsView";
import LandingPage from "./pages/LandingPage";



const NAV_ITEMS = [
  { icon: "📊", label: "Dashboard", section: "main" },
  { icon: "💬", label: "Chatbot", section: "main" },
  { icon: "📞", label: "Contacts", section: "manage" },
  { icon: "🏢", label: "Departments", section: "manage" },
  { icon: "🛡️", label: "Safety Rules", section: "manage" },
  { icon: "📄", label: "Smart Entry", section: "manage" },
];

export default function AdminDashboard({ 
  token, currentUser, onLogout,
  messages, sendMessage, isLoading, language, setLanguage, recentChats, clearChat, isRecording, toggleRecording, onAttachClick, capturedPhoto, clearPhoto
}) {
  const [activeNav, setActiveNav] = useState("Dashboard");

  const langKey = (language === 'hi' || language === 'hien') ? 'hi' : 'en';
  const t = (text) => {
    const dict = {
      "Dashboard": { hi: "डैशबोर्ड" },
      "Chatbot": { hi: "चैटबॉट" },
      "Contacts": { hi: "संपर्क" },
      "Departments": { hi: "विभाग" },
      "Safety Rules": { hi: "सुरक्षा नियम" },
      "Smart Entry": { hi: "स्मार्ट एंट्री" },
      "MAIN": { hi: "मुख्य" },
      "MANAGE": { hi: "प्रबंधन" },
      "Admin Panel": { hi: "एडमिन पैनल" },
      "Logout Admin": { hi: "लॉगआउट एडमिन" },
      "AI-Based Industrial Safety": { hi: "एआई-आधारित औद्योगिक सुरक्षा" },
      "Manage Safety Documents": { hi: "सुरक्षा दस्तावेज़ प्रबंधित करें" },
      "Manage Emergency Contacts": { hi: "आपातकालीन संपर्क प्रबंधित करें" },
      "Manage Departments": { hi: "विभाग प्रबंधित करें" },
      "Manage Safety Rules": { hi: "सुरक्षा नियम प्रबंधित करें" },
      "Title": { hi: "शीर्षक" },
      "Category": { hi: "श्रेणी" },
      "Link": { hi: "लिंक" },
      "Actions": { hi: "कार्रवाई" },
      "Name": { hi: "नाम" },
      "Details": { hi: "विवरण" },
      "Contact": { hi: "संपर्क" },
      "Content": { hi: "सामग्री" },
      "Add": { hi: "जोड़ें" },
      "Update": { hi: "अपडेट करें" },
      "Cancel": { hi: "रद्द करें" },
      "Edit": { hi: "संपादित करें" },
      "Delete": { hi: "हटाएं" }
    };
    return dict[text] && dict[text][langKey] ? dict[text][langKey] : text;
  };


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
      
      if (activeNav === 'Dashboard' || activeNav === 'Analytics') {
        const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/alerts', { headers });
        const data = await res.json();
        setAlerts(Array.isArray(data) ? data : []);
      } else if (activeNav === 'Smart Entry') {
        const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/documents', { headers });
        const data = await res.json();
        setDocuments(Array.isArray(data) ? data : []);
      } else if (activeNav === 'Contacts') {
        const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/contacts', { headers });
        const data = await res.json();
        setContacts(Array.isArray(data) ? data : []);
      } else if (activeNav === 'Departments') {
        const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/departments', { headers });
        const data = await res.json();
        setDepartments(Array.isArray(data) ? data : []);
      } else if (activeNav === 'Safety Rules') {
        const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/safetyrules', { headers });
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
      const res = await fetch((import.meta.env.VITE_API_URL || '') + `/api/alerts/${id}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUrlBlur = async () => {
    if (docForm.link && !docForm.title) {
      try {
        const res = await fetch('https://api.microlink.io?url=' + encodeURIComponent(docForm.link));
        const data = await res.json();
        if (data && data.data && data.data.title) {
          setDocForm(prev => ({ ...prev, title: data.data.title }));
        }
      } catch (e) { console.error("URL fetch failed", e); }
    }
  };

  const crudSubmit = async (e, endpoint, formState, setFormState, emptyForm) => {
    e.preventDefault();
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
    try {
      if (editingId) {
        await fetch((import.meta.env.VITE_API_URL || '') + `/api/${endpoint}/${editingId}`, { method: 'PUT', headers, body: JSON.stringify(formState) });
      } else {
        await fetch((import.meta.env.VITE_API_URL || '') + `/api/${endpoint}`, { method: 'POST', headers, body: JSON.stringify(formState) });
      }
      setFormState(emptyForm);
      setEditingId(null);
      fetchData();
    } catch (e) { console.error(e); }
  };

  const crudDelete = async (endpoint, id) => {
    try {
      await fetch((import.meta.env.VITE_API_URL || '') + `/api/${endpoint}/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
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
      const res = await fetch((import.meta.env.VITE_API_URL || '') + "/api/admin/chat", {
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
      display: "flex", height: "100vh", background: "#222831",
      fontFamily: "'Inter', 'Segoe UI', sans-serif", fontSize: "13px", color: "#ECE7DC",
      position: "fixed", top: 0, left: 0, width: "100vw", zIndex: 1000 // Overrides normal page flow
    },
    sidebar: {
      width: "210px", background: "#222831", borderRight: "1px solid rgba(236,231,220,0.10)",
      display: "flex", flexDirection: "column", flexShrink: 0,
    },
    logoArea: {
      padding: "14px 16px", borderBottom: "1px solid rgba(236,231,220,0.10)",
      display: "flex", alignItems: "center", gap: "10px",
    },
    logoDot: { width: "9px", height: "9px", borderRadius: "50%", background: "#e24b4a", flexShrink: 0 },
    logoText: { fontSize: "13px", fontWeight: 600, color: "#e0e0f0" },
    logoSub: { fontSize: "9px", color: "#A9A79D", marginTop: "1px" },
    nav: { padding: "8px", flex: 1, overflowY: "auto" },
    navLabel: { fontSize: "9px", color: "#A9A79D", padding: "10px 8px 4px", letterSpacing: ".07em" },
    navItem: (active) => ({
      display: "flex", alignItems: "center", gap: "8px", padding: "7px 9px",
      borderRadius: "8px", cursor: "pointer", marginBottom: "1px",
      background: active ? "rgba(236,231,220,0.05)" : "transparent",
      color: active ? "#ECE7DC" : "#A9A79D",
      border: active ? "0.5px solid rgba(236,231,220,0.10)" : "0.5px solid transparent",
      transition: "all .15s",
    }),
    badge: {
      marginLeft: "auto", fontSize: "9px", padding: "1px 6px", borderRadius: "6px",
      background: "#2a1010", color: "#e24b4a", border: "0.5px solid #4a1a1a",
    },
    sidebarBottom: { padding: "10px", borderTop: "1px solid rgba(236,231,220,0.10)" },
    adminBtn: {
      display: "flex", alignItems: "center", gap: "8px", background: "#222831",
      border: "0.5px solid rgba(236,231,220,0.10)", borderRadius: "8px", padding: "8px 10px",
      color: "#A9A79D", width: "100%", cursor: "pointer",
    },
    main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#222831" },
    topbar: {
      display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px",
      borderBottom: "1px solid rgba(236,231,220,0.10)", background: "#222831", flexShrink: 0,
    },
    topbarTitle: { fontSize: "14px", fontWeight: 600, color: "#e0e0f0", flex: 1 },
    accentText: { color: "#F4B400" },
    searchWrap: {
      display: "flex", alignItems: "center", gap: "6px", background: "#222831",
      border: "0.5px solid rgba(236,231,220,0.10)", borderRadius: "8px", padding: "5px 10px",
      width: "210px", color: "#A9A79D", fontSize: "11px",
    },
    aiReportBtn: {
      display: "flex", alignItems: "center", gap: "5px", background: "#2a1f4e",
      border: "1px solid #534AB7", borderRadius: "8px", padding: "5px 11px",
      color: "#ECE7DC", fontSize: "11px", cursor: "pointer", whiteSpace: "nowrap",
    },
    langBtn: {
      display: "flex", alignItems: "center", gap: "4px", background: "#222831",
      border: "0.5px solid rgba(236,231,220,0.10)", borderRadius: "8px", padding: "5px 8px",
      color: "#A9A79D", fontSize: "10px", cursor: "pointer",
    },
    avatar: {
      width: "30px", height: "30px", borderRadius: "50%", background: "#F4B400",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "13px", color: "#ECE7DC", fontWeight: 600, flexShrink: 0, cursor: "pointer"
    },
    content: {
      flex: 1, overflowY: "auto", padding: "14px 16px",
      display: "flex", flexDirection: "column", gap: "12px",
    },
    statRow: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px" },
    stat: {
      background: "#1B2025", border: "0.5px solid rgba(236,231,220,0.10)",
      borderRadius: "10px", padding: "11px 13px",
    },
    statLbl: { fontSize: "10px", color: "#A9A79D", marginBottom: "5px" },
    statVal: (color) => ({
      fontSize: "24px", fontWeight: 700, fontFamily: "'Oswald', sans-serif",
      color: { red: "#e24b4a", green: "#1d9e75", amber: "#ef9f27" }[color],
    }),
    statTrend: { fontSize: "9px", color: "#A9A79D", marginTop: "2px" },
    row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
    row3: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px", marginBottom: "12px" },
    card: {
      background: "#1B2025", border: "0.5px solid rgba(236,231,220,0.10)",
      borderRadius: "10px", padding: "12px",
    },
    cardHead: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" },
    cardTitle: { fontSize: "14px", fontWeight: 500, color: "#ECE7DC", fontFamily: "'Oswald', sans-serif" },
    tag: (type) => {
      const map = {
        danger: { bg: "#2a1010", color: "#e24b4a", border: "#4a1a1a" },
        warn:   { bg: "#251a08", color: "#ef9f27", border: "#3a2808" },
        ok:     { bg: "#0a1e14", color: "#1d9e75", border: "#0a2e1a" },
        ai:     { bg: "#1B2025", color: "#7F77DD", border: "rgba(236,231,220,0.10)" },
      };
      const t = map[type] || map.ai;
      return {
        fontSize: "9px", padding: "2px 7px", borderRadius: "6px",
        background: t.bg, color: t.color, border: `0.5px solid ${t.border}`,
      };
    },
    alertRow: {
      display: "flex", alignItems: "center", gap: "8px",
      padding: "7px 0", borderBottom: "0.5px solid rgba(236,231,220,0.10)",
    },
    alertIcon: (type) => {
      const map = { Fire: "#2a1010", "Gas Leak": "#251a08", "Electrical Hazard": "#0a1525", Accident: "#222831" };
      return {
        width: "28px", height: "28px", borderRadius: "7px",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "14px", flexShrink: 0, background: map[type] || "#222831",
      };
    },
    alertLoc: { fontSize: "11px", fontWeight: 500, color: "#ECE7DC" },
    alertTime: { fontSize: "9px", color: "#A9A79D", marginTop: "1px" },
    btnV: {
      background: "#0a1e14", color: "#1d9e75", border: "0.5px solid #0a2e1a",
      borderRadius: "6px", padding: "3px 8px", fontSize: "10px", cursor: "pointer",
    },
    btnR: {
      background: "#2a1010", color: "#e24b4a", border: "0.5px solid #4a1a1a",
      borderRadius: "6px", padding: "3px 8px", fontSize: "10px", cursor: "pointer",
    },
    btnPrimary: { background: "#F4B400", color: "#13171B", border: "none", borderRadius: "6px", padding: "8px 16px", fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
    btnDanger: { background: "#e24b4a", color: "#ECE7DC", border: "none", borderRadius: "6px", padding: "8px 16px", fontSize: "12px", fontWeight: 600, cursor: "pointer", marginLeft: "8px" },
    aiPanel: {
      background: "#1B2025", border: "1px solid rgba(236,231,220,0.10)",
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
      background: "rgba(236,231,220,0.05)", borderRadius: "8px", padding: "7px 10px",
      fontSize: "11px", color: "#8888aa", lineHeight: 1.5, marginBottom: "6px",
    },
    chatA: {
      background: "#1B2025", border: "0.5px solid rgba(236,231,220,0.10)",
      borderRadius: "8px", padding: "7px 10px",
      fontSize: "11px", color: "#ECE7DC", lineHeight: 1.5, marginBottom: "7px",
    },
    chatInputRow: { display: "flex", gap: "6px" },
    chatInput: {
      flex: 1, background: "#222831", border: "0.5px solid rgba(236,231,220,0.10)",
      borderRadius: "7px", padding: "6px 10px", fontSize: "11px",
      color: "#ECE7DC", outline: "none",
    },
    chatSend: {
      background: "#2a1f4e", border: "1px solid #534AB7",
      borderRadius: "7px", padding: "6px 12px",
      fontSize: "11px", color: "#ECE7DC", cursor: "pointer",
    },
    // CRUD Styles
    crudInput: { background: "#222831", border: "1px solid rgba(236,231,220,0.10)", borderRadius: "6px", padding: "8px 10px", color: "#ECE7DC", flex: 1, fontSize: "12px" },
    crudTable: { width: "100%", borderCollapse: "collapse", marginTop: "16px" },
    crudTh: { textAlign: "left", padding: "10px 8px", borderBottom: "1px solid rgba(236,231,220,0.10)", color: "#A9A79D", fontSize: "11px" },
    crudTd: { padding: "10px 8px", borderBottom: "1px solid rgba(236,231,220,0.10)", fontSize: "12px", color: "#ECE7DC" },
    crudEditBtn: { background: "rgba(236,231,220,0.05)", color: "#7F77DD", border: "1px solid rgba(236,231,220,0.10)", borderRadius: "4px", padding: "4px 8px", cursor: "pointer", marginRight: "6px" },
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
            <div style={styles.logoSub}>{t("Admin Panel")} · {currentUser}</div>
          </div>
        </div>

        <div style={styles.nav}>
          {["main", "manage"].map((section) => (
            <div key={section}>
              <div style={styles.navLabel}>
                {t({ main: "MAIN", manage: "MANAGE" }[section])}
              </div>
              {NAV_ITEMS.filter((n) => n.section === section).map((item) => (
                <div
                  key={item.label}
                  style={styles.navItem(activeNav === item.label)}
                  onClick={() => { setActiveNav(item.label); cancelEdit(); }}
                >
                  <span>{item.icon}</span>
                  <span>{t(item.label)}</span>
                  {item.label === "Dashboard" && pendingAlerts.length > 0 && (
                    <span style={styles.badge}>{pendingAlerts.length}</span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={styles.sidebarBottom}>
          <button style={styles.adminBtn} onClick={() => setActiveNav("Chatbot")}>
            ◀
            <div style={{ textAlign: "left" }}>
              <span style={{ display: "block", fontSize: "11px", color: "#ECE7DC" }}>Back to Chat</span>
              <small style={{ fontSize: "9px", color: "#A9A79D" }}>चैट पर वापस जाएँ</small>
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
            {t("AI-Based Industrial Safety")} <span style={styles.accentText}>Chatbot</span>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", background: "rgba(236,231,220,0.05)", borderRadius: "8px", padding: "4px" }}>
            <button style={{ background: language === 'en' ? '#F4B400' : 'transparent', color: language === 'en' ? '#1B2025' : '#ECE7DC', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setLanguage('en')}>EN</button>
            <button style={{ background: language === 'hi' ? '#F4B400' : 'transparent', color: language === 'hi' ? '#1B2025' : '#ECE7DC', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setLanguage('hi')}>HI</button>
            <button style={{ background: language === 'hien' ? '#F4B400' : 'transparent', color: language === 'hien' ? '#1B2025' : '#ECE7DC', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setLanguage('hien')}>Hinglish</button>
          </div>
          <div style={styles.avatar} onClick={() => setActiveNav("Chatbot")}>X</div>
        </div>

        {/* Content */}
        <div style={{ 
          ...styles.content, 
          padding: activeNav === "Chatbot" ? 0 : "14px 16px",
          overflow: activeNav === "Chatbot" ? "hidden" : "auto"
        }}>
          {activeNav === "Chatbot" && (
            <div style={{ height: "100%", width: "100%", background: "#13171B", display: "flex", flex: 1 }}>
              <LandingPage 
                embedded={true}
                messages={messages} sendMessage={sendMessage} isLoading={isLoading}
                language={language} setLanguage={setLanguage} recentChats={recentChats}
                clearChat={clearChat} isRecording={isRecording} toggleRecording={toggleRecording}
                onAttachClick={onAttachClick} capturedPhoto={capturedPhoto} clearPhoto={clearPhoto}
              />
            </div>
          )}

          {activeNav === "Dashboard" && (
            <AnalyticsView 
              alerts={alerts}
              weeklyData={weeklyData}
              weeklyLabels={weeklyLabels}
              fireCount={fireCount}
              gasCount={gasCount}
              electricCount={electricCount}
              otherCount={otherCount}
              pendingAlerts={pendingAlerts}
              verifiedAlerts={verifiedAlerts}
            />
          )}

          {activeNav === "Smart Entry" && (
            <div style={styles.card}>
              <div style={styles.cardHead}><span style={styles.cardTitle}>📄 {t("Manage Safety Documents")}</span></div>
              <form onSubmit={(e) => crudSubmit(e, 'documents', docForm, setDocForm, { title: '', category: '', link: '', content: '' })} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <input style={styles.crudInput} type="text" placeholder="Title" value={docForm.title} onChange={e => setDocForm({...docForm, title: e.target.value})} required />
                <input style={styles.crudInput} type="text" placeholder="Category" value={docForm.category} onChange={e => setDocForm({...docForm, category: e.target.value})} required />
                <input style={styles.crudInput} type="url" placeholder="URL Link" value={docForm.link} onChange={e => setDocForm({...docForm, link: e.target.value})} onBlur={handleUrlBlur} required />
                <button style={styles.btnPrimary} type="submit">{editingId ? t("Update") : t("Add")}</button>
                {editingId && <button style={styles.btnDanger} type="button" onClick={cancelEdit}>{t("Cancel")}</button>}
              </form>
              <table style={styles.crudTable}>
                <thead><tr><th style={styles.crudTh}>{t("Title")}</th><th style={styles.crudTh}>{t("Category")}</th><th style={styles.crudTh}>{t("Link")}</th><th style={styles.crudTh}>{t("Actions")}</th></tr></thead>
                <tbody>
                  {documents.map(d => (
                    <tr key={d._id}>
                      <td style={styles.crudTd}>{d.title}</td><td style={styles.crudTd}>{d.category}</td>
                      <td style={styles.crudTd}><a href={d.link} target="_blank" rel="noreferrer" style={{color:'#ECE7DC'}}>View</a></td>
                      <td style={styles.crudTd}>
                        <button style={styles.crudEditBtn} onClick={() => startEditDocument(d)}>{t("Edit")}</button>
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
              <div style={styles.cardHead}><span style={styles.cardTitle}>📞 {t("Manage Emergency Contacts")}</span></div>
              <form onSubmit={(e) => crudSubmit(e, 'contacts', contactForm, setContactForm, { name: '', title: '', contactNumber: '' })} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <input style={styles.crudInput} type="text" placeholder="Name" value={contactForm.name} onChange={e => setContactForm({...contactForm, name: e.target.value})} required />
                <input style={styles.crudInput} type="text" placeholder="Title/Role" value={contactForm.title} onChange={e => setContactForm({...contactForm, title: e.target.value})} required />
                <input style={styles.crudInput} type="text" placeholder="Phone" value={contactForm.contactNumber} onChange={e => setContactForm({...contactForm, contactNumber: e.target.value})} required />
                <button style={styles.btnPrimary} type="submit">{editingId ? t("Update") : t("Add")}</button>
                {editingId && <button style={styles.btnDanger} type="button" onClick={cancelEdit}>{t("Cancel")}</button>}
              </form>
              <table style={styles.crudTable}>
                <thead><tr><th style={styles.crudTh}>{t("Name")}</th><th style={styles.crudTh}>{t("Title")}</th><th style={styles.crudTh}>{t("Contact")}</th><th style={styles.crudTh}>{t("Actions")}</th></tr></thead>
                <tbody>
                  {contacts.map(c => (
                    <tr key={c._id}>
                      <td style={styles.crudTd}>{c.name}</td><td style={styles.crudTd}>{c.title}</td><td style={styles.crudTd}>{c.contactNumber}</td>
                      <td style={styles.crudTd}>
                        <button style={styles.crudEditBtn} onClick={() => startEditContact(c)}>{t("Edit")}</button>
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
              <div style={styles.cardHead}><span style={styles.cardTitle}>🏢 {t("Manage Departments")}</span></div>
              <form onSubmit={(e) => crudSubmit(e, 'departments', deptForm, setDeptForm, { name: '', details: '', contactNumber: '', email: '' })} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <input style={styles.crudInput} type="text" placeholder="Department Name" value={deptForm.name} onChange={e => setDeptForm({...deptForm, name: e.target.value})} required />
                <input style={styles.crudInput} type="text" placeholder="Details" value={deptForm.details} onChange={e => setDeptForm({...deptForm, details: e.target.value})} required />
                <input style={styles.crudInput} type="text" placeholder="Phone" value={deptForm.contactNumber} onChange={e => setDeptForm({...deptForm, contactNumber: e.target.value})} required />
                <input style={styles.crudInput} type="text" placeholder="Department ID / Address" value={deptForm.email} onChange={e => setDeptForm({...deptForm, email: e.target.value})} autoComplete="off" required />
                <button style={styles.btnPrimary} type="submit">{editingId ? t("Update") : t("Add")}</button>
                {editingId && <button style={styles.btnDanger} type="button" onClick={cancelEdit}>{t("Cancel")}</button>}
              </form>
              <table style={styles.crudTable}>
                <thead><tr><th style={styles.crudTh}>{t("Name")}</th><th style={styles.crudTh}>{t("Details")}</th><th style={styles.crudTh}>{t("Contact")}</th><th style={styles.crudTh}>{t("Actions")}</th></tr></thead>
                <tbody>
                  {departments.map(d => (
                    <tr key={d._id}>
                      <td style={styles.crudTd}>{d.name}</td><td style={styles.crudTd}>{d.details}</td><td style={styles.crudTd}>{d.contactNumber}</td>
                      <td style={styles.crudTd}>
                        <button style={styles.crudEditBtn} onClick={() => startEditDept(d)}>{t("Edit")}</button>
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
              <div style={styles.cardHead}><span style={styles.cardTitle}>🛡️ {t("Manage Safety Rules")}</span></div>
              <form onSubmit={(e) => crudSubmit(e, 'safetyrules', ruleForm, setRuleForm, { category: 'fire', title: '', content: '' })} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <select style={styles.crudInput} value={ruleForm.category} onChange={e => setRuleForm({...ruleForm, category: e.target.value})}>
                  <option value="fire">Fire</option><option value="gas">Gas</option><option value="electrical">Electrical</option><option value="ppe">PPE</option><option value="first_aid">First Aid</option>
                </select>
                <input style={styles.crudInput} type="text" placeholder="Rule Title" value={ruleForm.title} onChange={e => setRuleForm({...ruleForm, title: e.target.value})} required />
                <input style={styles.crudInput} type="text" placeholder="Content/Rule details" value={ruleForm.content} onChange={e => setRuleForm({...ruleForm, content: e.target.value})} required />
                <button style={styles.btnPrimary} type="submit">{editingId ? t("Update") : t("Add")}</button>
                {editingId && <button style={styles.btnDanger} type="button" onClick={cancelEdit}>{t("Cancel")}</button>}
              </form>
              <table style={styles.crudTable}>
                <thead><tr><th style={styles.crudTh}>{t("Category")}</th><th style={styles.crudTh}>{t("Title")}</th><th style={styles.crudTh}>{t("Content")}</th><th style={styles.crudTh}>{t("Actions")}</th></tr></thead>
                <tbody>
                  {rules.map(r => (
                    <tr key={r._id}>
                      <td style={styles.crudTd}>{r.category}</td><td style={styles.crudTd}>{r.title}</td><td style={styles.crudTd}>{r.content.substring(0, 50)}...</td>
                      <td style={styles.crudTd}>
                        <button style={styles.crudEditBtn} onClick={() => startEditRule(r)}>{t("Edit")}</button>
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
