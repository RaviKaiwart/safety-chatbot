const fs = require('fs');
let content = fs.readFileSync('src/AdminDashboard.jsx', 'utf8');

// 1. Add btnPrimary and btnDanger
const btnRRegex = /btnR:\s*\{[^}]*\},\r?\n/;
if (!content.includes('btnPrimary:')) {
  content = content.replace(btnRRegex, match => match + '    btnPrimary: { background: "#F4B400", color: "#13171B", border: "none", borderRadius: "6px", padding: "8px 16px", fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },\n    btnDanger: { background: "#e24b4a", color: "#ECE7DC", border: "none", borderRadius: "6px", padding: "8px 16px", fontSize: "12px", fontWeight: 600, cursor: "pointer", marginLeft: "8px" },\n');
}

// 2. Add handleUrlBlur
const urlFunc = `  const handleUrlBlur = async () => {
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

  const crudSubmit`;
if (!content.includes('handleUrlBlur')) {
  content = content.replace('  const crudSubmit', urlFunc);
}

// 3. Attach onBlur
if (!content.includes('onBlur={handleUrlBlur}')) {
  content = content.replace('value={docForm.link} onChange={e => setDocForm({...docForm, link: e.target.value})} required />', 'value={docForm.link} onChange={e => setDocForm({...docForm, link: e.target.value})} onBlur={handleUrlBlur} required />');
}

fs.writeFileSync('src/AdminDashboard.jsx', content);
console.log("AdminDashboard buttons and auto-fetch fixed.");
