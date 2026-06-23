const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const writeLocalBackup = () => {
  const fs = require('fs');
  const path = require('path');
  const DATA_DIR = path.join(__dirname, 'data');
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
  }
  
  const hashedUserPass = bcrypt.hashSync('worker123', 10);
  const hashedAdminPass = bcrypt.hashSync('admin123', 10);

  fs.writeFileSync(path.join(DATA_DIR, 'user.json'), JSON.stringify([
    { _id: "u1", username: 'worker', password: hashedUserPass, role: 'user' },
    { _id: "u2", username: 'admin', password: hashedAdminPass, role: 'admin' }
  ], null, 2));

  fs.writeFileSync(path.join(DATA_DIR, 'document.json'), JSON.stringify([
    { _id: "doc1", title: 'General Fire Safety Manual', category: 'Fire Safety', link: 'https://example.com/fire-safety-manual.pdf', content: 'Comprehensive guide for handling fire emergencies.' },
    { _id: "doc2", title: 'PPE Standard Operating Procedure', category: 'PPE', link: 'https://example.com/ppe-sop.pdf', content: 'Detailed guidelines on mandatory PPE usage inside the plant.' }
  ], null, 2));

  fs.writeFileSync(path.join(DATA_DIR, 'department.json'), JSON.stringify([
    { _id: "d1", name: 'Safety Department', details: 'Oversees safety compliance, hazard audits, and PPE rules across plant zones.', contactNumber: '+91-788-2894501', email: 'safety@bhilaisteel.co.in' },
    { _id: "d2", name: 'Security Department', details: 'Manages gate entry passes, vehicle registrations, and parameter control.', contactNumber: '+91-788-2894502', email: 'security@bhilaisteel.co.in' },
    { _id: "d3", name: 'Medical Department', details: 'Main Plant Medical post, runs occupational health clinic and ambulance service.', contactNumber: '+91-788-2894503', email: 'medical@bhilaisteel.co.in' },
    { _id: "d4", name: 'Maintenance Department', details: 'Handles structural repairs, machinery breakdown assistance, and electrical isolation.', contactNumber: '+91-788-2894504', email: 'maintenance@bhilaisteel.co.in' },
    { _id: "d5", name: 'Production Department', details: 'Monitors Blast Furnace operations, coke ovens, and raw material handling schedules.', contactNumber: '+91-788-2894505', email: 'production@bhilaisteel.co.in' }
  ], null, 2));

  fs.writeFileSync(path.join(DATA_DIR, 'emergencycontact.json'), JSON.stringify([
    { _id: "c1", name: 'Fire Control Room', title: 'Fire & Rescue Service', contactNumber: '101' },
    { _id: "c2", name: 'Plant Ambulance Dispatch', title: 'Medical Emergency Services', contactNumber: '102' },
    { _id: "c3", name: 'Safety Officer On-Duty', title: 'Main Plant Safety Office', contactNumber: '+91-98765-43210' },
    { _id: "c4", name: 'Security Main Control Room', title: 'Plant Perimeter & Gate Security', contactNumber: '+91-98765-43211' }
  ], null, 2));

  fs.writeFileSync(path.join(DATA_DIR, 'safetyrule.json'), JSON.stringify([
    { _id: "r1", category: 'fire', title: 'Fire Evacuation Protocol', content: 'In case of fire, evacuate immediately via designated exit routes. Do not use lifts. Gather at the nearest assembly point and notify Fire Control Room (101).' },
    { _id: "r2", category: 'gas', title: 'Gas Leakage / CO Hazard Safety', content: 'If carbon monoxide (CO) or gas alarms trigger, don your personal gas detector and evacuation escape mask immediately. Evacuate crosswind/upwind.' },
    { _id: "r3", category: 'electrical', title: 'Electrical Shock & LOTO', content: 'Apply Lock-Out Tag-Out (LOTO) procedures before commencing any machine maintenance. Use insulated tools and non-conductive safety gloves.' },
    { _id: "r4", category: 'ppe', title: 'Mandatory PPE Protocol', content: 'Workers must wear industrial safety helmets, steel-toed safety shoes, high-visibility reflective vests, and safety goggles inside active plant zones.' },
    { _id: "r5", category: 'first_aid', title: 'First Aid for Thermal Burns', content: 'For industrial heat/steam burns, immediately flush the area with clean, cold running water for 15-20 minutes. Cover loosely with sterile dressing. Call Plant Ambulance (102).' },
    { _id: "r6", category: "ppe", title: "Official Bhilai Steel Plant Equipment List", content: "Official Bhilai Steel Plant Safety Equipment List:\n- **Head Protection**: Fibre helmet (protects against falling objects, hitting against objects), Crash helmet (for riding high-speed vehicles).\n- **Face Protection**: Plastic face shield (against chemical splashes, metal splash, dust, sparks), Welding helmet (heat, UV radiation, sparks for unstable positions), Welding screen (for stable positions).\n- **Eye Protection**: Welding glass [dark] (UV radiation, sparks), Green coloured goggle (heat/IR radiation for furnace), Spectacle type goggles with shatter proof lens (foreign bodies, dust, metal chips), Smelters' Furnace observation Glass (heat/IR radiation for liquid metal), Welder's/Gas cutter goggle (UV radiation), Acid/alkali proof rubber goggles (chemical splashes).\n- **Ear Protection**: Ear plugs, Ear muff (against high noise level).\n- **Nose Protection**: Dust respirator (against dust and powder particles).\n- **Body Protection**: Asbestos apron (Heat radiation), PVC apron / PVC suit (Splashing of chemicals), Flame Retardant suits (splashes of liquid metal, slag, shooting flames), Canvas apron / Canvas coat (sparks, metallic chips, radiant heat).\n- **Hand Protection**: Leather gloves (Cuts due to handling), Asbestos gloves (Heat radiation), Acid/alkali proof rubber gloves (handling acids), Electrical resistance gloves (Electric shock), Protective cream (Skin diseases).\n- **Leg Protection**: Canvas anklet/Khakki woolen patti (flying sparks, hot flue dust entering boot), Leather sole safety boots / DMS safety boot (striking/falling objects, sharp/hot objects).\n- **General Protection**: Safety belt (Falling from height), Rubber matting (Electrical shock while working on electrical installations)." }
  ], null, 2));

  fs.writeFileSync(path.join(DATA_DIR, 'alert.json'), JSON.stringify([
    { _id: "a1", reporter: 'worker', category: 'Accident', description: 'Blast Furnace 1 ke paas minor oil spill hua tha.', location: 'Blast Furnace 1 Area', status: 'Verified', timestamp: new Date('2026-06-15').toISOString() },
    { _id: "a2", reporter: 'worker', category: 'Accident', description: 'Gate 3 par ek truck reverse karte time boundary wall se takraya.', location: 'Gate 3 Exit', status: 'Verified', timestamp: new Date('2026-06-16').toISOString() },
    { _id: "a3", reporter: 'worker', category: 'Fire', description: 'Gate 1 battery room safety check requires urgent review due to minor heat buildup.', location: 'Gate 1 Battery Room', status: 'Pending', timestamp: new Date().toISOString() }
  ], null, 2));
  
  console.log('Seeded Local JSON Database Backup Successfully');
};

