const router = require('express').Router();
const auth = require('../middleware/auth');
const userControllers = require('../controllers/userControllers');

router.get('/search', auth, userControllers.searchUser);

router.get('/user/:id', auth, userControllers.getUser);

router.patch('/user', auth, userControllers.updateUser);

router.patch('/user/:id/follow', auth, userControllers.follow);
router.patch('/user/:id/unfollow', auth, userControllers.unfollow);

router.get('/suggestionsUser', auth, userControllers.suggestionsUser);

module.exports = router;
