import { Router } from "express";
import {
  createMenuItem,
  getMenuItems,
  getMenuItembyId,
  updateMenuItem,
  deleteMenuitem,
} from "../controllers/menuController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";

const router = Router();

// Public routes (no token required)
router.get("/", getMenuItems);
router.get("/:id", getMenuItembyId);

// admin-only routes (token + admin role required)
router.post("/", authenticateToken, authorizeRole("admin"), createMenuItem);
router.put("/:id", authenticateToken, authorizeRole("admin"), updateMenuItem);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole("admin"),
  deleteMenuitem,
);

export default router;
