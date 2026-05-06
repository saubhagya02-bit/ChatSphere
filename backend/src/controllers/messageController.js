import Message from "../models/message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getAllContacts = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select(
      "-password",
    );
    res.status(200).json(users);
  } catch (err) {
    console.error("getAllContacts:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id } = req.params;
    const msgs = await Message.find({
      $or: [
        { senderId: myId, receiverId: id },
        { senderId: id, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });
    res.status(200).json(msgs);
  } catch (err) {
    console.error("getMessagesByUserId:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!text && !image)
      return res.status(400).json({ message: "Text or image is required" });
    if (senderId.equals(receiverId))
      return res
        .status(400)
        .json({ message: "Cannot send message to yourself" });
    if (text && text.length > 200)
      return res
        .status(400)
        .json({ message: "Message exceeds 200 character limit" });
    if (!(await User.exists({ _id: receiverId })))
      return res.status(404).json({ message: "Receiver not found" });

    let imageUrl;
    if (image) {
      if (!/^data:image\/(png|jpeg|gif|webp);base64,/.test(image))
        return res.status(400).json({ message: "Invalid image format" });
      const upload = await cloudinary.uploader.upload(image);
      imageUrl = upload.secure_url;
    }

    const msg = await new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    }).save();

    const socketId = getReceiverSocketId(receiverId);
    if (socketId) io.to(socketId).emit("newMessage", msg);

    res.status(201).json(msg);
  } catch (err) {
    console.error("sendMessage:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getChatPartners = async (req, res) => {
  try {
    const myId = req.user._id;

    const [sentTo, receivedFrom] = await Promise.all([
      Message.distinct("receiverId", { senderId: myId }),
      Message.distinct("senderId", { receiverId: myId }),
    ]);

    const partnerIds = [...new Set([...sentTo, ...receivedFrom].map(String))];
    const partners = await User.find({ _id: { $in: partnerIds } }).select(
      "-password",
    );

    res.status(200).json(partners);
  } catch (err) {
    console.error("getChatPartners:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
