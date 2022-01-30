const mongoose = require('mongoose');

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      required: true,
    },
    token: {
      type: String,
      required: false,
      default: null,
    },
    verified: {
      type: Boolean,
      required: true,
    },
    confirmationToken: {
      type: String,
      required: false,
      default: null,
    },
    recoverPasswordToken: {
      type: String,
      required: false,
      default: null,
    },
    locale: {
      type: String,
      required: false,
    },
  },
  {
    strict: true,
    collection: 'user',
  },
);

UserSchema.index({ email: -1 });

module.exports = UserSchema;
