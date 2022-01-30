const mongoose = require('mongoose');

const { Schema } = mongoose;

const FeedbackSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    feedback: {
      type: String,
      required: true,
    },
  },
  {
    strict: true,
    collection: 'feedback',
  },
);

module.exports = FeedbackSchema;
