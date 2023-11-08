const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    service: "gmail", // Replace with your email service provider
    auth: {
      user: process.env.GOOGLE_ID, // Your email address
      pass: process.env.GOOGLE_PASS, // Your email password
    },
  });

  // Define email options
  const mailOptions = {
    from: process.env.GOOGLE_ID,
    to: to,
    subject: subject,
    text: text,
  };

  // Send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
