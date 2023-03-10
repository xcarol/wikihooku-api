const { Router } = require('restify-router');
const controller = require('./controller');

const router = new Router();

router.get('/page/:pageid', controller.page);
router.get('/search/:offset/:limit/:text', controller.search);
router.get('/search-person/:offset/:limit/:text', controller.searchPerson);

module.exports = router;
