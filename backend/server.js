require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { sendAlertEmail } = require('./services/emailService');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'industrial_safety_secret_key_123';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/safety_chatbot', {})
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('⚠️ MongoDB Connection Error: Using Local JSON DB fallback instead.'));

// --- Database Schemas ---

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
});
const User = mongoose.model('User', UserSchema);

const DocumentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  link: { type: String, required: true },
  content: { type: String }
});
const Document = mongoose.model('Document', DocumentSchema);

const DepartmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  details: { type: String, required: true },
  contactNumber: { type: String, required: true },
  email: { type: String, required: true }
});
const Department = mongoose.model('Department', DepartmentSchema);

const EmergencyContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: { type: String, required: true },
  contactNumber: { type: String, required: true }
});
const EmergencyContact = mongoose.model('EmergencyContact', EmergencyContactSchema);

const SafetyRuleSchema = new mongoose.Schema({
  category: { type: String, enum: ['fire', 'gas', 'electrical', 'ppe', 'first_aid'], required: true },
  title: { type: String, required: true },
  content: { type: String, required: true }
});
const SafetyRule = mongoose.model('SafetyRule', SafetyRuleSchema);

const AlertSchema = new mongoose.Schema({
  reporter: { type: String, required: true },
  category: { type: String, enum: ['Fire', 'Gas Leak', 'Accident', 'Electrical Hazard'], required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Verified', 'Rejected'], default: 'Pending' },
  emailSent: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});
const Alert = mongoose.model('Alert', AlertSchema);


// --- JSON Database Fallback ---

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

const getFilePath = (modelName) => path.join(DATA_DIR, `${modelName.toLowerCase()}.json`);

const readData = (modelName) => {
  const filePath = getFilePath(modelName);
  if (!fs.existsSync(filePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    return [];
  }
};

const writeData = (modelName, data) => {
  const filePath = getFilePath(modelName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

const db = {
  find: async (Model, query = {}) => {
    if (mongoose.connection.readyState === 1) {
      return await Model.find(query);
    } else {
      const data = readData(Model.modelName);
      return data.filter(item => {
        for (let key in query) {
          if (item[key] !== query[key]) return false;
        }
        return true;
      });
    }
  },
  findOne: async (Model, query = {}) => {
    if (mongoose.connection.readyState === 1) {
      return await Model.findOne(query);
    } else {
      const data = readData(Model.modelName);
      return data.find(item => {
        for (let key in query) {
          if (item[key] !== query[key]) return false;
        }
        return true;
      }) || null;
    }
  },
  create: async (Model, docData) => {
    if (mongoose.connection.readyState === 1) {
      const doc = new Model(docData);
      return await doc.save();
    } else {
      const data = readData(Model.modelName);
      const newDoc = {
        _id: new mongoose.Types.ObjectId().toString(),
        ...docData,
        timestamp: docData.timestamp || new Date()
      };
      data.push(newDoc);
      writeData(Model.modelName, data);
      return newDoc;
    }
  },
  findByIdAndUpdate: async (Model, id, updateData) => {
    if (mongoose.connection.readyState === 1) {
      return await Model.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      const data = readData(Model.modelName);
      const index = data.findIndex(item => item._id === id || item._id?.toString() === id);
      if (index === -1) return null;
      data[index] = { ...data[index], ...updateData };
      writeData(Model.modelName, data);
      return data[index];
    }
  },
  findByIdAndDelete: async (Model, id) => {
    if (mongoose.connection.readyState === 1) {
      return await Model.findByIdAndDelete(id);
    } else {
      const data = readData(Model.modelName);
      const filtered = data.filter(item => item._id !== id && item._id?.toString() !== id);
      writeData(Model.modelName, filtered);
      return { message: 'Deleted' };
    }
  }
};


// --- Auth Middleware ---

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin required' });
  next();
};


// --- Auth Routes ---

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Required fields' });
    const existingUser = await db.findOne(User, { username });
    if (existingUser) return res.status(400).json({ error: 'Username exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role === 'admin' ? 'admin' : 'user';
    await db.create(User, { username, password: hashedPassword, role: userRole });
    res.status(201).json({ message: 'Registered' });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await db.findOne(User, { username });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, username: user.username, role: user.role });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});


// --- CRUD Routes ---

app.get('/api/documents', authenticateToken, async (req, res) => {
  try { res.json(await db.find(Document)); } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/documents', authenticateToken, requireAdmin, async (req, res) => {
  try { res.status(201).json(await db.create(Document, req.body)); } catch (e) { res.status(400).json({ error: e.message }); }
});
app.put('/api/documents/:id', authenticateToken, requireAdmin, async (req, res) => {
  try { res.json(await db.findByIdAndUpdate(Document, req.params.id, req.body)); } catch (e) { res.status(400).json({ error: e.message }); }
});
app.delete('/api/documents/:id', authenticateToken, requireAdmin, async (req, res) => {
  try { await db.findByIdAndDelete(Document, req.params.id); res.json({ message: 'Deleted' }); } catch (e) { res.status(400).json({ error: e.message }); }
});

app.get('/api/departments', authenticateToken, async (req, res) => {
  try { res.json(await db.find(Department)); } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/departments', authenticateToken, requireAdmin, async (req, res) => {
  try { res.status(201).json(await db.create(Department, req.body)); } catch (e) { res.status(400).json({ error: e.message }); }
});
app.put('/api/departments/:id', authenticateToken, requireAdmin, async (req, res) => {
  try { res.json(await db.findByIdAndUpdate(Department, req.params.id, req.body)); } catch (e) { res.status(400).json({ error: e.message }); }
});
app.delete('/api/departments/:id', authenticateToken, requireAdmin, async (req, res) => {
  try { await db.findByIdAndDelete(Department, req.params.id); res.json({ message: 'Deleted' }); } catch (e) { res.status(400).json({ error: e.message }); }
});

app.get('/api/safetyrules', authenticateToken, async (req, res) => {
  try { res.json(await db.find(SafetyRule)); } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/safetyrules', authenticateToken, requireAdmin, async (req, res) => {
  try { res.status(201).json(await db.create(SafetyRule, req.body)); } catch (e) { res.status(400).json({ error: e.message }); }
});
app.put('/api/safetyrules/:id', authenticateToken, requireAdmin, async (req, res) => {
  try { res.json(await db.findByIdAndUpdate(SafetyRule, req.params.id, req.body)); } catch (e) { res.status(400).json({ error: e.message }); }
});
app.delete('/api/safetyrules/:id', authenticateToken, requireAdmin, async (req, res) => {
  try { await db.findByIdAndDelete(SafetyRule, req.params.id); res.json({ message: 'Deleted' }); } catch (e) { res.status(400).json({ error: e.message }); }
});

app.get('/api/contacts', authenticateToken, async (req, res) => {
  try { res.json(await db.find(EmergencyContact)); } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/contacts', authenticateToken, requireAdmin, async (req, res) => {
  try { res.status(201).json(await db.create(EmergencyContact, req.body)); } catch (e) { res.status(400).json({ error: e.message }); }
});
app.put('/api/contacts/:id', authenticateToken, requireAdmin, async (req, res) => {
  try { res.json(await db.findByIdAndUpdate(EmergencyContact, req.params.id, req.body)); } catch (e) { res.status(400).json({ error: e.message }); }
});
app.delete('/api/contacts/:id', authenticateToken, requireAdmin, async (req, res) => {
  try { await db.findByIdAndDelete(EmergencyContact, req.params.id); res.json({ message: 'Deleted' }); } catch (e) { res.status(400).json({ error: e.message }); }
});

// ==================== ALERTS WITH EMAIL ====================

app.get('/api/alerts', authenticateToken, async (req, res) => {
  try {
    const alerts = await db.find(Alert);
    alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json(alerts);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/alerts', authenticateToken, async (req, res) => {
  try {
    const alert = await db.create(Alert, {
      ...req.body,
      reporter: req.user.username,
      status: 'Pending'
    });
    console.log('📧 Sending email...');
    const emailResult = await sendAlertEmail({
      type: alert.category, location: alert.location,
      description: alert.description, workerName: alert.reporter,
      alertId: alert._id
    });
    if (emailResult.success) {
      console.log('✅ Email sent!');
      await db.findByIdAndUpdate(Alert, alert._id, { emailSent: true });
    }
    res.status(201).json({ ...alert, emailSent: emailResult.success });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// 🆕 PUBLIC alert endpoint
app.post('/api/alerts/public', async (req, res) => {
  try {
    const alert = await db.create(Alert, {
      ...req.body,
      reporter: req.body.reporter || 'Anonymous Worker',
      status: 'Pending'
    });
    console.log('📥 New public alert:', alert._id);
    console.log('📧 Sending email...');
    const emailResult = await sendAlertEmail({
      type: alert.category, location: alert.location,
      description: alert.description, workerName: alert.reporter,
      alertId: alert._id
    });
    if (emailResult.success) {
      console.log('✅ Email sent!');
      await db.findByIdAndUpdate(Alert, alert._id, { emailSent: true });
    } else {
      console.log('⚠️ Email failed:', emailResult.error);
    }
    res.status(201).json({ success: true, alert, emailSent: emailResult.success });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.put('/api/alerts/:id/verify', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Verified', 'Rejected'].includes(status)) return res.status(400).json({ error: 'Invalid' });
    res.json(await db.findByIdAndUpdate(Alert, req.params.id, { status }));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// 🆕 APPROVE from email
app.get('/api/alerts/:id/approve', async (req, res) => {
  try {
    const alert = await db.findByIdAndUpdate(Alert, req.params.id, { status: 'Verified' });
    if (!alert) return res.status(404).send(getResponsePage('error', 'Not found!'));
    console.log('✅ Approved via email:', alert._id);
    res.send(getResponsePage('approved', alert));
  } catch (error) {
    res.status(500).send(getResponsePage('error', error.message));
  }
});

// 🆕 REJECT from email
app.get('/api/alerts/:id/reject', async (req, res) => {
  try {
    const alert = await db.findByIdAndUpdate(Alert, req.params.id, { status: 'Rejected' });
    if (!alert) return res.status(404).send(getResponsePage('error', 'Not found!'));
    console.log('❌ Rejected via email:', alert._id);
    res.send(getResponsePage('rejected', alert));
  } catch (error) {
    res.status(500).send(getResponsePage('error', error.message));
  }
});

function getResponsePage(status, data) {
  const configs = {
    approved: { bg: 'linear-gradient(135deg, #3FA66A, #2d8654)', icon: '✅', title: 'Alert Approved!', color: '#3FA66A', message: 'Department notified.' },
    rejected: { bg: 'linear-gradient(135deg, #E2483D, #b53931)', icon: '❌', title: 'Alert Rejected', color: '#E2483D', message: 'Marked as invalid.' },
    error: { bg: 'linear-gradient(135deg, #6c757d, #495057)', icon: '⚠️', title: 'Error', color: '#6c757d', message: typeof data === 'string' ? data : 'Error!' }
  };
  const cfg = configs[status];
  const info = typeof data === 'object' ? data : null;
  return `<!DOCTYPE html><html><head><title>${cfg.title}</title><style>body{font-family:Arial;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:${cfg.bg};color:white}.card{background:white;color:#333;padding:40px;border-radius:16px;text-align:center;max-width:450px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.3)}.icon{font-size:80px;margin-bottom:20px}h1{color:${cfg.color}}.info{background:#f8f9fa;padding:16px;border-radius:8px;margin:20px 0;text-align:left}.btn{display:inline-block;margin-top:20px;padding:14px 28px;background:#F4B400;color:#1B1304;text-decoration:none;border-radius:8px;font-weight:bold}</style></head><body><div class="card"><div class="icon">${cfg.icon}</div><h1>${cfg.title}</h1>${info ? `<div class="info"><div><strong>Category:</strong> ${info.category || ''}</div><div><strong>Location:</strong> ${info.location || ''}</div><div><strong>Status:</strong> ${info.status || ''}</div></div>` : ''}<p>${cfg.message}</p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="btn">Go to Dashboard</a></div></body></html>`;
}

app.get('/api/incidents', async (req, res) => {
  try {
    const verified = await db.find(Alert, { status: 'Verified' });
    verified.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json(verified.map(a => ({
      _id: a._id,
      description: `[${a.category} at ${a.location}] ${a.description}`,
      date: a.timestamp
    })));
  } catch (e) { res.json([]); }
});

// --- Chatbot ---

app.post('/api/chat', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  let reporterName = 'Anonymous Worker';
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      reporterName = decoded.username;
    } catch (e) { }
  }
  const userMessage = req.body.message;
  const userLang = req.body.language || 'hinglish';

  try {
    const safetyRules = await db.find(SafetyRule);
    const departments = await db.find(Department);
    const emergencyContacts = await db.find(EmergencyContact);
    const documents = await db.find(Document);

    const context = {
      safetyRules: safetyRules.map(r => ({ category: r.category, title: r.title, content: r.content })),
      departments: departments.map(d => ({ name: d.name, details: d.details, contact: d.contactNumber, email: d.email })),
      emergencyContacts: emergencyContacts.map(c => ({ name: c.name, title: c.title, contact: c.contactNumber })),
      documents: documents.map(doc => ({ title: doc.title, category: doc.category, link: doc.link, content: doc.content }))
    };

    const systemPrompt = `You are an AI-Based Industrial Safety Chatbot for Bhilai Steel Plant.

DATABASE CONTEXT:
${JSON.stringify(context, null, 2)}

INSTRUCTIONS:
1. Use database for plant-specific queries.
2. Type 'Report:' or 'Emergency:' saves alert.
3. Language: ${userLang.toUpperCase()}
   - english: Reply in English
   - hindi: Reply in Hindi (Devanagari)
   - hinglish: Reply in English, end with |SUBTITLE| Hindi translation
4. Short, friendly markdown.
5. Answer general knowledge too.`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt
    });

    let promptContent = [userMessage];
    if (req.body.imageBase64) {
      const matches = req.body.imageBase64.match(/^data:(.+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        promptContent.push({ inlineData: { data: matches[2], mimeType: matches[1] } });
      }
    }

    const result = await model.generateContent(promptContent);
    const text = result.response.text();

    const isEmergencyMsg = userMessage.toLowerCase().includes('report') || userMessage.toLowerCase().includes('emergency');

    let saveAlert = null;
    if (userMessage.toLowerCase().startsWith('report:') || userMessage.toLowerCase().startsWith('emergency:')) {
      const details = userMessage.replace(/^(report:|emergency:)/i, '').trim();
      if (details) {
        const category = details.toLowerCase().includes('fire') ? 'Fire' :
          details.toLowerCase().includes('gas') ? 'Gas Leak' :
            details.toLowerCase().includes('shock') || details.toLowerCase().includes('electr') ? 'Electrical Hazard' : 'Accident';
        saveAlert = await db.create(Alert, {
          reporter: reporterName, category, description: details,
          location: 'Bhilai Steel Plant Area', status: 'Pending'
        });
        console.log('📧 Sending email for chatbot alert...');
        const emailResult = await sendAlertEmail({
          type: saveAlert.category, location: saveAlert.location,
          description: saveAlert.description, workerName: saveAlert.reporter,
          alertId: saveAlert._id
        });
        if (emailResult.success) {
          console.log('✅ Email sent!');
          await db.findByIdAndUpdate(Alert, saveAlert._id, { emailSent: true });
        }
      }
    }

    res.json({ reply: text, isEmergency: isEmergencyMsg, alertCreated: !!saveAlert, alertDetails: saveAlert });
  } catch (err) {
    console.error("Gemini Error:", err);
    res.json({ reply: "Mujhe samasya ho rahi hai." });
  }
});

app.post('/api/admin/chat', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { messages, userMsg, contextStats } = req.body;
    const systemPrompt = `Tum AI-Based Industrial Safety Chatbot ho. Hinglish mein jawab do. Data: ${contextStats?.pending} pending, ${contextStats?.verified} verified, ${contextStats?.fire} fires.`;
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", systemInstruction: systemPrompt });
    const chat = model.startChat({
      history: messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] }))
    });
    const result = await chat.sendMessage(userMsg);
    res.json({ reply: result.response.text() });
  } catch (err) {
    res.json({ reply: "Network error." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📧 Email service ready`);
  console.log(`🌐 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});