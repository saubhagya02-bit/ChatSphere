import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import { generateToken } from "../lib/utils.js";
import { ENV } from "../lib/env.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password)
      return res.status(400).json({ message: "All fields are required" });
    if (password.length < 6)
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ message: "Invalid email format" });
    if (await User.findOne({ email }))
      return res.status(400).json({ message: "Email already in use" });

    const hashedPassword = await bcrypt.hash(
      password,
      await bcrypt.genSalt(10),
    );
    const user = await new User({
      fullName,
      email,
      password: hashedPassword,
    }).save();

    generateToken(user._id, res);

    await sendWelcomeEmail(user.email, user.fullName, ENV.CLIENT_URL).catch(
      console.error,
    );

    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      blockedUsers: user.blockedUsers,
    });
  } catch (err) {
    console.error("signup:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ message: "Invalid credentials" });

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      blockedUsers: user.blockedUsers,
    });
  } catch (err) {
    console.error("login:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = (_, res) => {
  res.cookie("jwt", "", { maxAge: 0 });
  res.status(200).json({ message: "Logged out successfully" });
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    if (!profilePic)
      return res.status(400).json({ message: "Profile pic is required" });

    if (!/^data:image\/(png|jpeg|gif|webp);base64,/.test(profilePic))
      return res.status(400).json({ message: "Invalid image format" });

    const upload = await cloudinary.uploader.upload(profilePic);
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { profilePic: upload.secure_url },
      { new: true },
    ).select("-password");

    res.status(200).json(updated);
  } catch (err) {
    console.error("updateProfile:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const blockUser = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: targetId } = req.params;

    if (myId.equals(targetId))
      return res.status(400).json({ message: "You can't block yourself" });

    if (!(await User.exists({ _id: targetId })))
      return res.status(404).json({ message: "User not found" });

    const updated = await User.findByIdAndUpdate(
      myId,
      { $addToSet: { blockedUsers: targetId } },
      { new: true },
    ).select("-password");

    res.status(200).json(updated);
  } catch (err) {
    console.error("blockUser:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: targetId } = req.params;

    const updated = await User.findByIdAndUpdate(
      myId,
      { $pull: { blockedUsers: targetId } },
      { new: true },
    ).select("-password");

    res.status(200).json(updated);
  } catch (err) {
    console.error("unblockUser:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
