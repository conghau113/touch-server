const router = require('express').Router();
const auth = require('../middleware/auth');
const commentControllers = require('../controllers/commentControllers');

router.post('/comment', auth, commentControllers.createComment);

router.patch('/comment/:id', auth, commentControllers.updateComment);

router.patch('/comment/:id/like', auth, commentControllers.likeComment);
router.patch('/comment/:id/unlike', auth, commentControllers.unLikeComment);
router.delete('/comment/:id', auth, commentControllers.deleteComment);

module.exports = router;
