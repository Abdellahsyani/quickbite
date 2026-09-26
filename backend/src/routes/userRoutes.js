import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";
import { getMe } from "../controllers/userController.js";
import { createStaff, getStaff } from "../controllers/authController.js";
import { deactivateStaff } from "../controllers/userController.js";

const router = Router();

router.get("/me", authenticateToken, getMe);

router.post("/staff", authenticateToken, authorizeRole("admin"), createStaff);
router.get("/staff", authenticateToken, authorizeRole("admin"), getStaff);
router.patch(
  "/staff/:id/deactivate",
  authenticateToken,
  authorizeRole("admin"),
  deactivateStaff,
);

export default router;
