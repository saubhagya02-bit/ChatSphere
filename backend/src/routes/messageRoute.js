import express from "express";
import {
  getAllContacts,
  getMessagesByUserId,
  sendMessage,
  getChatPartners,
  clearMessages,
  blockUser,
  unblockUser,
} from "../controllers/messageController.js";
import { protectRoute } from "../middleware/authMiddleware.js";
import { arcjetProtection } from "../middleware/arcjetMiddleware.js";

const router = express.Router();

router.use(arcjetProtection, protectRoute);

router.get("/contacts", getAllContacts);
router.get("/chats", getChatPartners);
router.put("/block/:id", blockUser);
router.put("/unblock/:id", unblockUser);
router.delete("/clear/:id", clearMessages);
router.get("/:id", getMessagesByUserId);
router.post("/send/:id", sendMessage);

export default router;
