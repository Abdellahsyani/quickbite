import { Router } from "express";
import {
  register,
  login,
  getRestaurant,
  generateInviteLink,
} from "../controllers/authController.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/restaurant", authenticateToken, authorizeRole("admin", "staff"), getRestaurant);
router.post(
  "/generate-invite",
  authenticateToken,
  authorizeRole("moderator"),
  generateInviteLink,
);

export default router;
