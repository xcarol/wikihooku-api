const chai = require('chai');
const spies = require('chai-spies');
const jwt = require('jsonwebtoken');

const globals = require('../../../../server/consts/globals');
const httpStatuses = require('../../../../server/consts/httpStatuses');

const service = require('../../../../server/services/user');
const mailer = require('../../../../server/services/mailer');
const tokenizer = require('../../../../server/services/tokenizer');
const logger = require('../../../../server/services/logger');
const controller = require('../../../../server/api/user/controller');

const users = require('../../../data/users');

const testUsers = JSON.parse(JSON.stringify(users));
const [userOne, userTwo] = testUsers;

let mongooMock;
let response;
let encryptedPassword;

const unencryptedPassword = '123456';

function userOneCopy() {
  return JSON.parse(JSON.stringify(userOne));
}

function userTwoCopy() {
  return JSON.parse(JSON.stringify(userTwo));
}

function getConfirmationExpiredToken(email) {
  const expiresAt = new Date('1970-01-01').getTime();
  const payload = {
    username: email,
    expiresAt,
  };
  return jwt.sign(payload, process.env.SECRET);
}

before(async () => {
  chai.use(spies);
  mongooMock = {
    toObject: chai.spy(() => userOneCopy()),
  };
  process.env.SECRET = 'secret';
  process.env.SALT = '$2b$10$FyD8sV/mOulEuHa.In9OS.';
  encryptedPassword = await service.encryptPassword(unencryptedPassword);
});

