const { Router } = require('restify-router');
const user = require('./api/user/router');
const mediawiki = require('./api/mediawiki/router');
const collection = require('./api/collection/router');
const feedback = require('./api/feedback/router');

const router = new Router();
router.add('/user', user);
router.add('/mediawiki', mediawiki);
router.add('/collection', collection);
router.add('/feedback', feedback);

module.exports = router;
