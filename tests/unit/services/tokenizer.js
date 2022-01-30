const chai = require('chai');

const globals = require('../../../server/consts/globals');
const tokenizer = require('../../../server/services/tokenizer');

const users = require('../../data/users');

const testUsers = JSON.parse(JSON.stringify(users));
const [userOne] = testUsers;

describe('Token Service', () => {
  it('generates a login token', () => {
    const token = tokenizer.getLoginToken(userOne);
    const login = tokenizer.decryptToken(token);
    const expiresAt = new Date(login.expiresAt) - new Date();

    chai.expect(login.user).to.eql(userOne.email);
    chai.expect(expiresAt).to.be.within(
      globals.expiresLoginInMs - globals.oneDayInMilliseconds,
      globals.expiresLoginInMs,
    );
  });

  it('generates a confirmation token', () => {
    const token = tokenizer.getConfirmationToken(userOne.email);
    const confirmation = tokenizer.decryptToken(token);
    const expiresAt = new Date(confirmation.expiresAt) - new Date();

    chai.expect(confirmation.username).to.eql(userOne.email);
    chai.expect(expiresAt).to.be.within(
      globals.expiresConfirmInMs - globals.oneDayInMilliseconds,
      globals.expiresConfirmInMs,
    );
  });

  it('generates a recover password token', () => {
    const token = tokenizer.getRecoverPasswordToken(userOne.email);
    const recoverToken = tokenizer.decryptToken(token);
    const expiresAt = new Date(recoverToken.expiresAt) - new Date();

    chai.expect(recoverToken.username).to.eql(userOne.email);
    chai.expect(expiresAt).to.be.within(
      globals.expiresConfirmInMs - globals.oneDayInMilliseconds,
      globals.expiresConfirmInMs,
    );
  });

  it('decrypts a valid token', () => {
    const token = tokenizer.getConfirmationToken(userOne.email);
    const decrypt = tokenizer.decryptToken(token);
    chai.expect(decrypt.username).to.be.eql(userOne.email);
  });

  it('checks a valid token', () => {
    const token = tokenizer.getConfirmationToken(userOne.email);
    chai.expect(tokenizer.isTokenExpired(token)).to.eql(false);
  });

  it('checks an expired token', () => {
    const token = tokenizer.getConfirmationToken(userOne.email);
    const decrypt = tokenizer.decryptToken(token);
    decrypt.expiresAt += 1000;
    chai.expect(tokenizer.isTokenExpired(token)).to.eql(false);
  });
});
