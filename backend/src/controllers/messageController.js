import Message from "../models/message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import { escapeRegex } from "../lib/utils.js";

export const getAllContacts = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select(
      "-password",
    );
    const blockedSet = new Set(
      (req.user.blockedUsers || []).map((id) => id.toString()),
    );
    const withBlockStatus = users.map((u) => ({
      ...u.toObject(),
      isBlocked: blockedSet.has(u._id.toString()),
    }));
    res.status(200).json(withBlockStatus);
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

    const receiver = await User.findById(receiverId).select("blockedUsers");
    if (!receiver)
      return res.status(404).json({ message: "Receiver not found" });

    const iBlockedThem = (req.user.blockedUsers || []).some(
      (id) => id.toString() === receiverId,
    );
    if (iBlockedThem)
      return res.status(403).json({
        message: "You have blocked this user. Unblock them to send a message.",
      });

    const theyBlockedMe = (receiver.blockedUsers || []).some(
      (id) => id.toString() === senderId.toString(),
    );
    if (theyBlockedMe)
      return res
        .status(403)
        .json({ message: "You cannot send messages to this user" });

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

    const blockedSet = new Set(
      (req.user.blockedUsers || []).map((id) => id.toString()),
    );
    const withBlockStatus = partners.map((u) => ({
      ...u.toObject(),
      isBlocked: blockedSet.has(u._id.toString()),
    }));

    res.status(200).json(withBlockStatus);
  } catch (err) {
    console.error("getChatPartners:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const clearMessages = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: otherId } = req.params;

    await Message.deleteMany({
      $or: [
        { senderId: myId, receiverId: otherId },
        { senderId: otherId, receiverId: myId },
      ],
    });

    res.status(200).json({ message: "Chat cleared" });
  } catch (err) {
    console.error("clearMessages:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const blockUser = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: targetId } = req.params;

    if (myId.equals(targetId))
      return res.status(400).json({ message: "You cannot block yourself" });
    if (!(await User.exists({ _id: targetId })))
      return res.status(404).json({ message: "User not found" });

    await User.findByIdAndUpdate(myId, {
      $addToSet: { blockedUsers: targetId },
    });
    res.status(200).json({ message: "User blocked", blockedUserId: targetId });
  } catch (err) {
    console.error("blockUser:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: targetId } = req.params;

    await User.findByIdAndUpdate(myId, { $pull: { blockedUsers: targetId } });
    res
      .status(200)
      .json({ message: "User unblocked", unblockedUserId: targetId });
  } catch (err) {
    console.error("unblockUser:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const SEARCH_MIN_LENGTH = 2;
const SEARCH_MAX_LENGTH = 100;
const SEARCH_RESULT_LIMIT = 30;

export const searchMessages = async (req, res) => {
  try {
    const myId = req.user._id.toString();
    const q = String(req.query.q || "").trim();

    if (q.length < SEARCH_MIN_LENGTH)
      return res
        .status(400)
        .json({
          message: `Search term must be at least ${SEARCH_MIN_LENGTH} characters`,
        });
    if (q.length > SEARCH_MAX_LENGTH)
      return res.status(400).json({ message: "Search term is too long" });

    const msgs = await Message.find({
      $or: [{ senderId: req.user._id }, { receiverId: req.user._id }],
      text: new RegExp(escapeRegex(q), "i"),
    })
      .sort({ createdAt: -1 })
      .limit(SEARCH_RESULT_LIMIT)
      .lean();

    const peerIdOf = (m) =>
      m.senderId.toString() === myId
        ? m.receiverId.toString()
        : m.senderId.toString();

    const peerIds = [...new Set(msgs.map(peerIdOf))];
    const peers = await User.find({ _id: { $in: peerIds } })
      .select("fullName profilePic")
      .lean();
    const peerMap = Object.fromEntries(peers.map((p) => [p._id.toString(), p]));

    const results = msgs.map((m) => ({
      _id: m._id,
      text: m.text,
      createdAt: m.createdAt,
      isMine: m.senderId.toString() === myId,
      peer: peerMap[peerIdOf(m)] || {
        _id: peerIdOf(m),
        fullName: "Unknown",
        profilePic: "",
      },
    }));

    res.status(200).json(results);
  } catch (err) {
    console.error("searchMessages:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
