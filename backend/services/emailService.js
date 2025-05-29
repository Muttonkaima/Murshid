const nodemailer = require('nodemailer');
require('dotenv').config();
const { checkenvmode } = require('../config/db');

let transporter;
let mail_from;

const initializeEmailService = () => {
  if(process.env.MODE === 'production') {
    // setup the aws smtp server
    transporter =  nodemailer.createTransport({
      host: 'email-smtp.ap-southeast-1.amazonaws.com',
      auth: {
        user: checkenvmode() ? process.env.PROD_EMAIL_USER : process.env.EMAIL_USER,
        pass: checkenvmode() ? process.env.PROD_EMAIL_APP_PASSWORD : process.env.EMAIL_APP_PASSWORD,
      },
      port: 587,
      secure: false,
      tls: {
        // do not fail on invalid certs:
        rejectUnauthorized: false
      }
    });
    mail_from = "admin@smarteam.in"; 
  }
  else{
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: checkenvmode() ? process.env.PROD_EMAIL_USER : process.env.EMAIL_USER,
        pass: checkenvmode() ? process.env.PROD_EMAIL_APP_PASSWORD : process.env.EMAIL_APP_PASSWORD,
      },
    });
    mail_from = process.env.EMAIL_USER;
  }

  console.log("Email Configured", transporter.options);
  return { transporter, mail_from };
};

const sendEmail = async (to, subject, html) => {
  const { transporter, mail_from } = initializeEmailService();
  
  try {
    const result = await transporter.sendMail({
      from: checkenvmode() ? mail_from : process.env.EMAIL_USER,
      to,
      subject,
      html
    });
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = {
  initializeEmailService,
  sendEmail
};
