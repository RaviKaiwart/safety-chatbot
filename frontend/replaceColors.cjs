const fs = require('fs');

function replaceColors(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Backgrounds
  content = content.replace(/#0d0d14/gi, '#13171B'); // Main Bg
  content = content.replace(/#0a0a0f/gi, '#1B2025'); // Sidebar Bg
  content = content.replace(/#12121e/gi, '#222831'); // Cards Bg
  content = content.replace(/#1a1a2e/gi, '#222831'); // Inner boxes Bg
  content = content.replace(/#1f1f35/gi, 'rgba(236,231,220,0.10)'); // Borders
  content = content.replace(/#2a2a3e/gi, 'rgba(236,231,220,0.10)'); // Card borders
  content = content.replace(/#3a3a5e/gi, 'rgba(236,231,220,0.10)'); // Form borders

  // Text colors
  content = content.replace(/#fff/gi, '#ECE7DC');
  content = content.replace(/#ffffff/gi, '#ECE7DC');
  content = content.replace(/#c0c0e0/gi, '#ECE7DC');
  content = content.replace(/#7070a0/gi, '#A9A79D');
  content = content.replace(/#4f4f7a/gi, '#A9A79D');
  content = content.replace(/#5a5a7a/gi, '#A9A79D');
  content = content.replace(/#4a4a6a/gi, '#A9A79D');

  // Accent Colors (Purple -> Yellow)
  content = content.replace(/#6c63ff/gi, '#F4B400');
  content = content.replace(/rgba\(108,\s*99,\s*255,\s*0\.1\)/gi, 'rgba(244,180,0,0.15)');
  content = content.replace(/rgba\(108,\s*99,\s*255,\s*0\.2\)/gi, 'rgba(244,180,0,0.3)');
  
  // Other small fixes for panels
  content = content.replace(/#1a1535/gi, '#1B2025');
  content = content.replace(/#3a2a6e/gi, 'rgba(236,231,220,0.10)');
  content = content.replace(/#AFA9EC/gi, '#ECE7DC');
  content = content.replace(/#1f1f38/gi, 'rgba(236,231,220,0.05)');

  fs.writeFileSync(filePath, content);
  console.log(`Updated colors in ${filePath}`);
}

replaceColors('src/AdminDashboard.jsx');
replaceColors('src/AnalyticsView.jsx');
