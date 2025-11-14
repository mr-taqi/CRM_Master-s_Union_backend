const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: options.email,
      subject: options.subject,
      html: options.html
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

const sendLeadNotification = async (userEmail, leadName, action) => {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>CRM Notification</h2>
      <p>A lead has been ${action}:</p>
      <p><strong>Lead Name:</strong> ${leadName}</p>
      <p>Please check your CRM dashboard for more details.</p>
    </div>
  `;

  await sendEmail({
    email: userEmail,
    subject: `Lead ${action}: ${leadName}`,
    html
  });
};

module.exports = { sendEmail, sendLeadNotification };

