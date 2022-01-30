const mongoose = require('mongoose');
const logger = require('./logger');

const Mongoose = {
  dbOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  db: mongoose.connection,
  connect(dbOptions) {
    mongoose.connect(process.env.MONGODB_URI, dbOptions);
  },
  init() {
    const log = logger.getLogger();
    mongoose.Promise = global.Promise;

    if (process.env.NODE_ENV === 'development') {
      mongoose.set('debug', true);
    }

    this.db.on('connecting', () => {
      log.info('connecting to mongodb...');
    });
    this.db.on('error', (error) => {
      log.error(`mongodb connection error: ${error}`);
      mongoose.disconnect();
    });
    this.db.on('connected', () => {
      log.info('connected to mongodb!');
    });
    this.db.once('open', () => {
      log.info('mongodb connection opened!');
    });
    this.db.on('reconnected', () => {
      log.info('mongodb reconnected!');
    });
    this.db.on('disconnected', () => {
      log.error(`mongodb disconnected! reconnecting in ${this.dbOptions.reconnectInterval / 1000}s...`);
      setTimeout(() => this.connect(this.dbOptions), this.dbOptions.reconnectInterval);
    });

    this.connect(this.dbOptions);
  },
};

module.exports = Mongoose;
