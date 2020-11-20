const nodemailer = require('nodemailer');


module.exports = class Email {
  constructor(user, html) {
    this.to = user.email;
    this.from = `Cooking-Recipe ${process.env.EMAIL_FROM}`;
    this.html = html;
  }

  newTransport() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
      //Activate in gmail "less secure app" option
    });
  }

  //Send actual email
  async send(subject) {

    // Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html: this.html,
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send(
        'Welcome to us!'
    );
  }

  async newAccountCreated() {
    await this.send(
      'New Account Created'
    );
  }

  async passwordChangeRequest() {
    await this.send(
      'Password change request'
    );
  }

  async passwordHasBeenChanged() {
    await this.send(
      'Your password has been changed'
    );
  }

  async accountVerificationToken() {
    await this.send(
      'Account Verification Token'
    );
  }

  async notificationFavorite() {
    await this.send(
      'Favorite Posts'
    );
  }

  async notificationReview() {
    await this.send(
      'Review Posts'
    );
  }
};
