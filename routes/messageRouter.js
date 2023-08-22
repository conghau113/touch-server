const router = require('express').Router();
const auth = require('../middleware/auth');
const messageControllers = require('../controllers/messageControllers');

router.post('/message', auth, messageControllers.createMessage);

router.get('/conversations', auth, messageControllers.getConversations);

router.get('/message/:id', auth, messageControllers.getMessages);

module.exports = router;
