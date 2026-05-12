import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    text: { type: String, trim: true, maxlength: 200 },
    image: { type: String },

    seenAt: { type: Date, default: null },
  },
  { timestamps: true },
);

messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ receiverId: 1, senderId: 1 });

messageSchema.index({ receiverId: 1, seenAt: 1 });

export default mongoose.model("Message", messageSchema);
