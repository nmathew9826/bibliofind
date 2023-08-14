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


class ContactUsMailer {
  async sendMail(body) {
    console.log(body)
    let subject
    let message
    
    message = 'Query from ' + body.email + '\n'+ body.message;
    subject = 'Contact us query';

    const mailOptions = {
      from: config.email,
      to: config.adminMail,
      subject: subject,
      html: message
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        return promise.reject(error);
      } else {
        console.log('Email sent: ' + info.response);
        return promise.resolve();
      }
    });
  }
}

module.exports = new ContactUsMailer()

