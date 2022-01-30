const mongoose = require('mongoose');

const FeedbackSchema = require('../models/Feedback');

const Feedback = mongoose.model('Feedback', FeedbackSchema);

const service = {
  async addFeedback(email, feedback) {
    return Feedback.create({ email, feedback });
  },
};

module.exports = service;
