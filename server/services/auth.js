const { Passport } = require('passport');
const { Strategy: BearerStrategy } = require('passport-http-bearer');
const { Strategy: AnonymousStrategy } = require('passport-anonymous');
const userService = require('./user');
const tokenizer = require('./tokenizer');
const response = require('./response');
const httpStatuses = require('../consts/httpStatuses');

async function BearerCheck(token, cb) {
  if (tokenizer.isTokenExpired(token)) {
    return cb(new Error('Expired token'));
  }

  return cb(null, await userService.findByToken(token));
}

module.exports.AuthUserOrAnonymous = () => {
  const passport = new Passport();
  passport.use(new BearerStrategy(async (token, cb) => BearerCheck(token, cb)));
  passport.use(new AnonymousStrategy());
  return passport.authenticate(['bearer', 'anonymous'], { session: false });
};

module.exports.AuthUser = () => {
  const passport = new Passport();
  passport.use(new BearerStrategy(async (token, cb) => BearerCheck(token, cb)));
  return passport.authenticate(['bearer'], { session: false });
};

module.exports.IsOwner = (req, res, next) => {
  if (!req.user) {
    response.error(res, 'Unauthorized', httpStatuses.FORBIDDEN);
    return;
  }

  const reqUserId = req.user._id.toString();
  const paramUserId = req.params ? req.params.userid : null;
  const bodyUserId = req.body ? req.body._id : null;

  if (reqUserId === paramUserId || reqUserId === bodyUserId) {
    next();
    return;
  }

  response.error(res, 'Unauthorized', httpStatuses.FORBIDDEN);
};
