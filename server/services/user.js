/* eslint-disable no-param-reassign */
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const globals = require('../consts/globals');

const logger = require('./logger');
const tokenizer = require('./tokenizer');
const UserSchema = require('../models/User');

const User = mongoose.model('User', UserSchema);

const service = {
  async encryptPassword(password) {
    return bcryptjs.hash(
      password,
      process.env.SALT,
    );
  },

  async allUsers() {
    return User.find({}, '-confirmationToken -password -createdAt');
  },

  async addUser(user) {
    const encPass = await this.encryptPassword(user.password);
    const confirmationToken = tokenizer.getConfirmationToken(user.email);

    const monguser = new User({
      fullname: user.fullname,
      email: user.email,
      password: encPass,
      createdAt: new Date(),
      confirmationToken,
      verified: false,
    });

    return monguser.save();
  },

  async confirmUser(monguser) {
    monguser.confirmationToken = '';
    monguser.verified = true;
    return monguser.save();
  },

  async updateUser(monguser) {
    return User.updateOne({ _id: monguser._id }, monguser);
  },

  async resetPassword(monguser, password) {
    const encPass = await this.encryptPassword(password);
    monguser.recoverPasswordToken = '';
    monguser.password = encPass;
    return monguser.save();
  },

  async recoverPassword(monguser, recoverPasswordToken) {
    monguser.password = globals.passwordForRecovery;
    monguser.recoverPasswordToken = recoverPasswordToken;
    return monguser.save();
  },

  async findUserByEmail(email) {
    return User.findOne({ email });
  },

  async getUserWithPassword(email, password) {
    const monguser = await User.findOne({ email });
    if (!monguser) {
      return null;
    }
    const rightPass = bcryptjs.compareSync(password, monguser.password);

    return rightPass ? monguser : null;
  },

  getConfirmationUrl(i18n, email, token) {
    return `${process.env.CONFIRMATION_URL}?lang=${encodeURIComponent(i18n.language)}&email=${encodeURIComponent(email)}&token=${token}`;
  },

  getRecoverPasswordUrl(i18n, email, token) {
    return `${process.env.RECOVER_PASSWORD_URL}?lang=${encodeURIComponent(i18n.language)}&email=${encodeURIComponent(email)}&token=${token}`;
  },

  async findUserById(userId, filter = '-confirmationToken -password -createdAt') {
    const user = await User.findById(userId, filter)
      .catch((error) => {
        logger.getLogger().info(`Error ${error} looking for user with id: '${userId}'`);
      });
    return user;
  },

  async findByToken(token) {
    const user = await User.findOne({ token })
      .catch((error) => {
        logger.getLogger().info(`Error ${error} looking for the user with token: '${token}'`);
      });
    return user;
  },

  userToResponse(monguser) {
    const user = monguser.toObject();

    user.token = undefined;
    user.confirmationToken = undefined;
    user.password = undefined;

    return user;
  },
};

module.exports = service;
