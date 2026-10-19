import { Router } from "express";
import {
  createMenuItem,
  getMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
} from "../controllers/menuController.js";
import { authenticateToken, optionalAuthenticateToken } from "../middlewares/authMiddleware.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";
import { upload } from "../middlewares/uploadMiddleware.js";

const router = Router();

// Routes for "/" (GET all items, POST create item)
router
  .route("/")
  .get(optionalAuthenticateToken, getMenuItems)
  .post(
    authenticateToken,
    authorizeRole("admin"),
    upload.single("image"),
    createMenuItem,
  );

// Routes for "/:id" (GET single item, PUT/PATCH update, DELETE remove)
router
  .route("/:id")
  .get(optionalAuthenticateToken, getMenuItemById)
  .put(authenticateToken, authorizeRole("admin"), upload.single("image"), updateMenuItem)
  .patch(authenticateToken, authorizeRole("admin"), upload.single("image"), updateMenuItem)
  .delete(authenticateToken, authorizeRole("admin"), deleteMenuItem);

export default router;
