import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { AlertTriangle, Clock, CheckCircle, Activity, TrendingUp, TrendingDown } from 'lucide-react';

export default function AnalyticsView({ alerts, weeklyData, weeklyLabels, fireCount, gasCount, electricCount, otherCount, pendingAlerts, verifiedAlerts, language = "en" }) {
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
  
  const trendData = weeklyLabels.map((lbl, i) => ({
    name: lbl,
    Total: weeklyData[i],
    Verified: Math.floor(weeklyData[i] * 0.8) // Simulated metric for verified
  }));

  const pieData = [
    { name: 'Fire', value: fireCount, color: '#e24b4a' },
    { name: 'Gas Leak', value: gasCount, color: '#ef9f27' },
    { name: 'Electrical', value: electricCount, color: '#378add' },
    { name: 'Other', value: otherCount, color: '#1d9e75' }
  ].filter(d => d.value > 0);

  const barData = weeklyLabels.map((lbl, i) => ({
    name: lbl,
    Fire: Math.floor(weeklyData[i] * 0.4),
    Gas: Math.floor(weeklyData[i] * 0.3),
    Electrical: Math.floor(weeklyData[i] * 0.3)
  }));

  const styles = {
    container: { display: "flex", flexDirection: "column", gap: "20px", color: "#ECE7DC", paddingBottom: "20px" },
    row1: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" },
    statCard: (bg) => ({
      background: bg, border: "0.5px solid rgba(236,231,220,0.10)", borderRadius: "12px", padding: "16px",
      display: "flex", flexDirection: "column", position: "relative", overflow: "hidden"
    }),
    statIconWrap: (color) => ({
      width: "36px", height: "36px", borderRadius: "8px", background: color,
      display: "flex", alignItems: "center", justifyContent: "center", color: "#ECE7DC",
      marginBottom: "12px"
    }),
    statTrend: (isUp) => ({
      position: "absolute", top: "16px", right: "16px", fontSize: "11px", fontWeight: 600,
      color: isUp ? "#1d9e75" : "#e24b4a", display: "flex", alignItems: "center", gap: "4px"
    }),
    statTitle: { fontSize: "11px", color: "#A9A79D", marginBottom: "4px" },
    statValue: { fontSize: "28px", fontWeight: 600, color: "#ECE7DC", fontFamily: "'Oswald', sans-serif" },
    row2: { display: "grid", gridTemplateColumns: "2.5fr 1fr", gap: "16px" },
    card: { background: "#1B2025", border: "0.5px solid rgba(236,231,220,0.10)", borderRadius: "12px", padding: "20px" },
    cardHeader: { display: "flex", flexDirection: "column", marginBottom: "16px" },
    cardTitle: { fontSize: "18px", fontWeight: 500, color: "#ECE7DC", fontFamily: "'Oswald', sans-serif" },
    cardSub: { fontSize: "12px", color: "#A9A79D", marginTop: "4px" },
    summaryBox: (borderCol) => ({
      background: "#1B2025", borderLeft: `3px solid ${borderCol}`, borderRadius: "6px",
      padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center",
      marginBottom: "12px"
    }),
    row3: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
    table: { width: "100%", borderCollapse: "collapse", marginTop: "10px" },
    th: { textAlign: "left", padding: "12px", fontSize: "12px", color: "#A9A79D", borderBottom: "1px solid rgba(236,231,220,0.10)" },
    td: { padding: "12px", fontSize: "13px", color: "#ECE7DC", borderBottom: "1px solid rgba(236,231,220,0.10)" },
    badge: (status) => {
      const map = {
        Pending: { bg: "#251a08", col: "#ef9f27" },
        Verified: { bg: "#0a1e14", col: "#1d9e75" },
        Rejected: { bg: "#2a1010", col: "#e24b4a" }
      };
      const t = map[status] || map.Pending;
      return { background: t.bg, color: t.col, padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: 600 };
    }
  };

  return (
    <div style={styles.container}>
      {/* ROW 1: Stats */}
      <div style={styles.row1}>
        <div style={styles.statCard("#1B2025")}>
          <div style={styles.statIconWrap("#F4B400")}><Activity size={18} /></div>
          <div style={styles.statTrend(true)}><TrendingUp size={14} /> +12.5%</div>
          <div style={styles.statTitle}>Total Alerts</div>
          <div style={styles.statValue}>{alerts.length}</div>
        </div>
        <div style={styles.statCard("#251018")}>
          <div style={styles.statIconWrap("#e24b4a")}><AlertTriangle size={18} /></div>
          <div style={styles.statTrend(false)}><TrendingDown size={14} /> -2.4%</div>
          <div style={styles.statTitle}>Pending Alerts</div>
          <div style={styles.statValue}>{pendingAlerts.length}</div>
        </div>
        <div style={styles.statCard("#0a1e14")}>
          <div style={styles.statIconWrap("#1d9e75")}><CheckCircle size={18} /></div>
          <div style={styles.statTrend(true)}><TrendingUp size={14} /> +8.2%</div>
          <div style={styles.statTitle}>Verified Alerts</div>
          <div style={styles.statValue}>{verifiedAlerts.length}</div>
        </div>
        <div style={styles.statCard("#251a08")}>
          <div style={styles.statIconWrap("#ef9f27")}><Clock size={18} /></div>
          <div style={styles.statTrend(true)}><TrendingUp size={14} /> +4.3%</div>
          <div style={styles.statTitle}>Avg Response Time</div>
          <div style={styles.statValue}>14m</div>
        </div>
      </div>

      {/* ROW 2: Trend & Summary */}
      <div style={styles.row2}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>{t("Alerts & Resolution Trend")}</span>
            <span style={styles.cardSub}>Last 7 days performance</span>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F4B400" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F4B400" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e24b4a" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#e24b4a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(236,231,220,0.10)" vertical={false} />
                <XAxis dataKey="name" stroke="#A9A79D" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#A9A79D" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1B2025', borderColor: 'rgba(236,231,220,0.10)', borderRadius: '8px' }}
                  itemStyle={{ color: '#ECE7DC' }}
                />
                <Area type="monotone" dataKey="Total" stroke="#F4B400" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                <Area type="monotone" dataKey="Verified" stroke="#e24b4a" strokeWidth={3} fillOpacity={1} fill="url(#colorVerified)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>{t("Summary Stats")}</span>
          </div>
          <div style={{ marginTop: "20px" }}>
            <div style={styles.summaryBox("#F4B400")}>
              <span style={{ fontSize: "12px", color: "#A9A79D" }}>Avg Verification</span>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "#F4B400" }}>14 min</span>
            </div>
            <div style={styles.summaryBox("#ef9f27")}>
              <span style={{ fontSize: "12px", color: "#A9A79D" }}>AI Accuracy Rate</span>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "#ef9f27" }}>94.2%</span>
            </div>
            <div style={styles.summaryBox("#1d9e75")}>
              <span style={{ fontSize: "12px", color: "#A9A79D" }}>Protocol Compliance</span>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "#1d9e75" }}>89.5%</span>
            </div>
            <div style={styles.summaryBox("#378add")}>
              <span style={{ fontSize: "12px", color: "#A9A79D" }}>False Alarm Rate</span>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "#378add" }}>12.4%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 3: Monthly & Category */}
      <div style={styles.row3}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>Weekly Category Performance</span>
            <span style={styles.cardSub}>Alerts type breakdown over time</span>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(236,231,220,0.10)" vertical={false} />
                <XAxis dataKey="name" stroke="#A9A79D" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#A9A79D" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1B2025', borderColor: 'rgba(236,231,220,0.10)' }} cursor={{fill: 'rgba(236,231,220,0.05)'}} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#A9A79D' }} />
                <Bar dataKey="Fire" fill="#e24b4a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Gas" fill="#ef9f27" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Electrical" fill="#378add" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>Alerts by Category</span>
            <span style={styles.cardSub}>Distribution breakdown</span>
          </div>
          <div style={{ width: '100%', height: 300, display: 'flex', justifyContent: 'center' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1B2025', borderColor: 'rgba(236,231,220,0.10)', borderRadius: '8px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ROW 4: Recent Alerts Table */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <span style={styles.cardTitle}>Recent Alerts</span>
          <span style={styles.cardSub}>Latest incoming hazard notifications</span>
        </div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Alert ID</th>
              <th style={styles.th}>Reporter</th>
              <th style={styles.th}>Location</th>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Time</th>
            </tr>
          </thead>
          <tbody>
            {alerts.slice(0, 5).map((a, i) => (
              <tr key={i}>
                <td style={styles.td}>#{a._id.substring(a._id.length - 5)}</td>
                <td style={styles.td}>{a.reporter || "Unknown"}</td>
                <td style={styles.td}>{a.location}</td>
                <td style={styles.td}>{a.category}</td>
                <td style={styles.td}>
                  <span style={styles.badge(a.status)}>{a.status}</span>
                </td>
                <td style={styles.td}>{new Date(a.timestamp).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
