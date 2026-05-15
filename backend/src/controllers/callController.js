import callLog from "../models/callLog.js";
import User from "../models/User.js";

export const getCallHistory = async (req, res) => {
  try {
    const myId = req.user._id;

    const logs = await callLog
      .find({
        $or: [{ callerId: myId }, { receiverId: myId }],
      })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const peerIds = [
      ...new Set(
        logs.map((l) =>
          l.callerId.toString() === myId.toString()
            ? l.receiverId.toString()
            : l.callerId.toString(),
        ),
      ),
    ];

    const peers = await User.find({ _id: { $in: peerIds } })
      .select("fullName profilePic")
      .lean();

    const peerMap = Object.fromEntries(peers.map((p) => [p._id.toString(), p]));

    const result = logs.map((l) => {
      const isCaller = l.callerId.toString() === myId.toString();
      const peerId = isCaller ? l.receiverId.toString() : l.callerId.toString();
      return {
        _id: l._id,
        peer: peerMap[peerId] || { fullName: "Unknown", profilePic: "" },
        type: l.type,
        status: l.status,
        isCaller,
        duration: l.duration,
        createdAt: l.createdAt,
      };
    });
    res.status(200).json(result);
  } catch (err) {
    console.error("getCallHistory:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
