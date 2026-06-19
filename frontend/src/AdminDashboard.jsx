import React, { useState, useEffect } from 'react';

export default function AdminDashboard({ token, currentUser, goBack }) {
  const [activeTab, setActiveTab] = useState('alerts'); // 'alerts', 'vehicles', 'contacts', 'departments', 'rules'

  // Data states
  const [alerts, setAlerts] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [rules, setRules] = useState([]);

  // Form states
  const [vehicleForm, setVehicleForm] = useState({ plateNumber: '', driverName: '', gate: '', material: '', timeOfExit: '' });
  const [contactForm, setContactForm] = useState({ name: '', title: '', contactNumber: '' });
  const [deptForm, setDeptForm] = useState({ name: '', details: '', contactNumber: '', email: '' });
  const [ruleForm, setRuleForm] = useState({ category: 'fire', title: '', content: '' });

  // Edit IDs
  const [editingId, setEditingId] = useState(null);

  // Fetch all datasets on mount/activeTab change
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      if (activeTab === 'alerts') {
        const res = await fetch('http://localhost:5000/api/alerts', { headers });
        const data = await res.json();
        setAlerts(Array.isArray(data) ? data : []);
      } else if (activeTab === 'vehicles') {
        const res = await fetch('http://localhost:5000/api/vehicles', { headers });
        const data = await res.json();
        setVehicles(Array.isArray(data) ? data : []);
      } else if (activeTab === 'contacts') {
        const res = await fetch('http://localhost:5000/api/contacts', { headers });
        const data = await res.json();
        setContacts(Array.isArray(data) ? data : []);
      } else if (activeTab === 'departments') {
        const res = await fetch('http://localhost:5000/api/departments', { headers });
        const data = await res.json();
        setDepartments(Array.isArray(data) ? data : []);
      } else if (activeTab === 'rules') {
        const res = await fetch('http://localhost:5000/api/safetyrules', { headers });
        const data = await res.json();
        setRules(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Fetch error:', e);
    }
  };

  // Verification operations
  const handleVerifyAlert = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:5000/api/alerts/${id}/verify`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  // CRUD Operations: Vehicles
  const saveVehicle = async (e) => {
    e.preventDefault();
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
    try {
      if (editingId) {
        await fetch(`http://localhost:5000/api/vehicles/${editingId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(vehicleForm)
        });
      } else {
        await fetch('http://localhost:5000/api/vehicles', {
          method: 'POST',
          headers,
          body: JSON.stringify(vehicleForm)
        });
      }
      setVehicleForm({ plateNumber: '', driverName: '', gate: '', material: '', timeOfExit: '' });
      setEditingId(null);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteVehicle = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/vehicles/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  // CRUD Operations: Contacts
  const saveContact = async (e) => {
    e.preventDefault();
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
    try {
      if (editingId) {
        await fetch(`http://localhost:5000/api/contacts/${editingId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(contactForm)
        });
      } else {
        await fetch('http://localhost:5000/api/contacts', {
          method: 'POST',
          headers,
          body: JSON.stringify(contactForm)
        });
      }
      setContactForm({ name: '', title: '', contactNumber: '' });
      setEditingId(null);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteContact = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/contacts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  // CRUD Operations: Departments
  const saveDept = async (e) => {
    e.preventDefault();
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
    try {
      if (editingId) {
        await fetch(`http://localhost:5000/api/departments/${editingId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(deptForm)
        });
      } else {
        await fetch('http://localhost:5000/api/departments', {
          method: 'POST',
          headers,
          body: JSON.stringify(deptForm)
        });
      }
      setDeptForm({ name: '', details: '', contactNumber: '', email: '' });
      setEditingId(null);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteDept = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/departments/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  // CRUD Operations: Safety Rules
  const saveRule = async (e) => {
    e.preventDefault();
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
    try {
      if (editingId) {
        await fetch(`http://localhost:5000/api/safetyrules/${editingId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(ruleForm)
        });
      } else {
        await fetch('http://localhost:5000/api/safetyrules', {
          method: 'POST',
          headers,
          body: JSON.stringify(ruleForm)
        });
      }
      setRuleForm({ category: 'fire', title: '', content: '' });
      setEditingId(null);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteRule = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/safetyrules/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  // Fill forms for editing
  const startEditVehicle = (v) => {
    setEditingId(v._id);
    setVehicleForm({
      plateNumber: v.plateNumber,
      driverName: v.driverName,
      gate: v.gate,
      material: v.material,
      timeOfExit: v.timeOfExit ? new Date(v.timeOfExit).toISOString().split('T')[0] : ''
    });
  };

  const startEditContact = (c) => {
    setEditingId(c._id);
    setContactForm({ name: c.name, title: c.title, contactNumber: c.contactNumber });
  };

  const startEditDept = (d) => {
    setEditingId(d._id);
    setDeptForm({ name: d.name, details: d.details, contactNumber: d.contactNumber, email: d.email });
  };

  const startEditRule = (r) => {
    setEditingId(r._id);
    setRuleForm({ category: r.category, title: r.title, content: r.content });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setVehicleForm({ plateNumber: '', driverName: '', gate: '', material: '', timeOfExit: '' });
    setContactForm({ name: '', title: '', contactNumber: '' });
    setDeptForm({ name: '', details: '', contactNumber: '', email: '' });
    setRuleForm({ category: 'fire', title: '', content: '' });
  };

  return (
    <div className="dashboard-view">
      <div className="dashboard-header">
        <div>
          <div className="dashboard-title">Admin Control Panel</div>
          <div className="dashboard-subtitle">Bhilai Steel Plant — Safety Management</div>
        </div>
        <button className="back-to-chat-btn" onClick={goBack}>
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
          Back to Chat
        </button>
      </div>

      <div className="admin-tabs">
        <button className={`tab-btn ${activeTab === 'alerts' ? 'active' : ''}`} onClick={() => { setActiveTab('alerts'); cancelEdit(); }}>🚨 Alert Verification</button>
        <button className={`tab-btn ${activeTab === 'vehicles' ? 'active' : ''}`} onClick={() => { setActiveTab('vehicles'); cancelEdit(); }}>🚚 Vehicles</button>
        <button className={`tab-btn ${activeTab === 'contacts' ? 'active' : ''}`} onClick={() => { setActiveTab('contacts'); cancelEdit(); }}>📞 Contacts</button>
        <button className={`tab-btn ${activeTab === 'departments' ? 'active' : ''}`} onClick={() => { setActiveTab('departments'); cancelEdit(); }}>🏢 Departments</button>
        <button className={`tab-btn ${activeTab === 'rules' ? 'active' : ''}`} onClick={() => { setActiveTab('rules'); cancelEdit(); }}>📋 Safety Rules</button>
      </div>

      <div>
        {/* ALERTS TAB */}
        {activeTab === 'alerts' && (
          <div>
            <div className="dashboard-stats">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.12)' }}>⏳</div>
                <div className="stat-info">
                  <div className="stat-num">{alerts.filter(a => a.status === 'Pending').length}</div>
                  <div className="stat-label">Pending Alerts</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(34,197,94,0.12)' }}>✅</div>
                <div className="stat-info">
                  <div className="stat-num" style={{ color: '#86efac' }}>{alerts.filter(a => a.status === 'Verified').length}</div>
                  <div className="stat-label">Verified Alerts</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.12)' }}>❌</div>
                <div className="stat-info">
                  <div className="stat-num" style={{ color: '#fca5a5' }}>{alerts.filter(a => a.status === 'Rejected').length}</div>
                  <div className="stat-label">Rejected</div>
                </div>
              </div>
            </div>

            <div className="table-wrapper">
              <div className="table-header-row">
                <div className="table-title">Alert Verification Log</div>
              </div>
              <table className="incidents-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Location / Description</th>
                    <th>Reporter</th>
                    <th>Actions / Status</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map(a => (
                    <tr key={a._id}>
                      <td style={{ fontWeight: '600' }}>🚨 {a.category}</td>
                      <td>
                        <div style={{ fontWeight: '500' }}>📍 {a.location}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '3px' }}>{a.description}</div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{a.reporter}</td>
                      <td>
                        {a.status === 'Pending' ? (
                          <div className="action-btns-row">
                            <button className="verify-action-btn verify" onClick={() => handleVerifyAlert(a._id, 'Verified')}>✓ Verify</button>
                            <button className="verify-action-btn reject" onClick={() => handleVerifyAlert(a._id, 'Rejected')}>✗ Reject</button>
                          </div>
                        ) : (
                          <span className={`status-badge ${a.status.toLowerCase()}`}>{a.status}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {alerts.length === 0 && (
                    <tr><td colSpan="4" className="empty-state">No alerts reported yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VEHICLES TAB */}
        {activeTab === 'vehicles' && (
          <div>
            <form onSubmit={saveVehicle} className="admin-form">
              <h3>{editingId ? '✏️ Edit Vehicle Log' : '➕ Add Vehicle Entry'}</h3>
              <div className="form-row">
                <input type="text" placeholder="Plate No (e.g. CG04AB1234)" value={vehicleForm.plateNumber} onChange={e => setVehicleForm({...vehicleForm, plateNumber: e.target.value})} required />
                <input type="text" placeholder="Driver Name" value={vehicleForm.driverName} onChange={e => setVehicleForm({...vehicleForm, driverName: e.target.value})} required />
              </div>
              <div className="form-row">
                <input type="text" placeholder="Gate No" value={vehicleForm.gate} onChange={e => setVehicleForm({...vehicleForm, gate: e.target.value})} required />
                <input type="text" placeholder="Material Load" value={vehicleForm.material} onChange={e => setVehicleForm({...vehicleForm, material: e.target.value})} required />
              </div>
              {editingId && (
                <input type="date" value={vehicleForm.timeOfExit} onChange={e => setVehicleForm({...vehicleForm, timeOfExit: e.target.value})} />
              )}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="submit" className="submit-form-btn">{editingId ? 'Update Entry' : 'Register Vehicle'}</button>
                {editingId && <button type="button" className="cancel-form-btn" onClick={cancelEdit}>Cancel</button>}
              </div>
            </form>

            <div className="table-wrapper">
              <div className="table-header-row"><div className="table-title">Vehicles in Plant</div></div>
              <table className="incidents-table">
                <thead><tr>
                  <th>Plate No</th><th>Driver / Material</th><th>Gate & Times</th><th>Actions</th>
                </tr></thead>
                <tbody>
                  {vehicles.map(v => (
                    <tr key={v._id}>
                      <td style={{ fontWeight: '700', fontFamily: 'monospace', fontSize: '0.95rem' }}>{v.plateNumber}</td>
                      <td>
                        <div style={{ fontWeight: '500' }}>👨‍✈️ {v.driverName}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>📦 {v.material}</div>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        <div>🚪 Gate {v.gate}</div>
                        <div>📥 {new Date(v.timeOfEntry).toLocaleString()}</div>
                        {v.timeOfExit ? (
                          <div style={{ color: '#86efac' }}>📤 {new Date(v.timeOfExit).toLocaleDateString()}</div>
                        ) : (
                          <div style={{ color: 'var(--primary)' }}>🟡 Inside</div>
                        )}
                      </td>
                      <td>
                        <div className="action-btns-row">
                          <button className="crud-action-btn edit" onClick={() => startEditVehicle(v)}>Edit</button>
                          <button className="crud-action-btn delete" onClick={() => deleteVehicle(v._id)}>Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {vehicles.length === 0 && <tr><td colSpan="4" className="empty-state">No vehicles registered.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* EMERGENCY CONTACTS TAB */}
        {activeTab === 'contacts' && (
          <div>
            <form onSubmit={saveContact} className="admin-form">
              <h3>{editingId ? '✏️ Edit Emergency Contact' : '➕ Add Emergency Contact'}</h3>
              <input type="text" placeholder="Contact Name (e.g. Fire Control Room)" value={contactForm.name} onChange={e => setContactForm({...contactForm, name: e.target.value})} required />
              <input type="text" placeholder="Description / Title" value={contactForm.title} onChange={e => setContactForm({...contactForm, title: e.target.value})} required />
              <input type="text" placeholder="Phone Number" value={contactForm.contactNumber} onChange={e => setContactForm({...contactForm, contactNumber: e.target.value})} required />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="submit" className="submit-form-btn">{editingId ? 'Update' : 'Add Contact'}</button>
                {editingId && <button type="button" className="cancel-form-btn" onClick={cancelEdit}>Cancel</button>}
              </div>
            </form>
            <div className="table-wrapper">
              <div className="table-header-row"><div className="table-title">Emergency Contacts</div></div>
              <table className="incidents-table">
                <thead><tr><th>Name</th><th>Role</th><th>Number</th><th>Actions</th></tr></thead>
                <tbody>
                  {contacts.map(c => (
                    <tr key={c._id}>
                      <td style={{ fontWeight: '600' }}>📞 {c.name}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{c.title}</td>
                      <td style={{ fontWeight: '600', color: 'var(--primary)', fontFamily: 'monospace' }}>{c.contactNumber}</td>
                      <td><div className="action-btns-row">
                        <button className="crud-action-btn edit" onClick={() => startEditContact(c)}>Edit</button>
                        <button className="crud-action-btn delete" onClick={() => deleteContact(c._id)}>Del</button>
                      </div></td>
                    </tr>
                  ))}
                  {contacts.length === 0 && <tr><td colSpan="4" className="empty-state">No contacts added.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DEPARTMENTS TAB */}
        {activeTab === 'departments' && (
          <div>
            <form onSubmit={saveDept} className="admin-form">
              <h3>{editingId ? '✏️ Edit Department' : '➕ Add Department'}</h3>
              <input type="text" placeholder="Dept Name (e.g. Safety Department)" value={deptForm.name} onChange={e => setDeptForm({...deptForm, name: e.target.value})} required />
              <textarea placeholder="Department Details / Scope of work" value={deptForm.details} onChange={e => setDeptForm({...deptForm, details: e.target.value})} required style={{ minHeight: '70px', resize: 'vertical' }} />
              <div className="form-row">
                <input type="text" placeholder="Contact Number" value={deptForm.contactNumber} onChange={e => setDeptForm({...deptForm, contactNumber: e.target.value})} required />
                <input type="email" placeholder="Email Address" value={deptForm.email} onChange={e => setDeptForm({...deptForm, email: e.target.value})} required />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="submit" className="submit-form-btn">{editingId ? 'Update' : 'Add Department'}</button>
                {editingId && <button type="button" className="cancel-form-btn" onClick={cancelEdit}>Cancel</button>}
              </div>
            </form>
            <div className="table-wrapper">
              <div className="table-header-row"><div className="table-title">Plant Departments</div></div>
              <table className="incidents-table">
                <thead><tr><th>Department</th><th>Contact Info</th><th>Actions</th></tr></thead>
                <tbody>
                  {departments.map(d => (
                    <tr key={d._id}>
                      <td>
                        <div style={{ fontWeight: '600' }}>🏢 {d.name}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '3px' }}>{d.details}</div>
                      </td>
                      <td style={{ fontSize: '0.82rem' }}>
                        <div style={{ color: 'var(--primary)', fontWeight: '500' }}>📞 {d.contactNumber}</div>
                        <div style={{ color: 'var(--text-secondary)', marginTop: '3px' }}>✉️ {d.email}</div>
                      </td>
                      <td><div className="action-btns-row">
                        <button className="crud-action-btn edit" onClick={() => startEditDept(d)}>Edit</button>
                        <button className="crud-action-btn delete" onClick={() => deleteDept(d._id)}>Del</button>
                      </div></td>
                    </tr>
                  ))}
                  {departments.length === 0 && <tr><td colSpan="3" className="empty-state">No departments added.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SAFETY RULES TAB */}
        {activeTab === 'rules' && (
          <div>
            <form onSubmit={saveRule} className="admin-form">
              <h3>{editingId ? '✏️ Edit Safety Rule' : '➕ Create Safety Rule'}</h3>
              <div className="form-row">
                <select value={ruleForm.category} onChange={e => setRuleForm({...ruleForm, category: e.target.value})}>
                  <option value="fire">🔥 Fire Safety</option>
                  <option value="gas">💨 Gas Leak Safety</option>
                  <option value="electrical">⚡ Electrical Safety</option>
                  <option value="ppe">🦺 PPE Protocols</option>
                  <option value="first_aid">🩹 First Aid</option>
                </select>
                <input type="text" placeholder="Rule Title (e.g. LOTO Isolation Procedure)" value={ruleForm.title} onChange={e => setRuleForm({...ruleForm, title: e.target.value})} required />
              </div>
              <textarea placeholder="Describe rule instructions in detail..." value={ruleForm.content} onChange={e => setRuleForm({...ruleForm, content: e.target.value})} required style={{ minHeight: '80px', resize: 'vertical' }} />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="submit" className="submit-form-btn">{editingId ? 'Update Rule' : 'Create Rule'}</button>
                {editingId && <button type="button" className="cancel-form-btn" onClick={cancelEdit}>Cancel</button>}
              </div>
            </form>
            <div className="table-wrapper">
              <div className="table-header-row"><div className="table-title">Safety Rules Knowledge Base</div></div>
              <table className="incidents-table">
                <thead><tr><th>Category / Title</th><th>Description</th><th>Actions</th></tr></thead>
                <tbody>
                  {rules.map(r => (
                    <tr key={r._id}>
                      <td>
                        <span className="status-badge pending" style={{ fontSize: '0.7rem', marginBottom: '6px', display: 'inline-block' }}>{r.category.toUpperCase()}</span>
                        <div style={{ fontWeight: '600', marginTop: '4px' }}>{r.title}</div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', maxWidth: '400px' }}>{r.content}</td>
                      <td><div className="action-btns-row">
                        <button className="crud-action-btn edit" onClick={() => startEditRule(r)}>Edit</button>
                        <button className="crud-action-btn delete" onClick={() => deleteRule(r._id)}>Del</button>
                      </div></td>
                    </tr>
                  ))}
                  {rules.length === 0 && <tr><td colSpan="3" className="empty-state">No safety rules added yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
