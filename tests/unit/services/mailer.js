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

const i18n = {};

before(() => {
  chai.use(spies);
  i18n.t = chai.spy();
  logger.init();
  process.env.SENDGRID_API_KEY = secretKey;
});

describe('Mailer Service', () => {
  beforeEach(() => {});

  afterEach(() => {
    chai.spy.restore();
  });

  it('sends a confirmation email', () => {
    chai.spy.on(sgMail, 'setApiKey');
    chai.spy.on(sgMail, 'send', () => Promise.resolve());
    mailer.sendConfirmationMail(i18n, userOne.email, tokenUrl);
    chai.expect(sgMail.setApiKey).to.have.been.called.with(secretKey);
    chai.expect(sgMail.send).to.have.been.called();
  });

  it('logs an error if confirmation email cannot be sent', (done) => {
    chai.spy.on(sgMail, 'setApiKey');
    chai.spy.on(sgMail, 'send', () => Promise.reject(new Error('email cannot be sent')));
    chai.spy.on(logger, 'getLogger', () => ({
      error: chai.spy(() => done()),
    }));
    mailer.sendConfirmationMail(i18n, userOne.email, tokenUrl);
    chai.expect(sgMail.setApiKey).to.have.been.called.with(secretKey);
    chai.expect(sgMail.send).to.have.been.called();
  });

  it('sends a recover password email', () => {
    chai.spy.on(sgMail, 'setApiKey');
    chai.spy.on(sgMail, 'send', () => Promise.resolve());
    mailer.sendRecoverPasswordMail(i18n, userOne.email, tokenUrl);
    chai.expect(sgMail.setApiKey).to.have.been.called.with(secretKey);
    chai.expect(sgMail.send).to.have.been.called();
  });

  it('logs an error if recover password email cannot be sent', (done) => {
    chai.spy.on(sgMail, 'setApiKey');
    chai.spy.on(sgMail, 'send', () => Promise.reject(new Error('email cannot be sent')));
    chai.spy.on(logger, 'getLogger', () => ({
      error: chai.spy(() => done()),
    }));
    mailer.sendRecoverPasswordMail(i18n, userOne.email, tokenUrl);
    chai.expect(sgMail.setApiKey).to.have.been.called.with(secretKey);
    chai.expect(sgMail.send).to.have.been.called();
  });

  it('sends a feedback email', () => {
    chai.spy.on(sgMail, 'setApiKey');
    chai.spy.on(sgMail, 'send', () => Promise.resolve());
    mailer.sendFeedbackMail('I love WikiHooku', userOne.email);
    chai.expect(sgMail.setApiKey).to.have.been.called.with(secretKey);
    chai.expect(sgMail.send).to.have.been.called();
  });

  it('logs an error if feedback email cannot be sent', (done) => {
    chai.spy.on(sgMail, 'setApiKey');
    chai.spy.on(sgMail, 'send', () => Promise.reject(new Error('email cannot be sent')));
    chai.spy.on(logger, 'getLogger', () => ({
      error: chai.spy(() => done()),
    }));
    mailer.sendFeedbackMail('I love WikiHooku', userOne.email);
    chai.expect(sgMail.setApiKey).to.have.been.called.with(secretKey);
    chai.expect(sgMail.send).to.have.been.called();
  });
});
