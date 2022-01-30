const jwt = require('jsonwebtoken');
const globals = require('../consts/globals');

const tokenizer = {
  getLoginToken(user) {
    const expiresAt = new Date().getTime() + globals.expiresLoginInMs;
    const payload = {
      user: user.email,
      expiresAt,
    };
    return jwt.sign(payload, process.env.SECRET);
  },
  getConfirmationToken(email) {
    const expiresAt = new Date().getTime() + globals.expiresConfirmInMs;
    const payload = {
      username: email,
      expiresAt,
    };
    return jwt.sign(payload, process.env.SECRET);
  },
  getRecoverPasswordToken(email) {
    const expiresAt = new Date().getTime() + globals.expiresConfirmInMs;
    const payload = {
      username: email,
      expiresAt,
    };
    return jwt.sign(payload, process.env.SECRET);
  },
  decryptToken(token) {
    return jwt.decode(token, process.env.SECRET);
  },
  isTokenExpired(token) {
    const decryptedToken = tokenizer.decryptToken(token);
    return decryptedToken ? decryptedToken.expiresAt < new Date().getTime() : true;
  },
  matchTokens(tokenA, tokenB) {
    let mismatch = 0;
    for (let i = 0; i < tokenA.length; i += 1) {
      // timing attacks: https://snyk.io/blog/node-js-timing-attack-ccc-ctf/
      // eslint-disable-next-line no-bitwise
      mismatch |= (tokenA.charCodeAt(i) ^ tokenB.charCodeAt(i));
    }
    return mismatch === 0;
  },
};

module.exports = tokenizer;
