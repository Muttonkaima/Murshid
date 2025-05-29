const nodemailer = require('nodemailer');
const AppError = require('./appError');

const sendEmail = async (options) => {
  console.log('=== Starting sendEmail ===');
  console.log('Email options received:', {
    to: options.email,
    subject: options.subject,
    message: options.message ? 'Message present' : 'No message'
  });

  try {
    // Verify required environment variables
    const requiredEnvVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USERNAME', 'EMAIL_PASSWORD'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      const errorMsg = `Missing required email configuration: ${missingVars.join(', ')}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    console.log('Email configuration:', {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USERNAME,
      hasPassword: !!process.env.EMAIL_PASSWORD
    });

    // 1) Create a transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT, 10),
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: false // Only for development
      },
      debug: true,
      logger: true
    });

    // 2) Define the email options
    const mailOptions = {
      from: `"Murshid" <${process.env.EMAIL_USERNAME}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      // html: options.html
    };

    console.log('Attempting to send email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      messagePreview: options.message ? options.message.substring(0, 50) + '...' : 'No message'
    });

    // 3) Actually send the email
    console.log('Sending email...');
    const info = await transporter.sendMail(mailOptions);
    
    console.log('=== Email Sent Successfully ===');
    console.log('Message ID:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    
    return info;
  } catch (error) {
    console.error('=== Email Sending Failed ===');
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    if (error.responseCode) {
      console.error('SMTP Response Code:', error.responseCode);
    }
    if (error.response) {
      console.error('SMTP Response:', error.response);
    }
    
    throw new AppError('There was an error sending the email. Please try again later!', 500);
  } finally {
    console.log('=== End of sendEmail ===');
  }
};

module.exports = sendEmail;
