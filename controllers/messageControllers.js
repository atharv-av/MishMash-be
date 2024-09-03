import { Conversation } from "../models/conversationModel.js";
import { Message } from "../models/messageModel.js";
import TryCatch from "../utils/errorHandler.js";

export const sendMessage = TryCatch(async (req, res) => {
  const senderId = req.id;
  const recieverId = req.params.id;
  const { message } = req.body;

  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, recieverId] },
  });

  if (!conversation) {
    await Conversation.create({
      participants: [senderId, recieverId],
    });
  }

  const newMessage = await Message.create({
    senderId,
    recieverId,
    message,
  });

  if (newMessage) {
    conversation.messages.push(newMessage._id);
  }

  await Promise.all([conversation.save(), newMessage.save()]);

  // TODO - Socket.io implementation

  res.status(201).json({
    success: true,
    newMessage,
  });
});

export const getMessage = TryCatch(async (req, res) => {
  const senderId = req.id;
  const recieverId = req.params.id;
  const conversation = await Conversation.findOne({
    participants: { $all: [senderId, recieverId] },
  }).populate("messages");

  if (!conversation) {
    return res.status(200).json({ success: true, messages: [] });
  }

  res.status(200).json({
    success: true,
    messages: conversation?.messages,
  });
});
