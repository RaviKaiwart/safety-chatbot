const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.log('❌ Email setup error:', error.message);
    } else {
        console.log('✅ Email server is ready to send messages');
    }
});

const sendAlertEmail = async (alertData) => {
    const { type, location, description, workerName, alertId } = alertData;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #E2483D, #F4B400); padding: 30px; color: white; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; letter-spacing: 1px; }
        .header p { margin: 10px 0 0; opacity: 0.95; font-size: 14px; }
        .alert-banner { background: #fff3cd; border-left: 5px solid #F4B400; padding: 16px 20px; color: #856404; }
        .content { padding: 30px; }
        .info-grid { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .info-row { display: flex; padding: 12px 0; border-bottom: 1px solid #e9ecef; }
        .info-row:last-child { border-bottom: none; }
        .info-label { font-weight: bold; color: #666; width: 140px; font-size: 14px; }
        .info-value { color: #333; flex: 1; font-size: 14px; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; background: #F4B400; color: #1B1304; font-size: 12px; font-weight: bold; text-transform: uppercase; }
        .buttons { display: flex; gap: 12px; margin: 30px 0; }
        .btn { display: inline-block; padding: 16px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; text-align: center; flex: 1; font-size: 16px; }
        .btn-approve { background: #3FA66A; color: white; }
        .btn-reject { background: #E2483D; color: white; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #e9ecef; }
        .footer strong { color: #F4B400; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚨 EMERGENCY ALERT 🚨</h1>
          <p>AI-Based Industrial Safety Chatbot</p>
        </div>
        
        <div class="alert-banner">
          <strong>⚠️ Immediate action required!</strong><br>
          A worker has raised an emergency alert. Please verify and take action.
        </div>
        
        <div class="content">
          <h2 style="color: #333; margin-bottom: 10px;">📋 Alert Details</h2>
          
          <div class="info-grid">
            <div class="info-row">
              <div class="info-label">🆔 Alert ID:</div>
              <div class="info-value"><code style="background: #fff; padding: 2px 8px; border-radius: 4px; color: #E2483D;">#${alertId}</code></div>
            </div>
            <div class="info-row">
              <div class="info-label">🔥 Type:</div>
              <div class="info-value"><span class="badge">${type}</span></div>
            </div>
            <div class="info-row">
              <div class="info-label">📍 Location:</div>
              <div class="info-value"><strong>${location}</strong></div>
            </div>
            <div class="info-row">
              <div class="info-label">👷 Reported By:</div>
              <div class="info-value">${workerName || 'Anonymous Worker'}</div>
            </div>
            <div class="info-row">
              <div class="info-label">📝 Description:</div>
              <div class="info-value">${description}</div>
            </div>
            <div class="info-row">
              <div class="info-label">⏰ Time:</div>
              <div class="info-value">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</div>
            </div>
          </div>
          
          <h3 style="color: #333; margin: 25px 0 15px;">⚡ Quick Actions:</h3>
          
          <div class="buttons">
            <a href="http://localhost:5000/api/alerts/${alertId}/approve" class="btn btn-approve">✓ APPROVE</a>
            <a href="http://localhost:5000/api/alerts/${alertId}/reject" class="btn btn-reject">✗ REJECT</a>
          </div>
        </div>
        
        <div class="footer">
          <strong>AI-Based</strong> · Industrial Safety Chatbot · v1.0<br>
          This is an automated alert. Do not reply to this email.
        </div>
      </div>
    </body>
    </html>
  `;

    const mailOptions = {
        from: `"🚨 AI-Based Industrial Safety Chatbot Alert" <${process.env.EMAIL_USER}>`,
        to: process.env.OFFICER_EMAIL,
        subject: `🚨 URGENT: ${type} Alert at ${location} - Action Required`,
        html: htmlContent,
        priority: 'high'
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully!');
        console.log('   Message ID:', info.messageId);
        console.log('   To:', process.env.OFFICER_EMAIL);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Email sending failed:', error.message);
        return { success: false, error: error.message };
    }
};

module.exports = { sendAlertEmail };