/* eslint-disable no-underscore-dangle */
const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');
const logger = require('./logger');

class MailError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'MailError';
    this.code = code;
  }
}

const mailer = {
  confirmationMessage(i18n, email, tokenUrl) {
    return {
      to: email,
      from: process.env.REGISTRATION_EMAIL,
      subject: i18n.t('registration.email.subject'),
      text: i18n.t('registration.email.bodytext', { tokenUrl }),
      html: i18n.t('registration.email.bodyhtml', { tokenUrl }),
    };
  },

  recoverPasswordMessage(i18n, email, tokenUrl) {
    return {
      to: email,
      from: process.env.REGISTRATION_EMAIL,
      subject: i18n.t('recover.email.subject'),
      text: i18n.t('recover.email.bodytext', { tokenUrl }),
      html: i18n.t('recover.email.bodyhtml', { tokenUrl }),
    };
  },

  feedbackMessage(email, feedback) {
    return {
      to: process.env.FEEDBACK_EMAIL,
      from: process.env.SMTP_SERVER ? email : process.env.SENDGRID_FEEDBACK_SENDER_EMAIL,
      replyTo: email,
      subject: 'WikiHooku User feedback',
      html: feedback,
    };
  },

  async sendGridSendMail(email, message) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    await sgMail.send(message)
      .then(() => {
      })
      .catch((error) => {
        const log = logger.getLogger();
        log.error(`Sendgrid error: ${JSON.stringify(error)} sending email to ${email}`);
        throw new MailError(error.code, error);
      });
  },

  async smtpSendMail(email, message) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_SERVER,
        port: 465,
        secure: true,
        auth: {
          user: process.env.REGISTRATION_EMAIL_USR,
          pass: process.env.REGISTRATION_EMAIL_PWD,
        },
      });

      await transporter.sendMail(message);
    } catch (error) {
      const log = logger.getLogger();
      log.error(`Smtp error: ${JSON.stringify(error)} sending email to ${email}`);
      throw new MailError(error.code, error);
    }
  },

  async sendConfirmationMail(i18n, email, tokenUrl) {
    if (process.env.SMTP_SERVER) {
      this.smtpSendMail(email, this.confirmationMessage(i18n, email, tokenUrl));
    } else {
      this.sendGridSendMail(email, this.confirmationMessage(i18n, email, tokenUrl));
    }
  },

  async sendRecoverPasswordMail(i18n, email, tokenUrl) {
    if (process.env.SMTP_SERVER) {
      this.smtpSendMail(email, this.recoverPasswordMessage(i18n, email, tokenUrl));
    } else {
      this.sendGridSendMail(email, this.recoverPasswordMessage(i18n, email, tokenUrl));
    }
  },

  async sendFeedbackMail(email, feedback) {
    if (process.env.SMTP_SERVER) {
      this.smtpSendMail(email, this.feedbackMessage(email, feedback));
    } else {
      this.sendGridSendMail(email, this.feedbackMessage(email, feedback));
    }
  },
};

module.exports = mailer;
