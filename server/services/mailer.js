/* eslint-disable no-underscore-dangle */
const sgMail = require('@sendgrid/mail');
const logger = require('./logger');

const mailer = {
  sendConfirmationMail(i18n, email, tokenUrl) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: email,
      from: process.env.REGISTRATION_EMAIL,
      subject: i18n.t('registration.email.subject'),
      text: i18n.t('registration.email.bodytext', { tokenUrl }),
      html: i18n.t('registration.email.bodyhtml', { tokenUrl }),
    };

    sgMail.send(msg)
      .then(() => {})
      .catch((error) => {
        const log = logger.getLogger();
        log.error(`Sendgrid error: ${JSON.stringify(error)} sending email to ${email}`);
      });
  },
  sendRecoverPasswordMail(i18n, email, tokenUrl) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: email,
      from: process.env.REGISTRATION_EMAIL,
      subject: i18n.t('recover.email.subject'),
      text: i18n.t('recover.email.bodytext', { tokenUrl }),
      html: i18n.t('recover.email.bodyhtml', { tokenUrl }),
    };

    sgMail.send(msg)
      .then(() => {})
      .catch((error) => {
        const log = logger.getLogger();
        log.error(`Sendgrid error: ${JSON.stringify(error)} sending email to ${email}`);
      });
  },
  sendFeedbackMail(email, feedback) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: process.env.FEEDBACK_EMAIL,
      from: email,
      subject: 'WikiHooku User feedback',
      html: feedback,
    };

    sgMail.send(msg)
      .then(() => {})
      .catch((error) => {
        const log = logger.getLogger();
        log.error(`Sendgrid error: ${JSON.stringify(error)} sending email to FEEDBACK from ${email}`);
      });
  },
};

module.exports = mailer;