mongoose.connect('mongodb://127.0.0.1:27017/safety_chatbot', {})
.then(async () => {
  console.log('MongoDB Connected for Seeding');

  // Define Models
  const User = mongoose.model('User', new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
  }));

  const Document = mongoose.model('Document', new mongoose.Schema({
    title: String, category: String, link: String, content: String
  }));

  const Department = mongoose.model('Department', new mongoose.Schema({
    name: String, details: String, contactNumber: String, email: String
  }));

  const EmergencyContact = mongoose.model('EmergencyContact', new mongoose.Schema({
    name: String, title: String, contactNumber: String
  }));

  const SafetyRule = mongoose.model('SafetyRule', new mongoose.Schema({
    category: String, title: String, content: String
  }));

  const Alert = mongoose.model('Alert', new mongoose.Schema({
    reporter: String, category: String, description: String, location: String, status: String, timestamp: Date
  }));

  // Clean databases
  await User.deleteMany();
  await Document.deleteMany();
  await Department.deleteMany();
  await EmergencyContact.deleteMany();
  await SafetyRule.deleteMany();
  await Alert.deleteMany();

  // Create Users
  const hashedUserPass = await bcrypt.hash('worker123', 10);
  const hashedAdminPass = await bcrypt.hash('admin123', 10);

  await User.insertMany([
    { username: 'worker', password: hashedUserPass, role: 'user' },
    { username: 'admin', password: hashedAdminPass, role: 'admin' }
  ]);
  console.log('Users Seeded');

  // Create Documents
  await Document.insertMany([
    { title: 'General Fire Safety Manual', category: 'Fire Safety', link: 'https://example.com/fire-safety-manual.pdf', content: 'Comprehensive guide for handling fire emergencies.' },
    { title: 'PPE Standard Operating Procedure', category: 'PPE', link: 'https://example.com/ppe-sop.pdf', content: 'Detailed guidelines on mandatory PPE usage inside the plant.' }
  ]);
  console.log('Documents Seeded');

  // Create Departments
  await Department.insertMany([
    { name: 'Safety Department', details: 'Oversees safety compliance, hazard audits, and PPE rules across plant zones.', contactNumber: '+91-788-2894501', email: 'safety@bhilaisteel.co.in' },
    { name: 'Security Department', details: 'Manages gate entry passes, vehicle registrations, and parameter control.', contactNumber: '+91-788-2894502', email: 'security@bhilaisteel.co.in' },
    { name: 'Medical Department', details: 'Main Plant Medical post, runs occupational health clinic and ambulance service.', contactNumber: '+91-788-2894503', email: 'medical@bhilaisteel.co.in' },
    { name: 'Maintenance Department', details: 'Handles structural repairs, machinery breakdown assistance, and electrical isolation.', contactNumber: '+91-788-2894504', email: 'maintenance@bhilaisteel.co.in' },
    { name: 'Production Department', details: 'Monitors Blast Furnace operations, coke ovens, and raw material handling schedules.', contactNumber: '+91-788-2894505', email: 'production@bhilaisteel.co.in' }
  ]);
  console.log('Departments Seeded');

  // Create Emergency Contacts
  await EmergencyContact.insertMany([
    { name: 'Fire Control Room', title: 'Fire & Rescue Service', contactNumber: '101' },
    { name: 'Plant Ambulance Dispatch', title: 'Medical Emergency Services', contactNumber: '102' },
    { name: 'Safety Officer On-Duty', title: 'Main Plant Safety Office', contactNumber: '+91-98765-43210' },
    { name: 'Security Main Control Room', title: 'Plant Perimeter & Gate Security', contactNumber: '+91-98765-43211' }
  ]);
  console.log('Emergency Contacts Seeded');

  // Create Safety Rules
  await SafetyRule.insertMany([
    { category: 'fire', title: 'Fire Evacuation Protocol', content: 'In case of fire, evacuate immediately via designated exit routes. Do not use lifts. Gather at the nearest assembly point and notify Fire Control Room (101).' },
    { category: 'gas', title: 'Gas Leakage / CO Hazard Safety', content: 'If carbon monoxide (CO) or gas alarms trigger, don your personal gas detector and evacuation escape mask immediately. Evacuate crosswind/upwind.' },
    { category: 'electrical', title: 'Electrical Shock & LOTO', content: 'Apply Lock-Out Tag-Out (LOTO) procedures before commencing any machine maintenance. Use insulated tools and non-conductive safety gloves.' },
    { category: 'ppe', title: 'Mandatory PPE Protocol', content: 'Workers must wear industrial safety helmets, steel-toed safety shoes, high-visibility reflective vests, and safety goggles inside active plant zones.' },
    { category: 'first_aid', title: 'First Aid for Thermal Burns', content: 'For industrial heat/steam burns, immediately flush the area with clean, cold running water for 15-20 minutes. Cover loosely with sterile dressing. Call Plant Ambulance (102).' },
    { category: "ppe", title: "Official Bhilai Steel Plant Equipment List", content: "Official Bhilai Steel Plant Safety Equipment List:\n- **Head Protection**: Fibre helmet (protects against falling objects, hitting against objects), Crash helmet (for riding high-speed vehicles).\n- **Face Protection**: Plastic face shield (against chemical splashes, metal splash, dust, sparks), Welding helmet (heat, UV radiation, sparks for unstable positions), Welding screen (for stable positions).\n- **Eye Protection**: Welding glass [dark] (UV radiation, sparks), Green coloured goggle (heat/IR radiation for furnace), Spectacle type goggles with shatter proof lens (foreign bodies, dust, metal chips), Smelters' Furnace observation Glass (heat/IR radiation for liquid metal), Welder's/Gas cutter goggle (UV radiation), Acid/alkali proof rubber goggles (chemical splashes).\n- **Ear Protection**: Ear plugs, Ear muff (against high noise level).\n- **Nose Protection**: Dust respirator (against dust and powder particles).\n- **Body Protection**: Asbestos apron (Heat radiation), PVC apron / PVC suit (Splashing of chemicals), Flame Retardant suits (splashes of liquid metal, slag, shooting flames), Canvas apron / Canvas coat (sparks, metallic chips, radiant heat).\n- **Hand Protection**: Leather gloves (Cuts due to handling), Asbestos gloves (Heat radiation), Acid/alkali proof rubber gloves (handling acids), Electrical resistance gloves (Electric shock), Protective cream (Skin diseases).\n- **Leg Protection**: Canvas anklet/Khakki woolen patti (flying sparks, hot flue dust entering boot), Leather sole safety boots / DMS safety boot (striking/falling objects, sharp/hot objects).\n- **General Protection**: Safety belt (Falling from height), Rubber matting (Electrical shock while working on electrical installations)." }
  ]);
  console.log('Safety Rules Seeded');

  // Create Alerts
  await Alert.insertMany([
    { reporter: 'worker', category: 'Accident', description: 'Blast Furnace 1 ke paas minor oil spill hua tha.', location: 'Blast Furnace 1 Area', status: 'Verified', timestamp: new Date('2026-06-15') },
    { reporter: 'worker', category: 'Accident', description: 'Gate 3 par ek truck reverse karte time boundary wall se takraya.', location: 'Gate 3 Exit', status: 'Verified', timestamp: new Date('2026-06-16') },
    { reporter: 'worker', category: 'Fire', description: 'Gate 1 battery room safety check requires urgent review due to minor heat buildup.', location: 'Gate 1 Battery Room', status: 'Pending', timestamp: new Date() }
  ]);
  console.log('Alerts Seeded');

  console.log('Database Seeded Successfully');
  process.exit();
}).catch(err => {
  console.log('MongoDB Connection Failed for Seeding. Falling back to local JSON files...');
  try {
    writeLocalBackup();
    process.exit(0);
  } catch (e) {
    console.error('Failed to write local backup:', e);
    process.exit(1);
  }
});
