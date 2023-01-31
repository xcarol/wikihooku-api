const { Router } = require('restify-router');
const controller = require('./controller');

const router = new Router();

router.get('/search/:offset/:limit/:text', controller.search);
router.get('/page/:pageid', controller.page);

module.exports = router;
