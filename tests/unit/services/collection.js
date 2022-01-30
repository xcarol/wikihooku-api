const mongoose = require('mongoose');
const chai = require('chai');
const spies = require('chai-spies');

const CollectionSchema = require('../../../server/models/Collection');
const service = require('../../../server/services/collection');
const collections = require('../../data/collections');

const Collection = mongoose.model('Collection', CollectionSchema);
const testCollections = JSON.parse(JSON.stringify(collections));
const [collectionOne] = testCollections;

before(() => {
  chai.use(spies);
});

describe('Collection Service', () => {
  beforeEach(() => {});

  afterEach(() => {
    chai.spy.restore();
  });

  it('calls collection findOne', async () => {
    chai.spy.on(Collection, 'findOne', () => collectionOne);
    const collection = await service.findCollectionById();

    chai.expect(Collection.findOne).to.have.been.called();
    chai.expect(collection).to.deep.equal(collectionOne);
  });
});
