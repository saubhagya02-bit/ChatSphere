import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ENV } from "../lib/env.js";

export const socketAuthMiddleware = async (socket, next) => {
  try {
    const cookies = socket.handshake.headers.cookie || "";

    const token = cookies
      .split(";")
      .map(c => c.trim())
      .find(c => c.startsWith("jwt="))
      ?.split("=")[1];

    if (!token || token === "undefined") {
      console.log("Socket rejected: No token");
      return next(new Error("Unauthorized - No Token Provided"));
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      console.log("Socket rejected: User not found");
      return next(new Error("User not found"));
    }

    socket.user = user;
    socket.userId = user._id.toString();

    console.log(`Socket authenticated: ${user.fullName}`);

    next();
  } catch (error) {
    console.log("Socket auth error:", error.message);
    next(new Error("Unauthorized - Authentication failed"));
  }
};