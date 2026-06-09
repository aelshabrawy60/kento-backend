const nodemailer = require("nodemailer");

// Create a transporter using standard SMTP (configured for Zoho Mail).
// The user should set SMTP_HOST (defaults to smtp.zoho.com), SMTP_PORT (defaults to 465), SMTP_USER, and SMTP_PASS in .env
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.zoho.com",
  port: process.env.SMTP_PORT || 465,
  secure: process.env.SMTP_PORT == 465 ? true : false, // true for port 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Returns an HTML string with good copywriting based on the notification type.
 */
const getEmailTemplate = (type, message) => {
  let subject = "New Notification from Kentograph";
  let title = "You have a new notification!";
  let body = message;

  switch (type) {
    case "BOOKING_CREATED":
      subject = "🎉 New Booking Request on Kentograph!";
      title = "Great News! You have a new booking request.";
      body = `Hi there!<br><br>We are thrilled to let you know that a client has requested your services. Log in to your vendor dashboard to review the details and accept the booking.<br><br><strong>Message:</strong> ${message}`;
      break;
    case "BOOKING_ACCEPTED":
      subject = "✅ Your Booking was Accepted!";
      title = "Booking Accepted!";
      body = `Hello!<br><br>Good news! Your booking request has been accepted by the vendor. Get ready for an amazing experience. You can view the details in your client dashboard.<br><br><strong>Message:</strong> ${message}`;
      break;
    case "BOOKING_REJECTED":
      subject = "❌ Update on your Booking Request";
      title = "Booking Update";
      body = `Hello,<br><br>Unfortunately, the vendor is unable to accept your booking request at this time. Don't worry, there are many other talented vendors on Kentograph ready to help you!<br><br><strong>Message:</strong> ${message}`;
      break;
    case "COMPLETION_REQUESTED":
      subject = "📸 Please Review Your Completed Service";
      title = "Service Completion Requested";
      body = `Hi there,<br><br>Your vendor has marked the service as completed! Please review the work and confirm the completion on your dashboard so the vendor can get paid.<br><br><strong>Message:</strong> ${message}`;
      break;
    case "BOOKING_COMPLETED":
      subject = "🎊 Booking Officially Completed!";
      title = "Congratulations!";
      body = `Hello,<br><br>The client has confirmed that the service is complete! Great job. The payment will be processed according to our platform terms.<br><br><strong>Message:</strong> ${message}`;
      break;
    default:
      subject = "Notification from Kentograph";
      title = "Kentograph Notification";
      body = `You have a new notification.<br><br><strong>Message:</strong> ${message}`;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 10px; overflow: hidden;">
      <div style="background-color: #4F46E5; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Kentograph</h1>
      </div>
      <div style="padding: 30px; background-color: #ffffff; color: #333333; line-height: 1.6;">
        <h2 style="color: #4F46E5; margin-top: 0;">${title}</h2>
        <p style="font-size: 16px;">${body}</p>
        <div style="margin-top: 30px; text-align: center;">
          <a href="http://localhost:5173" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">View Dashboard</a>
        </div>
      </div>
      <div style="background-color: #f9f9f9; padding: 15px; text-align: center; color: #888888; font-size: 12px;">
        <p style="margin: 0;">© ${new Date().getFullYear()} Kentograph. All rights reserved.</p>
        <p style="margin: 5px 0 0 0;">You are receiving this email because you opted into notifications.</p>
      </div>
    </div>
  `;

  return { subject, html };
};

exports.sendNotificationEmail = async (to, type, message) => {
  try {
    // If SMTP_USER is not set, we can just log and skip to prevent crashing
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log("Email notifications skipped: SMTP_USER or SMTP_PASS not defined in .env");
      return;
    }

    const { subject, html } = getEmailTemplate(type, message);

    const mailOptions = {
      from: `"Kentograph" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    // Don't throw so it doesn't break the main notification flow
  }
};
