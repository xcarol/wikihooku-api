const collectionService = require('../../services/collection');
const response = require('../../services/response');
const httpStatuses = require('../../consts/httpStatuses');

const controller = {
  async collection(req, res) {
    if (!req.params || !req.params.collectionid) {
      response.error(res, 'Missing collection id', httpStatuses.BAD_REQUEST);
      return;
    }

    const collection = await collectionService.findCollectionById(req.params.collectionid);

    if (!collection) {
      response.error(res, 'Collection not found', httpStatuses.NOT_FOUND);
      return;
    }

    response.object(res, collection);
  },
};

module.exports = controller;
