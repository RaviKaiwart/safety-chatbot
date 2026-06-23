require('dotenv').config({ path: 'd:/ai chatbot/backend/.env' });

async function listModels() {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await res.json();
    console.log(data);
  } catch (e) {
    console.error("fetch failed:", e.message);
  }
}

listModels();
