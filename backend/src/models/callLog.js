import mongoose from "mongoose";

const callLogSchema = new mongoose.Schema(
  {
    callerId: {
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
    type: { type: String, enum: ["audio", "video"], required: true },
    status: {
      type: String,
      enum: ["completed", "missed", "rejected", "cancelled", "failed"],
      default: "missed",
    },
    startedAt: { type: Date, default: null },
    endedAt: { type: Date, default: null },
    duration: { type: Number, default: 0 },
  },
  { timestamps: true },
);

callLogSchema.index({ callerId: 1, createdAt: -1 });
callLogSchema.index({ receiverId: 1, createdAt: -1 });

export default mongoose.model("CallLog", callLogSchema);
