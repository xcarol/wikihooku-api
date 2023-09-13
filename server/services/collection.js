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
  async getAllCollectionNames() {
    return Collection.find().select('name');
  },
};

module.exports = service;
