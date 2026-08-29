import { Router } from "express";
import {
  createMenuItem,
  getMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
} from "../controllers/menuController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";

const router = Router();

// Routes for "/" (GET all items, POST create item)
router
  .route("/")
  .get(getMenuItems)
  .post(authenticateToken, authorizeRole("admin"), createMenuItem);

// Routes for "/:id" (GET single item, PUT/PATCH update, DELETE remove)
router
  .route("/:id")
  .get(getMenuItemById)
  .put(authenticateToken, authorizeRole("admin"), updateMenuItem)
  .patch(authenticateToken, authorizeRole("admin"), updateMenuItem)
  .delete(authenticateToken, authorizeRole("admin"), deleteMenuItem);

export default router;
