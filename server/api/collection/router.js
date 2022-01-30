const { Router } = require('restify-router');
const controller = require('./controller');

const router = new Router();

router.get('/:collectionid', controller.collection);

module.exports = router;
