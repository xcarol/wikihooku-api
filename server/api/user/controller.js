const globals = require('../../consts/globals');
const service = require('../../services/user');
const response = require('../../services/response');
const mailer = require('../../services/mailer');
const tokenizer = require('../../services/tokenizer');
const httpStatuses = require('../../consts/httpStatuses');

const controller = {
  async user(req, res) {
    if (!req.params || !req.params.userid) {
      response.error(res, 'Missing user id', httpStatuses.BAD_REQUEST);
      return;
    }

    const user = await service.findUserById(req.params.userid);

    if (!user) {
      response.error(res, 'User not found', httpStatuses.NOT_FOUND);
      return;
    }

    response.object(res, {
      user,
    });
  },

  async create(req, res) {
    let monguser;
    let missingField;
    const user = req.body;

    if (!user.fullname) {
      missingField = 'fullname';
    } else if (!user.email) {
      missingField = 'email';
    } else if (!user.password) {
      missingField = 'password';
    }

    if (missingField) {
      response.error(res, `Field ${missingField} is required`, httpStatuses.BAD_REQUEST);
      return;
    }

    try {
      const userExists = await service.findUserByEmail(user.email);
      if (userExists) {
        response.error(res, 'User already exists', httpStatuses.CONFLICT);
        return;
      }

      monguser = await service.addUser(user);
      if (monguser === null) {
        response.error(res, 'Invalid user', httpStatuses.BAD_REQUEST);
        return;
      }
    } catch (error) {
      res.log.error(`Cannot create user: ${JSON.stringify(user)} - error: ${JSON.stringify(error)}`);
      response.error(res, error.message, httpStatuses.INTERNAL_SERVER_ERROR);
      return;
    }

    const tokenUrl = service.getConfirmationUrl(req.i18n, monguser.email, monguser.confirmationToken);
    mailer.sendConfirmationMail(req.i18n, monguser.email, tokenUrl);

    const token = tokenizer.getLoginToken(monguser.toObject());
    response.object(res, { user: service.userToResponse(monguser), token }, httpStatuses.CREATED);
  },

  async confirm(req, res) {
    let monguser;
    const registerUser = req.body;

    try {
      if (tokenizer.isTokenExpired(registerUser.confirmationToken)) {
        response.error(res, 'Expired token', httpStatuses.FORBIDDEN);
        return;
      }

      monguser = await service.findUserByEmail(decodeURIComponent(registerUser.email));

      if (!tokenizer.matchTokens(registerUser.confirmationToken, monguser.confirmationToken)) {
        response.error(res, 'Unrecognized token', httpStatuses.NOT_FOUND);
        return;
      }

      await service.confirmUser(monguser);

      monguser.token = tokenizer.getLoginToken(monguser.toObject());
      await service.updateUser(monguser);
    } catch (error) {
      res.log.error(`Cannot confirm user: ${JSON.stringify(registerUser)} - error: ${JSON.stringify(error)}`);
      response.error(res, error.message, httpStatuses.INTERNAL_SERVER_ERROR);
      return;
    }

    response.object(res, { user: service.userToResponse(monguser), token: monguser.token }, httpStatuses.ACCEPTED);
  },

  async update(req, res) {
    const user = req.body;

    if (!user._id) {
      response.error(res, 'Field _id is required', httpStatuses.BAD_REQUEST);
      return;
    }

    const monguser = await service.findUserById(user._id, '-confirmationToken');

    if (!monguser) {
      response.error(res, 'User not found', httpStatuses.NOT_FOUND);
      return;
    }

    if (user.newPassword) {
      if (await service.encryptPassword(user.oldPassword) !== monguser.password) {
        response.error(res, 'Current password don\'t match', httpStatuses.BAD_REQUEST);
        return;
      }
      user.password = await service.encryptPassword(user.newPassword);
    }

    try {
      await service.updateUser(Object.assign(monguser, user));
      response.object(res, {}, httpStatuses.NO_CONTENT);
    } catch (error) {
      response.error(res, error.message, httpStatuses.INTERNAL_SERVER_ERROR);
    }
  },

  async login(req, res) {
    let loginUser;
    let missingField;
    const user = req.body;

    if (!user.username) {
      missingField = 'username';
    } else if (!user.password) {
      missingField = 'password';
    }

    if (missingField) {
      response.error(res, `Field ${missingField} is required`, httpStatuses.BAD_REQUEST);
      return;
    }

    try {
      loginUser = await service.getUserWithPassword(user.username, user.password);
      if (!loginUser) {
        response.error(res, 'User or Password error', httpStatuses.UNAUTHORIZED);
        return;
      }
      if (loginUser.confirmationToken !== '') {
        response.error(res, 'User missing confirmation email', httpStatuses.UNAUTHORIZED);
        return;
      }

      loginUser.token = tokenizer.getLoginToken(loginUser.toObject());
      await service.updateUser(loginUser);
    } catch (error) {
      res.log.error(`Cannot login user: ${JSON.stringify(user)} - error: ${JSON.stringify(error)}`);
      response.error(res, error.message, httpStatuses.INTERNAL_SERVER_ERROR);
      return;
    }

    response.object(res, { user: service.userToResponse(loginUser), token: loginUser.token }, httpStatuses.ACCEPTED);
  },

  async recoverPassword(req, res) {
    if (!req.body || !req.body.email) {
      response.error(res, 'Field email is required', httpStatuses.BAD_REQUEST);
      return;
    }

    const { email } = req.body;
    const monguser = await service.findUserByEmail(email);

    if (!monguser) {
      response.object(res, {}, httpStatuses.NO_CONTENT);
      return;
    }

    const token = tokenizer.getRecoverPasswordToken(monguser.toObject());
    const tokenUrl = service.getRecoverPasswordUrl(req.i18n, email, token);

    try {
      await service.recoverPassword(monguser, token);
      mailer.sendRecoverPasswordMail(req.i18n, email, tokenUrl);
    } catch (error) {
      res.log.error(`Cannot recover password for email: ${email} - error: ${JSON.stringify(error)}`);
      response.message(res, error.message, httpStatuses.INTERNAL_SERVER_ERROR);
      return;
    }

    response.object(res, {}, httpStatuses.NO_CONTENT);
  },

  async resetPassword(req, res) {
    let missingField;
    const { email, password, token } = req.body;

    if (!email) {
      missingField = 'email';
    } else if (!password) {
      missingField = 'password';
    } else if (!token) {
      missingField = 'token';
    }

    if (missingField) {
      response.error(res, `Field ${missingField} is required`, httpStatuses.BAD_REQUEST);
      return;
    }

    if (tokenizer.isTokenExpired(token)) {
      response.error(res, 'Token expired', httpStatuses.UNAUTHORIZED);
      return;
    }

    const monguser = await service.findUserByEmail(email);

    if (!tokenizer.matchTokens(monguser.recoverPasswordToken, token)) {
      response.error(res, 'Unrecognized token', httpStatuses.NOT_FOUND);
      return;
    }

    if (monguser.password !== globals.passwordForRecovery) {
      response.error(res, 'Token invalid', httpStatuses.UNAUTHORIZED);
      return;
    }

    let resetMonguser;
    try {
      await service.resetPassword(monguser, password);
      resetMonguser = await service.findUserByEmail(email);
    } catch (error) {
      res.log.error(`Cannot reset password for user: ${JSON.stringify(email)} - error: ${JSON.stringify(error)}`);
      response.error(res, error.message, httpStatuses.INTERNAL_SERVER_ERROR);
      return;
    }

    const loginToken = tokenizer.getLoginToken(resetMonguser.toObject());
    response.object(res, { user: service.userToResponse(resetMonguser), token: loginToken }, httpStatuses.OK);
  },
};

module.exports = controller;
