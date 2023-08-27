const ConversationModel = require('../models/ConversationModel');
const MessageModel = require('../models/MessageModel');
const UserModel = require('../models/UserModel');
const mongoose = require('mongoose');

const sendMessage = async (req, res) => {
  try {
    const recipientId = req.params.id;
    const { content, userId } = req.body;

    const recipient = await UserModel.findById(recipientId);

    if (!recipient) {
      throw new Error('Recipient not found');
    }

    let conversation = await ConversationModel.findOne({
      recipients: {
        $all: [userId, recipientId],
      },
    });

    if (!conversation) {
      conversation = await ConversationModel.create({
        recipients: [userId, recipientId],
      });
    }

    await MessageModel.create({
      conversation: conversation._id,
      sender: userId,
      content,
    });

    conversation.lastMessageAt = Date.now();

    conversation.save();

    return res.json({ success: true });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const conversationId = req.params.id;

    const conversation = await ConversationModel.findById(conversationId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const messages = await MessageModel.find({
      conversation: conversation._id,
    })
      .populate('sender', '-password')
      .sort('-createdAt')
      .limit(12);

    return res.json(messages);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err.message });
  }
};

const getConversations = async (req, res) => {
  try {
    const { userId } = req.body;

    const conversations = await ConversationModel.find({
      recipients: {
        $in: [userId],
      },
    })
      .populate('recipients', '-password')
      .sort('-updatedAt')
      .lean();

    for (let i = 0; i < conversations.length; i++) {
      const conversation = conversations[i];
      for (let j = 0; j < 2; j++) {
        if (conversation.recipients[j]._id != userId) {
          conversation.recipient = conversation.recipients[j];
        }
      }
    }

    return res.json(conversations);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err.message });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  getConversations,
};
