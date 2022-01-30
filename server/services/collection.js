const mongoose = require('mongoose');

const CollectionSchema = require('../models/Collection');

const Collection = mongoose.model('Collection', CollectionSchema);

const service = {
  async findCollectionById(collectionId) {
    return Collection.findOne({ type: collectionId });
  },
};

module.exports = service;
