import { Router } from "express";
import {
  createMenuItem,
  getMenuItems,
  getMenuItembyId,
  updateMenuItem,
  deleteMenuitem,
} from "../controllers/menuController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";

const router = Router();

// Public routes (no token required)
router.get("/", getMenuItems);
router.get("/:id", getMenuItembyId);

// admin-only routes (token + admin role required)
router.post("/", authMiddleware, authorizeRole("admin"), createMenuItem);
router.put("/:id", authMiddleware, authorizeRole("admin"), updateMenuItem);
router.delete("/:id", authMiddleware, authorizeRole("admin"), deleteMenuitem);

export default router;
