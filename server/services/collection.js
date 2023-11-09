const mongoose = require('mongoose');

const CollectionSchema = require('../models/Collection');

const Collection = mongoose.model('Collection', CollectionSchema);

const service = {
  async findCollectionById(collectionId) {
    return Collection.findOne({ _id: collectionId });
  },
  async findCollectionByName(name) {
    return Collection.findOne({ name });
  },
  async addCollection(collection) {
    return Collection.create(collection);
  },
  async getPublicCollectionNames() {
    return Collection.find({ public: true }).select('name');
  },
  async getUserCollectionNames(userid) {
    if (mongoose.isValidObjectId(userid)) {
      return Collection.find({ owner: userid }).select('name');
    }

    return [];
  },
};

module.exports = service;
