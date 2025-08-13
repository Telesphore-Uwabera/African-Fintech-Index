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

// Phone notification utility function using Africa's Talking
export async function sendPhoneNotification(phone: string, message: string) {
  try {
    // Check if Africa's Talking is configured
    const username = process.env.AFRICASTALKING_USERNAME;
    const apiKey = process.env.AFRICASTALKING_API_KEY;
    
    if (!username || !apiKey) {
      // Fallback to console log if not configured
      console.log(`📱 Phone notification to ${phone}: ${message}`);
      console.log('💡 To enable real SMS, set AFRICASTALKING_USERNAME and AFRICASTALKING_API_KEY in .env');
      return true;
    }

    // Format phone number for Africa's Talking (remove + and add country code)
    const formattedPhone = phone.startsWith('+') ? phone.substring(1) : phone;
    
    // Africa's Talking API endpoint
    const url = 'https://api.africastalking.com/version1/messaging';
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'apiKey': apiKey,
      },
      body: new URLSearchParams({
        username: username,
        to: formattedPhone,
        message: message,
        from: 'AFRICAN-FINTECH' // Your sender ID (will show as "AFRICAN-FINTECH")
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ SMS sent to ${phone}: ${message}`);
      console.log('📱 SMS Response:', result);
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
