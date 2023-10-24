const mongoose = require('mongoose');

const { Schema } = mongoose;

const CollectionSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
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
    public: {
      type: Boolean,
      default: false,
    },
  },
  {
    strict: true,
    collection: 'collection',
  },
);

CollectionSchema.index({ name: -1 });

module.exports = CollectionSchema;
