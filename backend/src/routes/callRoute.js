import express from "express";
import { getCallHistory } from "../controllers/callController.js";
import { protectRoute } from "../middleware/authMiddleware.js";
import { arcjetProtection } from "../middleware/arcjetMiddleware.js";

const router = express.Router();

router.use(arcjetProtection, protectRoute);

router.get("/history", getCallHistory);

export default router;
