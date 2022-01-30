const { Router } = require('restify-router');
const controller = require('./controller');

const router = new Router();

router.post('', controller.create);

module.exports = router;
