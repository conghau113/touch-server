const router = require('express').Router();
const authControllers = require('../controllers/authControllers');
const auth = require('../middleware/auth');

router.post('/register', authControllers.register);
router.post('/register_admin', authControllers.registerAdmin);
router.post('/changePassword', auth, authControllers.changePassword);

router.post('/login', authControllers.login);
router.post('/admin_login', authControllers.adminLogin);

router.post('/logout', authControllers.logout);

router.post('/refresh_token', authControllers.generateAccessToken);

module.exports = router;
