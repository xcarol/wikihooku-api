const mongoose = require('mongoose');
const chai = require('chai');
const spies = require('chai-spies');
const logger = require('../../../server/services/logger');

const database = require('../../../server/services/database');

before(() => {
  chai.use(spies);
  process.env.MONGODB_URI = 'mongodb://example.com';
});

describe('Database Service', () => {
  beforeEach(() => {
    logger.init();
  });

  afterEach(() => {
    chai.spy.restore();
  });

  it('initializes database connecion', () => {
    chai.spy.on(mongoose, 'connect');
    database.init();
    chai.expect(mongoose.connect).to.have.been.called();
  });

  it('sets debug mode in development env', () => {
    chai.spy.on(mongoose, 'set');
    process.env.NODE_ENV = 'development';
    database.init();
    chai.expect(mongoose.set).to.have.been.called.with('debug');
  });

  it('watches for database events', () => {
    chai.spy.on(database.db, 'on');
    chai.spy.on(database.db, 'once');

    database.init();
    chai.expect(database.db.on).to.have.been.called.with('connecting');
    chai.expect(database.db.on).to.have.been.called.with('error');
    chai.expect(database.db.on).to.have.been.called.with('connected');
    chai.expect(database.db.on).to.have.been.called.with('reconnected');
    chai.expect(database.db.on).to.have.been.called.with('disconnected');
    chai.expect(database.db.once).to.have.been.called.with('open');
  });
});
