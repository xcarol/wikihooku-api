/* eslint-disable no-underscore-dangle */
const sgMail = require('@sendgrid/mail');
const logger = require('./logger');

class MailError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'MailError';
    this.code = code;
  }
}

const mailer = {
  async sendConfirmationMail(i18n, email, tokenUrl) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: email,
      from: process.env.REGISTRATION_EMAIL,
      subject: i18n.t('registration.email.subject'),
      text: i18n.t('registration.email.bodytext', { tokenUrl }),
      html: i18n.t('registration.email.bodyhtml', { tokenUrl }),
    };

    await sgMail.send(msg)
      .then(() => {})
      .catch((error) => {
        const log = logger.getLogger();
        log.error(`Sendgrid error: ${JSON.stringify(error)} sending email to ${email}`);
        throw new MailError(error.code, error);
      });
  },
  async sendRecoverPasswordMail(i18n, email, tokenUrl) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: email,
      from: process.env.REGISTRATION_EMAIL,
      subject: i18n.t('recover.email.subject'),
      text: i18n.t('recover.email.bodytext', { tokenUrl }),
      html: i18n.t('recover.email.bodyhtml', { tokenUrl }),
    };

    await sgMail.send(msg)
      .then(() => {})
      .catch((error) => {
        const log = logger.getLogger();
        log.error(`Sendgrid error: ${JSON.stringify(error)} sending email to ${email}`);
        throw new MailError(error.code, error);
      });
  },
  async sendFeedbackMail(email, feedback) {
    const log = logger.getLogger();

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: process.env.FEEDBACK_EMAIL,
      from: process.env.FEEDBACK_SENDER_EMAIL,
      replyTo: email,
      subject: 'WikiHooku User feedback',
      html: feedback,
    };

    await sgMail.send(msg)
      .then(() => {})
      .catch((error) => {
        log.error(`Sendgrid error: ${JSON.stringify(error)} sending email to FEEDBACK from ${email}`);
        throw new MailError(error.code, error);
      });
  },
};

module.exports = mailer;
