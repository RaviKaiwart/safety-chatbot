const fs = require('fs');
const content = fs.readFileSync('src/AdminDashboard.jsx', 'utf8');

// 1. Remove Analytics Nav
let newContent = content.replace(/.*label: "Analytics".*\r?\n/g, '');

// 2. Rename AnalyticsView activeNav
newContent = newContent.replace('{activeNav === "Analytics" && (', '{activeNav === "Dashboard" && (');

// 3. Remove old dashboard
const startStr = '          {activeNav === "Dashboard" && (';
const searchIndex = newContent.lastIndexOf(startStr); // Since the first one is the new Dashboard
const endStr = '          {activeNav === "Smart Entry" && (';
const endIndex = newContent.indexOf(endStr);

if (searchIndex !== -1 && endIndex !== -1 && searchIndex < endIndex) {
  newContent = newContent.substring(0, searchIndex) + newContent.substring(endIndex);
  console.log("Old dashboard removed.");
} else {
  console.log("Could not find bounds.");
}

fs.writeFileSync('src/AdminDashboard.jsx', newContent);
console.log("AdminDashboard updated.");
