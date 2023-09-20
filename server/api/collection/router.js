const { Router } = require('restify-router');
const controller = require('./controller');
const { AuthUser, IsOwner } = require('../../services/auth');

const router = new Router();

router.get('/names', controller.collectionNames);
router.get('/names/:userid', controller.collectionNames);
router.get('/:collectionid', controller.collection);
router.post('', AuthUser(), IsOwner, controller.create);

module.exports = router;