describe('User Controller', () => {
  beforeEach(() => {
    logger.init();
    response = {
      log: logger.getLogger(),
      json: () => {},
    };
  });

  afterEach(() => {
    chai.spy.restore();
  });

  it('returns user specified', async () => {
    const req = {
      params: {
        userid: 'user-id',
      },
    };
    chai.spy.on(response, 'json', (currentUser) => {
      chai.expect(response.statusCode).to.equal(httpStatuses.OK);
      chai.expect(typeof currentUser).to.equal('object');
    });

    chai.spy.on(service, 'findUserById', () => Promise.resolve(userOneCopy()));

    await controller.user(req, response);
    chai.expect(service.findUserById).to.have.been.called();
  });

  it('returns error if no user specified', async () => {
    const req = {};
    chai.spy.on(response, 'json', (error) => {
      chai.expect(response.statusCode).to.equal(httpStatuses.BAD_REQUEST);
      chai.expect(typeof error.message).to.equal('string');
    });

    chai.spy.on(service, 'findUserById', () => Promise.resolve([]));

    await controller.user(req, response);
    chai.expect(service.findUserById).to.not.have.been.called();
  });

  it('returns error if user is not found', async () => {
    const req = {
      params: {
        userid: 'user-id',
      },
    };
    chai.spy.on(response, 'json', (error) => {
      chai.expect(response.statusCode).to.equal(httpStatuses.NOT_FOUND);
      chai.expect(typeof error.message).to.equal('string');
    });

    chai.spy.on(service, 'findUserById', () => Promise.resolve());

    await controller.user(req, response);
    chai.expect(service.findUserById).to.have.been.called();
  });

  it('creates the user', async () => {
    const req = {
      body: userOneCopy(),
      i18n: {
        t: chai.spy(),
      },
    };
    chai.spy.on(response, 'json', (obj) => {
      chai.expect(typeof obj).to.equal('object');
    });

    chai.spy.on(service, 'addUser', () => Promise.resolve(mongooMock));
    chai.spy.on(service, 'findUserByEmail', () => Promise.resolve());
    chai.spy.on(mailer, 'sendConfirmationMail');

    await controller.create(req, response);
    chai.expect(service.addUser).to.have.been.called();
    chai.expect(mongooMock.toObject).to.have.been.called();
    chai.expect(mailer.sendConfirmationMail).to.have.been.called();
  });

  it('reports an error if user cannot be created', async () => {
    const req = {
      body: userOneCopy(),
    };
    chai.spy.on(response, 'json', (msg) => {
      chai.expect(response.statusCode).to.equal(httpStatuses.INTERNAL_SERVER_ERROR);
      chai.expect(typeof msg.message).to.equal('string');
    });

    chai.spy.on(service, 'findUserByEmail', () => Promise.resolve());
    chai.spy.on(service, 'addUser', () => Promise.reject(new Error('cannot create user')));

    await controller.create(req, response);
    chai.expect(service.addUser).to.have.been.called();
  });

  it('reports an error if fullname field is missing', async () => {
    const req = {
      body: {
        email: userOne.email,
        password: userOne.password,
      },
    };
    chai.spy.on(response, 'json', (msg) => {
      chai.expect(response.statusCode).to.equal(httpStatuses.BAD_REQUEST);
      chai.expect(typeof msg.message).to.equal('string');
    });

    await controller.create(req, response);
  });

  it('reports an error if email field is missing on creation', async () => {
    const req = {
      body: {
        fullname: userOne.fullname,
      },
    };
    chai.spy.on(response, 'json', (msg) => {
      chai.expect(response.statusCode).to.equal(httpStatuses.BAD_REQUEST);
      chai.expect(typeof msg.message).to.equal('string');
    });

    await controller.create(req, response);
  });

  it('reports an error if password field is missing on creation', async () => {
    const req = {
      body: {
        fullname: userOne.fullname,
        email: userOne.email,
      },
    };
    chai.spy.on(response, 'json', (msg) => {
      chai.expect(response.statusCode).to.equal(httpStatuses.BAD_REQUEST);
      chai.expect(typeof msg.message).to.equal('string');
    });

    await controller.create(req, response);
  });

  it('reports an error if user already exists', async () => {
    const req = {
      body: userOneCopy(),
    };
    chai.spy.on(response, 'json', (msg) => {
      chai.expect(response.statusCode).to.equal(httpStatuses.CONFLICT);
      chai.expect(typeof msg.message).to.equal('string');
    });

    chai.spy.on(service, 'findUserByEmail', () => Promise.resolve(userOneCopy()));

    await controller.create(req, response);
  });

  it('confirms the user registration', async () => {
    const confirmationToken = tokenizer.getConfirmationToken(userOne.email);
    const userToConfirm = { ...userOneCopy(), confirmationToken };
    const confirmedUser = { ...userOneCopy(), ...mongooMock, confirmationToken };

    const req = {
      body: userToConfirm,
    };
    chai.spy.on(response, 'json', (obj) => {
      chai.expect(response.statusCode).to.equal(httpStatuses.ACCEPTED);
      chai.expect(typeof obj.user).to.equal('object');
      chai.expect(typeof obj.token).to.equal('string');
    });

    chai.spy.on(service, 'findUserByEmail', () => Promise.resolve(confirmedUser));
    chai.spy.on(service, 'confirmUser', () => Promise.resolve());
    chai.spy.on(service, 'updateUser', () => Promise.resolve());
    await controller.confirm(req, response);
    chai.expect(service.findUserByEmail).to.have.been.called();
    chai.expect(service.confirmUser).to.have.been.called();
    chai.expect(service.updateUser).to.have.been.called();
  });

  it('checks token ownership at the user registration', async () => {
    const tokenOne = tokenizer.getConfirmationToken(userOne.email);
    const tokenTwo = tokenizer.getConfirmationToken(userTwo.email);
    const userToConfirm = { ...userOneCopy(), confirmationToken: tokenOne };
    const confirmedUser = { ...userTwoCopy(), ...mongooMock, confirmationToken: tokenTwo };

    const req = {
      body: userToConfirm,
    };
    chai.spy.on(response, 'json', (error) => {
      chai.expect(response.statusCode).to.equal(httpStatuses.NOT_FOUND);
      chai.expect(typeof error.message).to.equal('string');
    });

    chai.spy.on(service, 'findUserByEmail', () => Promise.resolve(confirmedUser));
    chai.spy.on(service, 'confirmUser', () => Promise.resolve());
    chai.spy.on(service, 'updateUser', () => Promise.resolve());
    await controller.confirm(req, response);
    chai.expect(service.findUserByEmail).to.have.been.called();
    chai.expect(service.confirmUser).to.not.have.been.called();
    chai.expect(service.updateUser).to.not.have.been.called();
  });

  it('checks token expiration at the user registration', async () => {
    const confirmationToken = getConfirmationExpiredToken(userOne.email);
    const userToConfirm = { ...userOneCopy(), confirmationToken };
    const confirmedUser = { ...userTwoCopy(), ...mongooMock, confirmationToken };

    const req = {
      body: userToConfirm,
    };
    chai.spy.on(response, 'json', (error) => {
      chai.expect(response.statusCode).to.equal(httpStatuses.FORBIDDEN);
      chai.expect(typeof error.message).to.equal('string');
    });

    chai.spy.on(service, 'findUserByEmail', () => Promise.resolve(confirmedUser));
    chai.spy.on(service, 'confirmUser', () => Promise.resolve());
    chai.spy.on(service, 'updateUser', () => Promise.resolve());
    await controller.confirm(req, response);
    chai.expect(service.findUserByEmail).to.not.have.been.called();
    chai.expect(service.confirmUser).to.not.have.been.called();
    chai.expect(service.updateUser).to.not.have.been.called();
  });

  it('catches any internal error at the user registration', async () => {
    const token = tokenizer.getConfirmationToken(userOne.email);
    const userToConfirm = { ...userOneCopy(), confirmationToken: token };
    const confirmedUser = { ...userOneCopy(), ...mongooMock, confirmationToken: token };

    const req = {
      body: userToConfirm,
    };
    chai.spy.on(response, 'json', (error) => {
      chai.expect(response.statusCode).to.equal(httpStatuses.INTERNAL_SERVER_ERROR);
      chai.expect(typeof error.message).to.equal('string');
    });

    chai.spy.on(service, 'findUserByEmail', () => Promise.resolve(confirmedUser));
    chai.spy.on(service, 'confirmUser', () => Promise.reject(new Error('Internal error.')));
    chai.spy.on(service, 'updateUser', () => Promise.resolve());
    await controller.confirm(req, response);
    chai.expect(service.findUserByEmail).to.have.been.called();
    chai.expect(service.confirmUser).to.have.been.called();
    chai.expect(service.updateUser).to.not.have.been.called();
  });

  it('updates the user', async () => {
    const req = {
      user: { id: userOne.id },
      body: { ...userOneCopy(), _id: userOne.id },
    };
    chai.spy.on(response, 'json', (obj) => {
      chai.expect(typeof obj).to.equal('object');
    });

    chai.spy.on(service, 'updateUser', () => Promise.resolve(mongooMock));
    chai.spy.on(service, 'findUserById', () => Promise.resolve(userOneCopy()));

    await controller.update(req, response);
    chai.expect(service.updateUser).to.have.been.called();
    chai.expect(mongooMock.toObject).to.have.been.called();
  });

  it('updates the user password', async () => {
    const newPassword = 'another password';
    const body = JSON.parse(JSON.stringify({
      ...userOneCopy(),
      _id: userOne.id,
      oldPassword: unencryptedPassword,
      newPassword,
    }));
    const req = {
      user: { id: userOne.id },
      body,
    };
    chai.spy.on(response, 'json', (obj) => {
      chai.expect(typeof obj).to.equal('object');
    });

    chai.spy.on(service, 'updateUser', () => Promise.resolve(mongooMock));
    chai.spy.on(service, 'findUserById', () => Promise.resolve({
      ...userOneCopy(),
      password: encryptedPassword,
    }));

    await controller.update(req, response);
    chai.expect(service.updateUser).to.have.been.called();
    chai.expect(service.findUserById).to.have.been.called();
  });

  it('doesn\'t update the user password if passwords don\'t match', async () => {
    const newPassword = 'another password';
    const body = JSON.parse(JSON.stringify({
      ...userOneCopy(),
      _id: userOne.id,
      oldPassword: 'non matching password',
      newPassword,
    }));
    const req = {
      user: { id: userOne.id },
      body,
    };
    chai.spy.on(response, 'json', (obj) => {
      chai.expect(typeof obj).to.equal('object');
    });

    chai.spy.on(service, 'updateUser', () => Promise.resolve(mongooMock));
    chai.spy.on(service, 'findUserById', () => Promise.resolve({
      ...userOneCopy(),
      password: encryptedPassword,
    }));

    await controller.update(req, response);
    chai.expect(service.updateUser).to.have.not.been.called();
    chai.expect(service.findUserById).to.have.been.called();
  });

  it('doesn\'t update an unknown user', async () => {
    const req = {
      body: { ...userOneCopy(), _id: userOne.id },
    };
    chai.spy.on(response, 'json', (obj) => {
      chai.expect(typeof obj).to.equal('object');
    });

    chai.spy.on(service, 'updateUser', () => Promise.resolve());
    chai.spy.on(service, 'findUserById', () => Promise.resolve());

    await controller.update(req, response);
    chai.expect(service.findUserById).to.have.been.called();
    chai.expect(service.updateUser).to.not.have.been.called();
  });

  it('reports an error if no user specified', async () => {
    const req = {
      body: {},
    };
    chai.spy.on(response, 'json', (obj) => {
      chai.expect(typeof obj).to.equal('object');
    });

    chai.spy.on(service, 'updateUser', () => Promise.resolve());
    chai.spy.on(service, 'findUserById', () => Promise.resolve());

    await controller.update(req, response);
    chai.expect(service.updateUser).to.not.have.been.called();
    chai.expect(service.findUserById).to.not.have.been.called();
  });

  it('reports an error if user cannot be updated', async () => {
    const req = {
      user: { id: userOne.id },
      body: { ...userOneCopy(), _id: userOne.id },
    };
    chai.spy.on(response, 'json', (msg) => {
      chai.expect(response.statusCode).to.equal(httpStatuses.INTERNAL_SERVER_ERROR);
      chai.expect(typeof msg.message).to.equal('string');
    });

    chai.spy.on(service, 'findUserById', () => Promise.resolve(userOneCopy()));
    chai.spy.on(service, 'updateUser', () => Promise.reject(new Error('cannot create user')));

    await controller.update(req, response);
    chai.expect(service.updateUser).to.have.been.called();
  });

  it('logs the user in', async () => {
    const req = {
      body: {
        username: 'email@mail.com',
        password: 'users password',
      },
    };
    chai.spy.on(response, 'json', (obj) => {
      chai.expect(typeof obj).to.equal('object');
    });

    chai.spy.on(service, 'userToResponse');
    chai.spy.on(service, 'updateUser', () => Promise.resolve());
    chai.spy.on(service, 'getUserWithPassword', () => Promise.resolve({
      confirmationToken: '',
      ...userOneCopy(),
      toObject: chai.spy(() => userOneCopy()),
    }));
    chai.spy.on(tokenizer, 'getLoginToken', () => Promise.resolve('login-token'));

    await controller.login(req, response);
    chai.expect(service.updateUser).to.have.been.called();
    chai.expect(service.userToResponse).to.have.been.called();
    chai.expect(service.getUserWithPassword).to.have.been.called();
    chai.expect(tokenizer.getLoginToken).to.have.been.called();
  });

  it('reports an error if user cannot log in', async () => {
    const req = {
      body: {
        username: 'email@mail.com',
        password: 'users password',
      },
    };
    chai.spy.on(response, 'json', (msg) => {
      chai.expect(response.statusCode).to.equal(httpStatuses.INTERNAL_SERVER_ERROR);
      chai.expect(typeof msg.message).to.equal('string');
    });

    chai.spy.on(service, 'getUserWithPassword', () => Promise.resolve({ ...userOneCopy(), confirmationToken: '' }));
    chai.spy.on(tokenizer, 'getLoginToken', () => Promise.resolve('login-token'));

    await controller.login(req, response);
    chai.expect(service.getUserWithPassword).to.have.been.called();
    chai.expect(tokenizer.getLoginToken).to.not.have.been.called();
  });

  it('reports an error at login if user is unknown', async () => {
    const req = {
      body: {
        username: 'email@mail.com',
        password: 'users password',
      },
    };
    chai.spy.on(response, 'json', (msg) => {
      chai.expect(response.statusCode).to.equal(httpStatuses.UNAUTHORIZED);
      chai.expect(typeof msg.message).to.equal('string');
    });

    chai.spy.on(service, 'getUserWithPassword', () => Promise.resolve(null));
    chai.spy.on(tokenizer, 'getLoginToken', () => Promise.resolve('login-token'));

    await controller.login(req, response);
    chai.expect(service.getUserWithPassword).to.have.been.called();
    chai.expect(tokenizer.getLoginToken).to.not.have.been.called();
  });

  it('reports an error at login if user has not confirmed email', async () => {
    const req = {
      body: {
        username: 'email@mail.com',
        password: 'users password',
      },
    };
    chai.spy.on(response, 'json', (msg) => {
      chai.expect(response.statusCode).to.equal(httpStatuses.UNAUTHORIZED);
      chai.expect(typeof msg.message).to.equal('string');
    });

    chai.spy.on(service, 'getUserWithPassword', () => Promise.resolve({
      confirmationToken: 'confirmation-token',
    }));
    chai.spy.on(tokenizer, 'getLoginToken', () => Promise.resolve('login-token'));

    await controller.login(req, response);
    chai.expect(service.getUserWithPassword).to.have.been.called();
    chai.expect(tokenizer.getLoginToken).to.not.have.been.called();
  });

  it('reports an error if email field is missing on login', async () => {
    const req = {
      body: {
        password: userOne.password,
      },
    };
    chai.spy.on(response, 'json', (msg) => {
      chai.expect(response.statusCode).to.equal(httpStatuses.BAD_REQUEST);
      chai.expect(msg.message).to.equal('Field username is required');
    });

    await controller.login(req, response);
  });

  it('reports an error if password field is missing on login', async () => {
    const req = {
      body: {
        username: userOne.email,
      },
    };
    chai.spy.on(response, 'json', (msg) => {
      chai.expect(response.statusCode).to.equal(httpStatuses.BAD_REQUEST);
      chai.expect(msg.message).to.equal('Field password is required');
    });

    await controller.login(req, response);
  });

  it('sends an email to recover the user password', async () => {
    const req = {
      body: { email: userOne.email },
      i18n: {
        t: chai.spy(),
      },
    };
    chai.spy.on(response, 'json', (obj) => {
      chai.expect(response.statusCode).to.equal(httpStatuses.NO_CONTENT);
      chai.expect(typeof obj).to.equal('object');
    });

    chai.spy.on(service, 'findUserByEmail', () => mongooMock);
    chai.spy.on(tokenizer, 'getRecoverPasswordToken', () => '');
    chai.spy.on(service, 'getRecoverPasswordUrl');
    chai.spy.on(service, 'recoverPassword', () => Promise.resolve());
    chai.spy.on(mailer, 'sendRecoverPasswordMail');

    await controller.recoverPassword(req, response);
    chai.expect(service.findUserByEmail).to.have.been.called();
    chai.expect(tokenizer.getRecoverPasswordToken).to.have.been.called();
    chai.expect(service.getRecoverPasswordUrl).to.have.been.called();
    chai.expect(service.recoverPassword).to.have.been.called();
    chai.expect(mailer.sendRecoverPasswordMail).to.have.been.called();
  });

  it('reports an error if recover user password email cannot be sent', async () => {
    const req = {
      body: {
        email: userOne.email,
      },
      i18n: {
        language: 'en',
      },
    };
    chai.spy.on(response, 'json', (msg) => {
      chai.expect(response.statusCode).to.equal(httpStatuses.INTERNAL_SERVER_ERROR);
      chai.expect(typeof msg.message).to.equal('string');
    });

    chai.spy.on(service, 'findUserByEmail', () => mongooMock);
    chai.spy.on(tokenizer, 'getRecoverPasswordToken', () => '');
    chai.spy.on(service, 'getRecoverPasswordUrl');
    chai.spy.on(service, 'recoverPassword', () => Promise.reject(new Error('something went wrong')));
    chai.spy.on(mailer, 'sendRecoverPasswordMail');

    await controller.recoverPassword(req, response);
    chai.expect(service.findUserByEmail).to.have.been.called();
    chai.expect(tokenizer.getRecoverPasswordToken).to.have.been.called();
    chai.expect(service.getRecoverPasswordUrl).to.have.been.called();
    chai.expect(service.recoverPassword).to.have.been.called();
    chai.expect(mailer.sendRecoverPasswordMail).to.not.have.been.called();
  });

  it('reports an error if email is missing', async () => {
    const req = {};
    chai.spy.on(response, 'json', (msg) => {
      chai.expect(response.statusCode).to.equal(httpStatuses.BAD_REQUEST);
      chai.expect(typeof msg.message).to.equal('string');
    });

    await controller.recoverPassword(req, response);
  });

  it('doesn\'t report an error if user cannot be found', async () => {
    const req = {
      body: {
        email: userOne.email,
      },
    };
    chai.spy.on(response, 'json', (obj) => {
      chai.expect(response.statusCode).to.equal(httpStatuses.NO_CONTENT);
      chai.expect(typeof obj).to.equal('object');
    });

    chai.spy.on(service, 'findUserByEmail', () => Promise.resolve());
    chai.spy.on(service, 'recoverPassword');

    await controller.recoverPassword(req, response);

    chai.expect(service.findUserByEmail).to.have.been.called();
    chai.expect(service.recoverPassword).to.have.not.been.called();
  });

  it('resets the user password', async () => {
    const recoverPasswordToken = tokenizer.getRecoverPasswordToken(userOne.email);
    const userToReset = {
      ...userOneCopy(), ...mongooMock, recoverPasswordToken, password: globals.passwordForRecovery,
    };

    const req = {
      body: {
        email: userOne.email,
        password: userOne.password,
        token: recoverPasswordToken,
      },
    };
    chai.spy.on(response, 'json', (obj) => {
      chai.expect(response.statusCode).to.equal(httpStatuses.OK);
      chai.expect(typeof obj.user).to.equal('object');
      chai.expect(typeof obj.token).to.equal('string');
    });

    chai.spy.on(tokenizer, 'isTokenExpired', () => false);
    chai.spy.on(service, 'findUserByEmail', () => Promise.resolve(userToReset));
    chai.spy.on(service, 'resetPassword', () => Promise.resolve());
    await controller.resetPassword(req, response);
    chai.expect(tokenizer.isTokenExpired).to.have.been.called();
    chai.expect(service.findUserByEmail).to.have.been.called();
    chai.expect(service.resetPassword).to.have.been.called();
  });

  it('checks token ownership at the user reset password', async () => {
    const tokenOne = tokenizer.getRecoverPasswordToken(userOne.email);
    const tokenTwo = tokenizer.getRecoverPasswordToken(userTwo.email);
    const monguser = {
      ...userTwoCopy(), ...mongooMock, recoverPasswordToken: tokenTwo, password: '',
    };

    const req = {
      body: {
        email: userOne.email,
        password: userOne.password,
        token: tokenOne,
      },
    };
    chai.spy.on(response, 'json', (error) => {
      chai.expect(response.statusCode).to.equal(httpStatuses.NOT_FOUND);
      chai.expect(typeof error.message).to.equal('string');
    });

    chai.spy.on(service, 'findUserByEmail', () => Promise.resolve(monguser));
    chai.spy.on(service, 'resetPassword', () => Promise.resolve());
    await controller.resetPassword(req, response);
    chai.expect(service.resetPassword).to.not.have.been.called();
  });

  it('checks token expiration at the user reset password', async () => {
    const recoverPasswordToken = tokenizer.getRecoverPasswordToken(userOne.email);
    const monguser = { ...userOneCopy(), ...mongooMock, recoverPasswordToken };

    const req = {
      body: {
        email: userOne.email,
        password: userOne.password,
        token: recoverPasswordToken,
      },
    };
    chai.spy.on(response, 'json', (error) => {
      chai.expect(response.statusCode).to.equal(httpStatuses.UNAUTHORIZED);
      chai.expect(typeof error.message).to.equal('string');
    });

    chai.spy.on(service, 'findUserByEmail', () => Promise.resolve(monguser));
    chai.spy.on(service, 'resetPassword', () => Promise.resolve());
    chai.spy.on(tokenizer, 'isTokenExpired', () => true);
    await controller.resetPassword(req, response);
    chai.expect(tokenizer.isTokenExpired).to.have.been.called();
    chai.expect(service.resetPassword).to.not.have.been.called();
  });

  it('catches any internal error at the user reset password', async () => {
    const recoverPasswordToken = tokenizer.getRecoverPasswordToken(userOne.email);
    const monguser = {
      ...userOneCopy(), ...mongooMock, recoverPasswordToken, password: globals.passwordForRecovery,
    };

    const req = {
      body: {
        email: userOne.email,
        password: userOne.password,
        token: recoverPasswordToken,
      },
    };
    chai.spy.on(response, 'json', (error) => {
      chai.expect(response.statusCode).to.equal(httpStatuses.INTERNAL_SERVER_ERROR);
      chai.expect(typeof error.message).to.equal('string');
    });

    chai.spy.on(service, 'findUserByEmail', () => Promise.resolve(monguser));
    chai.spy.on(service, 'resetPassword', () => { throw new Error('Internal error.'); });
    await controller.resetPassword(req, response);
  });

  it('reports an error if email field is missing on reset', async () => {
    const req = {
      body: {},
    };
    chai.spy.on(response, 'json', (msg) => {
      chai.expect(response.statusCode).to.equal(httpStatuses.BAD_REQUEST);
      chai.expect(typeof msg.message).to.equal('string');
    });

    await controller.resetPassword(req, response);
  });

  it('reports an error if password field is missing on reset', async () => {
    const req = {
      body: {
        email: userOne.email,
      },
    };
    chai.spy.on(response, 'json', (msg) => {
      chai.expect(response.statusCode).to.equal(httpStatuses.BAD_REQUEST);
      chai.expect(typeof msg.message).to.equal('string');
    });

    await controller.resetPassword(req, response);
  });

  it('reports an error if token field is missing on reset', async () => {
    const req = {
      body: {
        email: userOne.email,
        password: userOne.password,
      },
    };
    chai.spy.on(response, 'json', (msg) => {
      chai.expect(response.statusCode).to.equal(httpStatuses.BAD_REQUEST);
      chai.expect(typeof msg.message).to.equal('string');
    });

    await controller.resetPassword(req, response);
  });

  it('reports an error if user has password on reset', async () => {
    const recoverPasswordToken = tokenizer.getRecoverPasswordToken(userOne.email);
    const monguser = { ...userOneCopy(), ...mongooMock, recoverPasswordToken };

    const req = {
      body: {
        email: userOne.email,
        password: userOne.password,
        token: recoverPasswordToken,
      },
    };
    chai.spy.on(response, 'json', (msg) => {
      chai.expect(response.statusCode).to.equal(httpStatuses.UNAUTHORIZED);
      chai.expect(typeof msg.message).to.equal('string');
    });

    chai.spy.on(service, 'findUserByEmail', () => Promise.resolve(monguser));
    await controller.resetPassword(req, response);
  });
});
