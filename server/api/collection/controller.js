const service = require('../../services/collection');
const response = require('../../services/response');
const httpStatuses = require('../../lib/httpStatuses');

const controller = {
  async collectionNames(req, res) {
    let publicCollectionNames = [];
    let userCollectionNames = [];

    publicCollectionNames = await service.getPublicCollectionNames();

    if (req.params && req.params.userid) {
      userCollectionNames = await service.getUserCollectionNames(req.params.userid);
    }

    const collectionNames = [...publicCollectionNames, ...userCollectionNames];

    response.object(res, {
      collectionNames,
    });
  },
  async collection(req, res) {
    if (!req.params || !req.params.collectionid) {
      response.error(res, 'Missing collection id', httpStatuses.BAD_REQUEST);
      return;
    }

    const collection = await service.findCollectionById(req.params.collectionid);

    if (!collection) {
      response.error(res, 'Collection not found', httpStatuses.NOT_FOUND);
      return;
    }

    response.object(res, {
      collection,
    });
  },
  async create(req, res) {
    let mongocollection;
    let missingField;
    const collection = req.body;

    if (!collection.name) {
      missingField = 'name';
    } else if (!collection.items) {
      missingField = 'items';
    }

    if (missingField) {
      response.error(res, `Field ${missingField} is required`, httpStatuses.BAD_REQUEST);
      return;
    }

    try {
      const collectionExists = await service.findCollectionByName(collection.name);
      if (collectionExists) {
        response.error(res, 'collection already exists', httpStatuses.CONFLICT);
        return;
      }

      collection.owner = collection._id;
      collection._id = undefined;
      mongocollection = await service.addCollection(collection);
      if (mongocollection === null) {
        response.error(res, 'Invalid collection', httpStatuses.BAD_REQUEST);
        return;
      }
    } catch (error) {
      res.log.error(`Cannot create collection: ${JSON.stringify(collection)} - error: ${JSON.stringify(error)}`);
      response.error(res, error.message, error.code ? error.code : httpStatuses.INTERNAL_SERVER_ERROR);
      return;
    }

    response.object(res, { collection }, httpStatuses.CREATED);
  },
};

module.exports = controller;
