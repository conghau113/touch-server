const router = require('express').Router();
const auth = require('../middleware/auth');
const adminControllers = require('../controllers/adminControllers');

router.get('/get_total_users', auth, adminControllers.getTotalUsers);
router.get('/get_total_posts', auth, adminControllers.getTotalPosts);
router.get('/get_total_comments', auth, adminControllers.getTotalComments);
router.get('/get_total_likes', auth, adminControllers.getTotalLikes);
router.get('/get_total_spam_posts', auth, adminControllers.getTotalSpamPosts);
router.get('/get_spam_posts', auth, adminControllers.getSpamPosts);
router.delete('/delete_spam_posts/:id', auth, adminControllers.deleteSpamPost);

module.exports = router;
