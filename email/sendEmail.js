const sgMail = require('@sendgrid/mail');
require('dotenv').config();

const sendEmail = async (user_email, email,subject, text, html) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    to: user_email,
    from: email,
    subject: subject,
    text: text,
    html: html
  };

  try {
    await sgMail.send(msg);
    console.log('Email sent');
  } catch (error) {
    console.log('Email not sent!');
    console.error(error);
    return error;
  }
};

module.exports = sendEmail;
