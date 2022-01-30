const chai = require('chai');
const spies = require('chai-spies');

const httpStatuses = require('../../../../server/consts/httpStatuses');

const service = require('../../../../server/services/feedback');
const logger = require('../../../../server/services/logger');
const mailer = require('../../../../server/services/mailer');
const controller = require('../../../../server/api/feedback/controller');

let response;

before(() => {
  chai.use(spies);
});

describe('Feedback Controller', () => {
  beforeEach(() => {
    logger.init();
    response = {
      log: logger.getLogger(),
      json: () => {},
    };
  });

  afterEach(() => {
    chai.spy.restore();
  });

  it('sends a feedback email', async () => {
    const req = {
      body: {
        email: 'wikihookutest@xicra.com',
        feedback: 'I love WikiHooku',
      },
    };
    chai.spy.on(response, 'json', (nocontent) => {
      chai.expect(nocontent).to.eql({});
    });

    chai.spy.on(service, 'addFeedback');
    chai.spy.on(mailer, 'sendFeedbackMail');
    await controller.create(req, response);
    chai.expect(mailer.sendFeedbackMail).to.have.been.called();
    chai.expect(service.addFeedback).to.have.been.called();
  });

  it('returns error if no email is provided', async () => {
    const req = {
      body: {
        feedback: 'I love WikiHooku',
      },
    };
    chai.spy.on(response, 'json', (nocontent) => {
      chai.expect(nocontent).to.eql({ message: 'Field email is required' });
      chai.expect(response.statusCode).to.equal(httpStatuses.BAD_REQUEST);
    });

    chai.spy.on(mailer, 'sendFeedbackMail');
    await controller.create(req, response);
    chai.expect(mailer.sendFeedbackMail).to.not.have.been.called();
  });

  it('returns error if no feedback is provided', async () => {
    const req = {
      body: {
        email: 'knownuser@gmail.com',
      },
    };
    chai.spy.on(response, 'json', (nocontent) => {
      chai.expect(nocontent).to.eql({ message: 'Field feedback is required' });
      chai.expect(response.statusCode).to.equal(httpStatuses.BAD_REQUEST);
    });

    chai.spy.on(mailer, 'sendFeedbackMail');
    await controller.create(req, response);
    chai.expect(mailer.sendFeedbackMail).to.not.have.been.called();
  });
});
