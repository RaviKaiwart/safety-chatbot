require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'industrial_safety_secret_key_123';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/safety_chatbot', {})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('MongoDB Connection Error: Using Local JSON DB fallback instead.'));

// --- Database Schemas ---

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
});
const User = mongoose.model('User', UserSchema);

const VehicleSchema = new mongoose.Schema({
  plateNumber: { type: String, required: true },
  driverName: { type: String, required: true },
  gate: { type: String, required: true },
  material: { type: String, required: true },
  timeOfEntry: { type: Date, default: Date.now },
  timeOfExit: { type: Date }
});
const Vehicle = mongoose.model('Vehicle', VehicleSchema);

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
  timestamp: { type: Date, default: Date.now }
});
const Alert = mongoose.model('Alert', AlertSchema);


// --- JSON Database Fallback Implementation ---

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

const getFilePath = (modelName) => path.join(DATA_DIR, `${modelName.toLowerCase()}.json`);

const readData = (modelName) => {
  const filePath = getFilePath(modelName);
  if (!fs.existsSync(filePath)) {
    return [];
  }
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
        timestamp: docData.timestamp || new Date(),
        timeOfEntry: docData.timeOfEntry || new Date()
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
      return { message: 'Deleted successfully' };
    }
  }
};


// --- Auth Middleware ---

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};


// --- Auth Routes ---

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    const existingUser = await db.findOne(User, { username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role === 'admin' ? 'admin' : 'user';
    const newUser = await db.create(User, { username, password: hashedPassword, role: userRole });
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await db.findOne(User, { username });
    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }
    const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, username: user.username, role: user.role });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});


// --- Industrial Modules CRUD Routes ---

