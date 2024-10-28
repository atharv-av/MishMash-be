import { Conversation } from "../models/conversationModel.js";
import { Message } from "../models/messageModel.js";
import TryCatch from "../utils/errorHandler.js";
import { getIO } from "../index.js";  // Import the getIO function

export const sendMessage = TryCatch(async (req, res) => {
  const senderId = req.id;
  const receiverId = req.params.id;
  const { message } = req.body;

  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, receiverId],
    });
  }

  const newMessage = await Message.create({
    senderId,
    receiverId,
    message,
  });

  if (newMessage) {
    conversation.messages.push(newMessage._id);
  }

  await Promise.all([conversation.save(), newMessage.save()]);

  // Emit socket event for real-time message delivery
  const io = getIO();
  io.emit("privateMessage", {
    senderId,
    receiverId,
    message: newMessage,
  });

  res.status(201).json({
    success: true,
    newMessage,
  });
});

export const getMessage = TryCatch(async (req, res) => {
  const senderId = req.id;
  const receiverId = req.params.id;
  
  const conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  }).populate("messages");

  if (!conversation) {
    return res.status(200).json({ success: true, messages: [] });
  }

  res.status(200).json({
    success: true,
    messages: conversation?.messages,
  });
});