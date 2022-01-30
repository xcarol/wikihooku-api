const service = require('../../services/feedback');
const response = require('../../services/response');
const mailer = require('../../services/mailer');
const httpStatuses = require('../../consts/httpStatuses');

const controller = {
  async create(req, res) {
    const { feedback, email } = req.body;

    if (!feedback) {
      response.error(res, 'Field feedback is required', httpStatuses.BAD_REQUEST);
      return;
    }

    if (!email) {
      response.error(res, 'Field email is required', httpStatuses.BAD_REQUEST);
      return;
    }

    service.addFeedback(email, feedback);
    mailer.sendFeedbackMail(email, feedback);

    response.object(res, {}, httpStatuses.NO_CONTENT);
  },
};

module.exports = controller;