// Vehicles
app.get('/api/vehicles', authenticateToken, async (req, res) => {
  try {
    const vehicles = await db.find(Vehicle);
    vehicles.sort((a, b) => new Date(b.timeOfEntry) - new Date(a.timeOfEntry));
    res.json(vehicles);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/vehicles', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const vehicle = await db.create(Vehicle, req.body);
    res.status(201).json(vehicle);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.put('/api/vehicles/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const vehicle = await db.findByIdAndUpdate(Vehicle, req.params.id, req.body);
    res.json(vehicle);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.delete('/api/vehicles/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await db.findByIdAndDelete(Vehicle, req.params.id);
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Departments
app.get('/api/departments', authenticateToken, async (req, res) => {
  try {
    const departments = await db.find(Department);
    res.json(departments);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/departments', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const dept = await db.create(Department, req.body);
    res.status(201).json(dept);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.put('/api/departments/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const dept = await db.findByIdAndUpdate(Department, req.params.id, req.body);
    res.json(dept);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.delete('/api/departments/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await db.findByIdAndDelete(Department, req.params.id);
    res.json({ message: 'Department deleted successfully' });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Safety Rules
app.get('/api/safetyrules', authenticateToken, async (req, res) => {
  try {
    const rules = await db.find(SafetyRule);
    res.json(rules);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/safetyrules', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const rule = await db.create(SafetyRule, req.body);
    res.status(201).json(rule);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.put('/api/safetyrules/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const rule = await db.findByIdAndUpdate(SafetyRule, req.params.id, req.body);
    res.json(rule);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.delete('/api/safetyrules/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await db.findByIdAndDelete(SafetyRule, req.params.id);
    res.json({ message: 'Safety rule deleted successfully' });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Emergency Contacts
app.get('/api/contacts', authenticateToken, async (req, res) => {
  try {
    const contacts = await db.find(EmergencyContact);
    res.json(contacts);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/contacts', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const contact = await db.create(EmergencyContact, req.body);
    res.status(201).json(contact);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.put('/api/contacts/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const contact = await db.findByIdAndUpdate(EmergencyContact, req.params.id, req.body);
    res.json(contact);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.delete('/api/contacts/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await db.findByIdAndDelete(EmergencyContact, req.params.id);
    res.json({ message: 'Emergency contact deleted successfully' });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Alerts
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
    res.status(201).json(alert);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.put('/api/alerts/:id/verify', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Verified', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const alert = await db.findByIdAndUpdate(Alert, req.params.id, { status });
    res.json(alert);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Backward compatibility log endpoint
app.get('/api/incidents', async (req, res) => {
  try {
    const verifiedAlerts = await db.find(Alert, { status: 'Verified' });
    verifiedAlerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const formatted = verifiedAlerts.map(a => ({
      _id: a._id,
      description: `[${a.category} at ${a.location}] ${a.description}`,
      date: a.timestamp
    }));
    res.json(formatted);
  } catch (e) {
    res.json([]);
  }
});

// --- Chatbot with Gemini NLP & Context Routing ---

app.post('/api/chat', authenticateToken, async (req, res) => {
  const userMessage = req.body.message;
  const userLang = req.body.language || 'hinglish'; // 'english', 'hindi', 'hinglish'

  try {
    const safetyRules = await db.find(SafetyRule);
    const departments = await db.find(Department);
    const emergencyContacts = await db.find(EmergencyContact);
    const vehicles = await db.find(Vehicle);
    
    const context = {
      safetyRules: safetyRules.map(r => ({ category: r.category, title: r.title, content: r.content })),
      departments: departments.map(d => ({ name: d.name, details: d.details, contact: d.contactNumber, email: d.email })),
      emergencyContacts: emergencyContacts.map(c => ({ name: c.name, title: c.title, contact: c.contactNumber })),
      vehicles: vehicles.map(v => ({ plate: v.plateNumber, driver: v.driverName, gate: v.gate, material: v.material, entryTime: v.timeOfEntry, exitTime: v.timeOfExit }))
    };

    const systemPrompt = `
You are an AI Safety & Information Assistant for Bhilai Steel Plant (an industrial plant).
Answer queries regarding industrial safety, machinery, PPE, protocols, emergency handling, vehicle entry/exit status, department contacts, and emergency team details using the database context provided below.

DATABASE CONTEXT:
${JSON.stringify(context, null, 2)}

INSTRUCTIONS:
1. Always base your answers on the provided database context when queried about vehicles, departments, safety rules, or contacts. If a vehicle plate is queried (e.g. "CG04AB1234"), check if it exists in the vehicle context list and respond with its details (Driver, Gate, Material, Entry time, Exit time).
2. If the user wants to report an emergency (e.g., fire, gas leak, accident, etc.), tell them their report will be registered. If they type 'Report: [details]' or 'Emergency: [details]', it will be automatically saved as a pending alert in the database.
3. Language constraint: 
   - If selected language is 'english', reply in professional and clear English.
   - If selected language is 'hindi', reply in formal Hindi (Devanagari script).
   - If selected language is 'hinglish', reply in Hinglish (Roman script Hindi/English mix) and always append the Hindi Translation/Subtitle in Devanagari in a new line at the bottom.
4. Keep answers short, friendly, and structured with markdown.
5. If the query is completely unrelated to safety, plant operations, departments, or vehicles, decline politely and remind them of your role as a Safety Assistant.
`;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemPrompt
    });

    const result = await model.generateContent(userMessage);
    const text = result.response.text();

    const isEmergencyMsg = userMessage.toLowerCase().includes('report') || userMessage.toLowerCase().includes('emergency') || text.toLowerCase().includes('alert') || text.toLowerCase().includes('aag') || text.toLowerCase().includes('gas leak');
    
    let saveAlert = null;
    if (userMessage.toLowerCase().startsWith('report:') || userMessage.toLowerCase().startsWith('emergency:')) {
      const details = userMessage.replace(/^(report:|emergency:)/i, '').trim();
      if (details) {
        const category = details.toLowerCase().includes('fire') ? 'Fire' : 
                         details.toLowerCase().includes('gas') ? 'Gas Leak' :
                         details.toLowerCase().includes('shock') || details.toLowerCase().includes('electr') ? 'Electrical Hazard' : 'Accident';
        
        saveAlert = await db.create(Alert, {
          reporter: req.user.username,
          category: category,
          description: details,
          location: 'Bhilai Steel Plant Area',
          status: 'Pending'
        });
      }
    }

    res.json({ 
      reply: text,
      isEmergency: isEmergencyMsg,
      alertCreated: !!saveAlert,
      alertDetails: saveAlert
    });

  } catch (err) {
    console.error("Gemini Error:", err);
    res.json({ reply: "Mujhe check karne mein samasya ho rahi hai. Kripya system details verify karein." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
