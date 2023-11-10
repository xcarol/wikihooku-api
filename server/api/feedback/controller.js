const service = require('../../services/feedback');
const response = require('../../services/response');
const mailer = require('../../services/mailer');
const httpStatuses = require('../../lib/httpStatuses');

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
    try {
      await mailer.sendFeedbackMail(email, feedback);
    } catch (error) {
      res.log.error(`Cannot send feedback: ${JSON.stringify(email)} - error: ${JSON.stringify(error)}`);
      response.error(res, error.message, error.code ? error.code : httpStatuses.INTERNAL_SERVER_ERROR);
      return;
    }

    response.object(res, {}, httpStatuses.NO_CONTENT);
  },
};

module.exports = controller;
