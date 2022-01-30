const chai = require('chai');

const logger = require('../../../server/services/logger');

beforeEach(() => {
  logger.logger = null;
});

const opts = { level: 'warn' };
const opts2 = { level: 'info' };

describe('Logger Service', () => {
  it('initializes logger', () => {
    const log = logger.init(opts);
    chai.expect(log).to.not.equal(null);
  });

  it('gets logger null', () => {
    const log = logger.getLogger();
    chai.expect(log).to.equal(null);
  });

  it('initializes logger only ones', () => {
    const log = logger.init(opts);
    const logNew = logger.init(opts2);
    chai.expect(logger.getLoggerOpts()).to.equal(opts);
    chai.expect(logger.getLoggerOpts()).to.not.equal(opts2);
    chai.expect(log).to.equal(logNew);
  });
});
