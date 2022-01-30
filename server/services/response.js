const httpStatuses = require('../consts/httpStatuses');

const response = {
  object(res, object, code = httpStatuses.OK) {
    res.log.debug(`response object ${JSON.stringify(object)}`);
    res.statusCode = code;
    res.json(object);
  },

  message(res, message, code = httpStatuses.OK) {
    res.log.debug(`response message ${JSON.stringify(message)}`);
    res.statusCode = code;
    res.json({
      message,
    });
  },

  error(res, error, code = httpStatuses.BAD_REQUEST) {
    res.log.debug(`response error ${JSON.stringify(error)}`);
    res.statusCode = code;
    res.json({
      message: error,
    });
  },
};

module.exports = response;
