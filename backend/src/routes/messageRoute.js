import express from "express";
import { 
  getAllContacts,
  getMessagesByUserId,
  sendMessage,
  getChatPartners
} from "../controllers/messageController.js";

import { protectRoute } from "../middleware/authMiddleware.js";
import { arcjetProtection } from "../middleware/arcjetMiddleware.js";

const router = express.Router();

router.use(arcjetProtection, protectRoute);

router.get("/contacts", protectRoute, getAllContacts);
router.get("/chats", protectRoute, getChatPartners);
router.get("/:id",  protectRoute, getMessagesByUserId);
router.post("/send/:id",  protectRoute, sendMessage);

export default router;