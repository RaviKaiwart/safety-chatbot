const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: 'd:/ai chatbot/backend/.env' });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testModel(modelName) {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("hello");
    console.log(`Success with ${modelName}:`, result.response.text());
  } catch (e) {
    console.error(`Failed with ${modelName}:`, e.message);
  }
}

async function run() {
  await testModel("gemini-2.5-flash");
  await testModel("gemini-3.5-flash");
  await testModel("gemini-2.0-flash");
}
run();
