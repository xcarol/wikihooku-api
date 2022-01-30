// see log levels at: https://getpino.io/#/docs/api?id=loggerlevel-string-gettersetter
// see special logging listeners : https://getpino.io/#/docs/help?id=exit-logging
const pino = require('pino');

const Logger = {
  logger: null,
  opts: null,
  init(opts) {
    if (this.logger === null) {
      this.opts = opts;
      this.logger = pino(opts);
      this.logger.info('logger created');
    } else {
      return this.logger;
    }
    process.on('uncaughtException', (err) => {
      this.logger.error(err, 'uncaughtException');
    });
    process.on('unhandledRejection', (err) => {
      this.logger.error(err, 'unhandledRejection');
    });

    return this.logger;
  },
  getLogger() {
    return this.logger;
  },
  getLoggerOpts() {
    return this.opts;
  },
};

module.exports = Logger;
