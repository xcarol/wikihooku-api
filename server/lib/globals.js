const oneDayInMilliseconds = 60 * 60 * 24 * 1000;
const expiresLoginInMs = oneDayInMilliseconds * 50;
const expiresConfirmInMs = oneDayInMilliseconds * 2;

module.exports = {
  oneDayInMilliseconds,
  expiresLoginInMs,
  expiresConfirmInMs,
  passwordForRecovery: 'password-recovery-requested',
};
