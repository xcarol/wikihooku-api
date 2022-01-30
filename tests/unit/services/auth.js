const chai = require('chai');
const spies = require('chai-spies');

const logger = require('../../../server/services/logger');
const userService = require('../../../server/services/user');
const tokenizer = require('../../../server/services/tokenizer');
const service = require('../../../server/services/auth');
const response = require('../../../server/services/response');

const users = require('../../data/users');

const testUsers = JSON.parse(JSON.stringify(users));
const [userOne, userTwo] = testUsers;

let req;
let res;

before(() => {
  chai.use(spies);
});

describe('Auth Service', () => {
  beforeEach(() => {
    req = {
      headers: {
        authorization: 'Bearer the-good-bearer',
        'Content-Type': 'application/json',
      },
      logIn: chai.spy((user, options, cb) => {
        chai.expect(user).to.eq(userOne);
        cb();
      }),
      user: {
        _id: ({ toString: chai.spy(() => userOne.id) }),
      },
    };

    res = {
      log: { debug: chai.spy() },
      json: chai.spy(),
      setHeader: chai.spy(),
      end: chai.spy(),
    };

    logger.init();
  });

  afterEach(() => {
    chai.spy.restore();
  });

  it('checks an anonymous user', async () => {
    req.headers.authorization = undefined;
    chai.spy.on(userService, 'findByToken');
    chai.spy.on(tokenizer, 'isTokenExpired');

    const next = chai.spy();
    const auth = await service.AuthUserOrAnonymous();

    await auth(req, res, next);

    chai.expect(tokenizer.isTokenExpired).to.not.have.been.called();
    chai.expect(userService.findByToken).to.not.have.been.called();
    chai.expect(next).to.have.been.called();
  });

  it('checks a valid user token', async () => {
    chai.spy.on(userService, 'findByToken', () => userOne);
    chai.spy.on(tokenizer, 'isTokenExpired', () => false);

    const next = chai.spy();
    const auth = await service.AuthUserOrAnonymous();

    await auth(req, res, next);

    chai.expect(tokenizer.isTokenExpired).to.have.been.called();
    chai.expect(userService.findByToken).to.have.been.called();
    chai.expect(next).to.have.been.called();
  });

  it('checks an expired user token', async () => {
    chai.spy.on(userService, 'findByToken');
    chai.spy.on(tokenizer, 'isTokenExpired', () => true);

    const next = chai.spy();
    const auth = await service.AuthUserOrAnonymous();

    await auth(req, res, next);

    chai.expect(tokenizer.isTokenExpired).to.have.been.called();
    chai.expect(userService.findByToken).to.not.have.been.called();
    chai.expect(next).to.have.been.called();
  });

  it('authenticates a valid user', async () => {
    chai.spy.on(userService, 'findByToken', () => userOne);
    chai.spy.on(tokenizer, 'isTokenExpired', () => false);

    const next = chai.spy();
    const auth = await service.AuthUser();

    await auth(req, res, next);

    chai.expect(tokenizer.isTokenExpired).to.have.been.called();
    chai.expect(userService.findByToken).to.have.been.called();
    chai.expect(next).to.have.been.called();
  });

  it('does not authenticate an anonymous user', async () => {
    req.headers.authorization = undefined;
    chai.spy.on(userService, 'findByToken');
    chai.spy.on(tokenizer, 'isTokenExpired');

    const next = chai.spy();
    const auth = await service.AuthUser();

    await auth(req, res, next);

    chai.expect(tokenizer.isTokenExpired).to.not.have.been.called();
    chai.expect(userService.findByToken).to.not.have.been.called();
    chai.expect(next).to.not.have.been.called();
    chai.expect(res.setHeader).to.have.been.called();
    chai.expect(res.end).to.have.been.called();
  });

  it('authorizes the owner identified by param', async () => {
    const next = chai.spy();
    req.params = {
      userid: userOne.id,
    };
    service.IsOwner(req, res, next);
    chai.expect(next).to.have.been.called();
  });

  it('authorizes the owner identified by body', async () => {
    const next = chai.spy();
    req.body = {
      _id: userOne.id,
    };
    service.IsOwner(req, res, next);
    chai.expect(next).to.have.been.called();
  });

  it('does not authorize an anonymous user', async () => {
    const next = chai.spy();
    chai.spy.on(response, 'error');

    service.IsOwner(req, res, next);

    chai.expect(next).to.not.have.been.called();
    chai.expect(response.error).to.have.been.called();
  });

  it('does not authorize a user without method user identifier', async () => {
    const next = chai.spy();
    chai.spy.on(response, 'error');

    service.IsOwner(req, res, next);

    chai.expect(next).to.not.have.been.called();
    chai.expect(response.error).to.have.been.called();
  });

  it('does not authorize a user with wrong param user identifier', async () => {
    const next = chai.spy();
    chai.spy.on(response, 'error');

    req.params = {
      userid: userTwo.id,
    };
    service.IsOwner(req, res, next);

    chai.expect(next).to.not.have.been.called();
    chai.expect(response.error).to.have.been.called();
  });

  it('does not authorize a user with wrong body user identifier', async () => {
    const next = chai.spy();
    chai.spy.on(response, 'error');

    req.body = {
      _id: userTwo.id,
    };
    service.IsOwner(req, res, next);

    chai.expect(next).to.not.have.been.called();
    chai.expect(response.error).to.have.been.called();
  });
});
