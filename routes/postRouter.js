const router = require('express').Router();
const auth = require('../middleware/auth');
const postControllers = require('../controllers/postControllers');

router.route('/posts').post(auth, postControllers.createPost).get(auth, postControllers.getPosts);

router
  .route('/post/:id')
  .patch(auth, postControllers.updatePost)
  .get(auth, postControllers.getPost)
  .delete(auth, postControllers.deletePost);

router.patch('/post/:id/like', auth, postControllers.likePost);
router.patch('/post/:id/unlike', auth, postControllers.unLikePost);

router.patch('/post/:id/report', auth, postControllers.reportPost);

router.get('/user_posts/:id', auth, postControllers.getUserPosts);

router.get('/post_discover', auth, postControllers.getPostDiscover);

router.patch('/savePost/:id', auth, postControllers.savePost);
router.patch('/unSavePost/:id', auth, postControllers.unSavePost);
router.get('/getSavePosts', auth, postControllers.getSavePost);

module.exports = router;
