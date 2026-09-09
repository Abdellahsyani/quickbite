import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { getProfile, updateProfile } from "../controllers/userController.js";

const router = Router();

router.get("/", authenticateToken, getProfile);
router.put("/", authenticateToken, updateProfile);

export default router;
