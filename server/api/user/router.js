const { Router } = require('restify-router');
const controller = require('./controller');
const { AuthUser, IsOwner } = require('../../services/auth');

const router = new Router();

router.get('/:userid', AuthUser(), IsOwner, controller.user);
router.post('', controller.create);
router.put('', AuthUser(), IsOwner, controller.update);
router.post('/login', controller.login);
router.post('/confirm', controller.confirm);
router.post('/recoverpass', controller.recoverPassword);
router.post('/resetpass', controller.resetPassword);

module.exports = router;
