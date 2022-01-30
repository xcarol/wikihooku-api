const mongoose = require('mongoose');
const chai = require('chai');
const spies = require('chai-spies');
const logger = require('../../../server/services/logger');

const FeedbackSchema = require('../../../server/models/Feedback');
const service = require('../../../server/services/feedback');

const Feedback = mongoose.model('Feedback', FeedbackSchema);

before(() => {
  chai.use(spies);
});

describe('Feedback Service', () => {
  beforeEach(() => {
    logger.init();
  });

  afterEach(() => {
    chai.spy.restore();
  });

  it('saves a feedback to database', async () => {
    chai.spy.on(Feedback, 'create', () => Promise.resolve());
    await service.addFeedback('email', 'feedback');
    chai.expect(Feedback.create).to.have.been.called();
  });
});
