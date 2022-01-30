const mongoose = require('mongoose');

const { Schema } = mongoose;

const CollectionSchema = new Schema(
  {
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
