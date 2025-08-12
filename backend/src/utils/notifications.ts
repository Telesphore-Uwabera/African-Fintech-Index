import nodemailer from 'nodemailer';

// Email utility function
export async function sendEmail(to: string, subject: string, text: string) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
    });
    console.log(`✅ Email sent to: ${to}`);
  } catch (error) {
    console.error('❌ Failed to send email:', error);
  }
}

// Phone notification utility function (placeholder for SMS service)
export async function sendPhoneNotification(phone: string, message: string) {
  try {
    // TODO: Integrate with SMS service (Twilio, Africa's Talking, etc.)
    // For now, log the notification
    console.log(`📱 Phone notification to ${phone}: ${message}`);
    
    // You can integrate with services like:
    // - Twilio: https://www.twilio.com/
    // - Africa's Talking: https://africastalking.com/
    // - MessageBird: https://messagebird.com/
    
    return true;
  } catch (error) {
    console.error('❌ Failed to send phone notification:', error);
    return false;
  }
}
