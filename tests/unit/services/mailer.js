const chai = require('chai');
const spies = require('chai-spies');
const sgMail = require('@sendgrid/mail');

const mailer = require('../../../server/services/mailer');
const logger = require('../../../server/services/logger');
const users = require('../../data/users');

const testUsers = JSON.parse(JSON.stringify(users));
const [userOne] = testUsers;
const tokenUrl = 'registration-token';
const secretKey = 'secret';
const sendGridKey = 'SG.12345';

const i18n = {};

before(() => {
  chai.use(spies);
  i18n.t = chai.spy();
  process.env.SECRET = secretKey;
  process.env.SENDGRID_API_KEY = sendGridKey;
});

describe('Mailer Service', () => {
  beforeEach(() => {
    logger.init({
      level: process.env.LOG_LEVEL || 'info',
    });
  });

  afterEach(() => {
    chai.spy.restore();
  });

  it('sends a confirmation email', async () => {
    chai.spy.on(sgMail, 'setApiKey');
    chai.spy.on(sgMail, 'send', () => Promise.resolve());
    await mailer.sendConfirmationMail(i18n, userOne.email, tokenUrl);
    chai.expect(sgMail.setApiKey).to.have.been.called.with(sendGridKey);
    chai.expect(sgMail.send).to.have.been.called();
  });

  it('logs an error if confirmation email cannot be sent', async () => {
    chai.spy.on(sgMail, 'setApiKey');
    chai.spy.on(sgMail, 'send', () => Promise.reject(new Error('email cannot be sent')));
    chai.spy.on(logger, 'getLogger', () => ({
      error: chai.spy(),
    }));
    try {
      await mailer.sendConfirmationMail(i18n, userOne.email, tokenUrl);
    } catch (error) {
      console.log('catch error thrown');
    }
    chai.expect(sgMail.setApiKey).to.have.been.called.with(sendGridKey);
    chai.expect(sgMail.send).to.have.been.called();
  });

  it('sends a recover password email', () => {
    chai.spy.on(sgMail, 'setApiKey');
    chai.spy.on(sgMail, 'send', () => Promise.resolve());
    mailer.sendRecoverPasswordMail(i18n, userOne.email, tokenUrl);
    chai.expect(sgMail.setApiKey).to.have.been.called.with(sendGridKey);
    chai.expect(sgMail.send).to.have.been.called();
  });

  it('logs an error if recover password email cannot be sent', async () => {
    chai.spy.on(sgMail, 'setApiKey');
    chai.spy.on(sgMail, 'send', () => Promise.reject(new Error('email cannot be sent')));
    chai.spy.on(logger, 'getLogger', () => ({
      error: chai.spy(),
    }));
    try {
      await mailer.sendRecoverPasswordMail(i18n, userOne.email, tokenUrl);
    } catch (error) {
      console.log('catch error thrown');
    }
    chai.expect(sgMail.setApiKey).to.have.been.called.with(sendGridKey);
    chai.expect(sgMail.send).to.have.been.called();
  });

  it('sends a feedback email', async () => {
    chai.spy.on(sgMail, 'setApiKey');
    chai.spy.on(sgMail, 'send', () => Promise.resolve());
    await mailer.sendFeedbackMail('I love WikiHooku', userOne.email);
    chai.expect(sgMail.setApiKey).to.have.been.called.with(sendGridKey);
    chai.expect(sgMail.send).to.have.been.called();
  });

  it('logs an error if feedback email cannot be sent', async () => {
    chai.spy.on(sgMail, 'setApiKey');
    chai.spy.on(sgMail, 'send', () => Promise.reject(new Error('email cannot be sent')));
    chai.spy.on(logger, 'getLogger', () => ({
      error: chai.spy(),
    }));
    try {
      await mailer.sendFeedbackMail('I love WikiHooku', userOne.email);
    } catch (error) {
      console.log('catch error thrown');
    }
    chai.expect(sgMail.setApiKey).to.have.been.called.with(sendGridKey);
    chai.expect(sgMail.send).to.have.been.called();
  });
});
