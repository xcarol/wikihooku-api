const chai = require('chai');
const request = require('supertest');
const mongoose = require('mongoose');

const Server = require('../../../../server');
const httpStatuses = require('../../../../server/consts/httpStatuses');
const CollectionSchema = require('../../../../server/models/Collection');
const collections = require('../../../data/collections');

const Collection = mongoose.model('Collection', CollectionSchema);

let mongcollections;

async function addCollections() {
  mongcollections = [];
  collections.forEach((collection) => {
    const mongcollection = new Collection(collection);
    mongcollections.push(mongcollection.save());
  });

  return Promise.all(mongcollections);
}

describe('Collection', () => {
  beforeEach(async () => {
    await Collection.deleteMany({});
  });

  it('returns requested Collection', async () => {
    const addedCollections = await addCollections();
    const response = await request(Server).get(`/api/collection/${addedCollections[0].name}}`);

    chai.expect(response.statusCode).to.eql(httpStatuses.OK);
    chai.expect(response.body.name).to.eql(addedCollections[0].name);
  });

  it('returns error if requested collection does not exist', async () => {
    const response = await request(Server).get('/api/collection/non-valid-collection');
    chai.expect(response.statusCode).to.eql(httpStatuses.NOT_FOUND);
  });

  it('returns an error if any missing parameter', async () => {
    const res = await request(Server)
      .get('/api/collection/');
    chai.expect(res.statusCode).to.equal(httpStatuses.BAD_REQUEST);
  });
});
