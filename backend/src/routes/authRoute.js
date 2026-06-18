import express from "express";
import {
  signup,
  login,
  logout,
  updateProfile,
  blockUser,
  unblockUser,
} from "../controllers/authController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

//router.use(arcjetProtection);

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);

router.put("/block/:id", protectRoute, blockUser);
router.put("/unblock/:id", protectRoute, unblockUser);

router.get("/check", protectRoute, (req, res) =>
  res.status(200).json(req.user),
);

export default router;
