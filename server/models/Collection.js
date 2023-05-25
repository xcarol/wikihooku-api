const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const CollectionSchema = new Schema(
  {
    owner: {
      type: ObjectId,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    items: {
      type: Array,
      required: true,
    },
  },
  {
    strict: true,
    collection: 'collection',
  },
);

CollectionSchema.index({ name: -1, items: [] });

module.exports = CollectionSchema;
