const mongoose = require('mongoose');

const CollectionSchema = require('../models/Collection');

const Collection = mongoose.model('Collection', CollectionSchema);

const service = {
  async findCollectionById(collectionId) {
    return Collection.findOne({ collectionId });
  },
  async addCollection(name, items) {
    return Collection.create({ name, items });
  },
};

module.exports = service;
