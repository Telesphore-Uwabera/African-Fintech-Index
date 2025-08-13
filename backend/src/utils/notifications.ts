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

// Phone notification utility function using Twilio
export async function sendPhoneNotification(phone: string, message: string) {
  try {
    // Check if Twilio is configured
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
    const senderName = process.env.TWILIO_SENDER_NAME || 'African Fintech Index';
    
    if (!accountSid || !authToken || !twilioPhone) {
      // Fallback to console log if not configured
      console.log(`📱 Phone notification to ${phone}: ${message}`);
      console.log('💡 To enable real SMS, set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in .env');
      return true;
    }

    // Twilio API endpoint
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: phone,
        From: twilioPhone,
        Body: `[${senderName}] ${message}`
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ SMS sent to ${phone}: ${message}`);
      console.log('📱 Twilio Response:', result);
      return true;
    } else {
      const errorText = await response.text();
      console.error(`❌ SMS failed for ${phone}:`, errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to send phone notification:', error);
    // Fallback to console log
    console.log(`📱 Phone notification to ${phone}: ${message}`);
    return false;
  }
}
