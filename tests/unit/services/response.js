const chai = require('chai');

const httpStatuses = require('../../../server/consts/httpStatuses');
const logger = require('../../../server/services/logger');
const response = require('../../../server/services/response');

const objResponse = {
  something: 1000,
  message: 'this is an object',
  error: {
    code: 13283,
    message: 'this is an error',
  },
};

let res;

describe('Response Service', () => {
  beforeEach(() => {
    logger.init();
    res = {
      log: logger.getLogger(),
    };
  });

  it('responses an object', () => {
    chai.spy.on(res, 'json', (obj) => {
      chai.expect(obj).to.deep.equal(objResponse);
    });
    response.object(res, objResponse);
    chai.expect(res.statusCode).to.equal(httpStatuses.OK);

    response.object(res, objResponse, httpStatuses.NOT_FOUND);
    chai.expect(res.statusCode).to.equal(httpStatuses.NOT_FOUND);
  });

  it('responses a message', () => {
    chai.spy.on(res, 'json', (obj) => {
      chai.expect(obj.message).to.equal(objResponse.message);
    });
    response.message(res, objResponse.message);
    chai.expect(res.statusCode).to.equal(httpStatuses.OK);

    response.message(res, objResponse.message, httpStatuses.NOT_FOUND);
    chai.expect(res.statusCode).to.equal(httpStatuses.NOT_FOUND);
  });

  it('responses an error', () => {
    chai.spy.on(res, 'json', (obj) => {
      chai.expect(obj.message).to.equal(objResponse.error);
    });
    response.error(res, objResponse.error);
    chai.expect(res.statusCode).to.equal(httpStatuses.BAD_REQUEST);

    response.error(res, objResponse.error, httpStatuses.NOT_FOUND);
    chai.expect(res.statusCode).to.equal(httpStatuses.NOT_FOUND);
  });
});
