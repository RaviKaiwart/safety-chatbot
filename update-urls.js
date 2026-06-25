const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.jsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('d:/ai chatbot/frontend/src');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    // Replace fetch('/api/...) with fetch(import.meta.env.VITE_API_URL + '/api/...)
    if (content.includes("fetch('/api/")) {
        content = content.replace(/fetch\('\/api\//g, "fetch((import.meta.env.VITE_API_URL || '') + '/api/");
        modified = true;
    }
    
    // Replace fetch(`/api/...)
    if (content.includes('fetch(`/api/')) {
        content = content.replace(/fetch\(\`\/api\//g, "fetch((import.meta.env.VITE_API_URL || '') + `/api/");
        modified = true;
    }

    // Replace fetch("/api/...")
    if (content.includes('fetch("/api/')) {
        content = content.replace(/fetch\("\/api\//g, "fetch((import.meta.env.VITE_API_URL || '') + \"/api/");
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(file, content);
        console.log('Updated ' + file);
    }
});
