let nodemailer = require('nodemailer');
let config = require('../../utils/config')
var fs = require('fs');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.email,
    pass: config.emailPassword
  }
});


class MailHelper {
  async sendForgetPasswordMail(toMail, token) {
    console.log(toMail, token)
    let subject
    let message
    const resetURL = `http://${config.host}:${config.port}/reset-password/${token}`
    message = 'Use following link to reset password ' + resetURL;
    subject = 'Reset Password';

    const mailOptions = {
      from: config.email,
      to: toMail,
      subject: subject,
      html: message
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  }
}

module.exports = new MailHelper()

