const mongoose = require('mongoose');
const chai = require('chai');
const spies = require('chai-spies');

const UserSchema = require('../../../server/models/User');
const service = require('../../../server/services/user');
const logger = require('../../../server/services/logger');
const tokenizer = require('../../../server/services/tokenizer');
const users = require('../../data/users');

const User = mongoose.model('User', UserSchema);
const testUsers = JSON.parse(JSON.stringify(users));
const [userOne, userTwo] = testUsers;

const recoverToken = 'recover-token';
const confirmToken = 'confirm-token';

before(() => {
  chai.use(spies);
  process.env.SALT = '$2b$10$FyD8sV/mOulEuHa.In9OS.';
  process.env.RECOVER_PASSWORD_URL = 'http://localhost:8080/recoverpass';
});

describe('User Service', () => {
  beforeEach(() => {
    logger.init();
  });

  afterEach(() => {
    chai.spy.restore();
  });

  it('calls user find', async () => {
    chai.spy.on(User, 'find', () => users);
    const allUsers = await service.allUsers();

    chai.expect(User.find).to.have.been.called();
    chai.expect(allUsers).to.deep.equal(users);
  });

  it('creates new user and saves it', async () => {
    chai.spy.on(User.prototype, 'save', () => Promise.resolve(userOne));
    chai.spy.on(service, 'encryptPassword', () => Promise.resolve('password'));
    chai.spy.on(tokenizer, 'getConfirmationToken', () => (confirmToken));

    const user = await service.addUser(userOne);

    chai.expect(user).to.deep.equal(userOne);
    chai.expect(User.prototype.save).to.have.been.called();
  });

  it('encrypts a passowrd', async () => {
    const encryptedPassword = await service.encryptPassword('password');
    chai.expect(encryptedPassword.length).to.equal(60);
  });

  it('updates the user provided', async () => {
    chai.spy.on(User, 'updateOne', () => Promise.resolve());
    const userTest = {
      ...userOne,
    };
    await service.updateUser(userTest);
    chai.expect(User.updateOne).to.have.been.called();
  });

  it('searches for a user by email', async () => {
    chai.spy.on(User, 'findOne', (search) => {
      chai.expect(search.email).to.equal(userOne.email);
      return Promise.resolve(userOne);
    });
    const user = await service.findUserByEmail(userOne.email);
    chai.expect(user).to.deep.equal(userOne);
  });

  it('removes the confirmation token', () => {
    const userTest = {
      ...userOne,
      save: chai.spy(),
    };
    service.confirmUser(userTest);
    chai.expect(userTest.save).to.have.been.called();
  });

  it('adds the recover password token', () => {
    const userTest = {
      ...userOne,
      save: chai.spy(),
    };
    service.recoverPassword(userTest, 'token');
    chai.expect(userTest.save).to.have.been.called();
  });

  it('searches for a user by id', async () => {
    const userToFind = { ...userOne, _id: 'user-id' };
    chai.spy.on(User, 'findById', (search) => {
      chai.expect(search).to.equal(userToFind._id);
      return Promise.resolve(userToFind);
    });
    const user = await service.findUserById(userToFind._id);
    chai.expect(user).to.deep.equal(userToFind);
  });

  it('returns no user if search for a user by id fails', async () => {
    const userToFind = { ...userOne, _id: 'user-id' };
    chai.spy.on(User, 'findById', (search) => {
      chai.expect(search.id).not.to.equal(userToFind._id);
      return Promise.reject(new Error('Not found'));
    });
    const user = await service.findUserById('another-user-id');
    chai.expect(user).to.eql(undefined);
  });

  it('searches for a user by token', async () => {
    const userToFind = { ...userOne, token: 'user-token' };
    chai.spy.on(User, 'findOne', (search) => {
      chai.expect(search.token).to.equal(userToFind.token);
      return Promise.resolve(userToFind);
    });
    const user = await service.findByToken(userToFind.token);
    chai.expect(user).to.deep.equal(userToFind);
  });

  it('returns no user if search for a user by token fails', async () => {
    const userToFind = { ...userOne, token: 'user-token' };
    chai.spy.on(User, 'findOne', (search) => {
      chai.expect(search.token).not.to.equal(userToFind.token);
      return Promise.reject(new Error('Not found'));
    });
    const user = await service.findByToken('another-user-token');
    chai.expect(user).to.eql(undefined);
  });

  it('returns the user when passwords match', async () => {
    chai.spy.on(User, 'findOne', async () => {
      const user = { ...userOne };
      user.password = await service.encryptPassword(userOne.password);
      return Promise.resolve(user);
    });
    const user = await service.getUserWithPassword(userOne.email, userOne.password);
    chai.expect(user).to.not.eql(null);
  });

  it('returns null when passwords don\'t match', async () => {
    chai.spy.on(User, 'findOne', async () => {
      const user = { ...userOne };
      user.password = await service.encryptPassword('different password');
      return Promise.resolve(user);
    });
    const user = await service.getUserWithPassword(userOne.email, userOne.password);
    chai.expect(user).to.eql(null);
  });

  it('returns null when user is not found', async () => {
    chai.spy.on(User, 'findOne', () => Promise.resolve(null));
    const user = await service.getUserWithPassword(userOne.email, userOne.password);
    chai.expect(user).to.eql(null);
  });

  it('returns the confirm user url', async () => {
    const i18n = {
      language: 'en',
    };
    const url = await service.getRecoverPasswordUrl(i18n, userOne.email, confirmToken);
    chai.expect(url).to.eql(`${process.env.RECOVER_PASSWORD_URL}?lang=${i18n.language}&email=${encodeURIComponent(userOne.email)}&token=${confirmToken}`);
  });

  it('returns the recover password url', async () => {
    const i18n = {
      language: 'en',
    };
    const url = await service.getRecoverPasswordUrl(i18n, userOne.email, recoverToken);
    chai.expect(url).to.eql(`${process.env.RECOVER_PASSWORD_URL}?lang=${i18n.language}&email=${encodeURIComponent(userOne.email)}&token=${recoverToken}`);
  });

  it('updates the user pasword', async () => {
    const user = { ...userOne, _id: userOne.id };
    user.password = '';
    user.recoverPasswordToken = recoverToken;
    chai.spy.on(user, 'save');
    await service.resetPassword(user, userTwo.password);
    chai.expect(user.password.length).to.be.greaterThan(0);
    chai.expect(user.recoverPasswordToken).to.eql('');
  });
});
