const fs = require('fs');

let content = fs.readFileSync('src/AdminDashboard.jsx', 'utf8');

// 1. Inject t function
const tFunc = `
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
`;

content = content.replace('const [activeNav, setActiveNav] = useState("Dashboard");', 'const [activeNav, setActiveNav] = useState("Dashboard");\n' + tFunc);

// 2. Replace hardcoded strings
content = content.replace(/Admin Panel · /g, '{t("Admin Panel")} · ');
content = content.replace(/\{\{ main: "MAIN", manage: "MANAGE" \}\[section\]\}/g, '{t({ main: "MAIN", manage: "MANAGE" }[section])}');
content = content.replace(/<span>\{item.label\}<\/span>/g, '<span>{t(item.label)}</span>');
content = content.replace(/"Logout Admin"/g, 't("Logout Admin")');
content = content.replace(/AI-Based Industrial Safety/g, '{t("AI-Based Industrial Safety")}');

// Forms headers
content = content.replace(/📄 Manage Safety Documents/g, '📄 {t("Manage Safety Documents")}');
content = content.replace(/📞 Manage Emergency Contacts/g, '📞 {t("Manage Emergency Contacts")}');
content = content.replace(/🏢 Manage Departments/g, '🏢 {t("Manage Departments")}');
content = content.replace(/🛡️ Manage Safety Rules/g, '🛡️ {t("Manage Safety Rules")}');

// Table headers
content = content.replace(/>Title<\/th>/g, '>{t("Title")}</th>');
content = content.replace(/>Category<\/th>/g, '>{t("Category")}</th>');
content = content.replace(/>Link<\/th>/g, '>{t("Link")}</th>');
content = content.replace(/>Actions<\/th>/g, '>{t("Actions")}</th>');
content = content.replace(/>Name<\/th>/g, '>{t("Name")}</th>');
content = content.replace(/>Details<\/th>/g, '>{t("Details")}</th>');
content = content.replace(/>Contact<\/th>/g, '>{t("Contact")}</th>');
content = content.replace(/>Content<\/th>/g, '>{t("Content")}</th>');

// Buttons
content = content.replace(/>\{editingId \? 'Update' : 'Add'\}<\/button>/g, '>{editingId ? t("Update") : t("Add")}</button>');
content = content.replace(/>Cancel<\/button>/g, '>{t("Cancel")}</button>');
content = content.replace(/>Edit<\/button>/g, '>{t("Edit")}</button>');
content = content.replace(/>Delete<\/button>/g, '>{t("Delete")}</button>');

// Pass language prop to AnalyticsView
content = content.replace(/<AnalyticsView alerts=\{alerts\} \/>/g, '<AnalyticsView alerts={alerts} language={language} />');

fs.writeFileSync('src/AdminDashboard.jsx', content);

// AnalyticsView.jsx
let analyticsContent = fs.readFileSync('src/AnalyticsView.jsx', 'utf8');
const tFuncAnalytics = `
  const langKey = (language === 'hi' || language === 'hien') ? 'hi' : 'en';
  const t = (text) => {
    const dict = {
      "Total Active Alerts": { hi: "कुल सक्रिय अलर्ट" },
      "Critical Safety Risk": { hi: "गंभीर सुरक्षा जोखिम" },
      "High Risk Profile": { hi: "उच्च जोखिम प्रोफ़ाइल" },
      "Safety Score": { hi: "सुरक्षा स्कोर" },
      "Alerts & Resolution Trend": { hi: "अलर्ट और समाधान प्रवृत्ति" },
      "Summary Stats": { hi: "सारांश आँकड़े" },
      "Alerts by Status": { hi: "स्थिति अनुसार अलर्ट" },
      "Recent Verified Alerts": { hi: "हाल के सत्यापित अलर्ट" },
      "AI Risk Analysis": { hi: "एआई जोखिम विश्लेषण" }
    };
    return dict[text] && dict[text][langKey] ? dict[text][langKey] : text;
  };
`;

analyticsContent = analyticsContent.replace('export default function AnalyticsView({ alerts = [] }) {', 'export default function AnalyticsView({ alerts = [], language = "en" }) {\n' + tFuncAnalytics);

analyticsContent = analyticsContent.replace(/>Total Active Alerts</g, '>{t("Total Active Alerts")}<');
analyticsContent = analyticsContent.replace(/>Critical Safety Risk</g, '>{t("Critical Safety Risk")}<');
analyticsContent = analyticsContent.replace(/>High Risk Profile</g, '>{t("High Risk Profile")}<');
analyticsContent = analyticsContent.replace(/>Safety Score</g, '>{t("Safety Score")}<');
analyticsContent = analyticsContent.replace(/>Alerts & Resolution Trend</g, '>{t("Alerts & Resolution Trend")}<');
analyticsContent = analyticsContent.replace(/>Summary Stats</g, '>{t("Summary Stats")}<');
analyticsContent = analyticsContent.replace(/>Alerts by Status</g, '>{t("Alerts by Status")}<');
analyticsContent = analyticsContent.replace(/>Recent Verified Alerts</g, '>{t("Recent Verified Alerts")}<');
analyticsContent = analyticsContent.replace(/>AI Risk Analysis</g, '>{t("AI Risk Analysis")}<');

fs.writeFileSync('src/AnalyticsView.jsx', analyticsContent);
console.log('Translation added successfully!');
