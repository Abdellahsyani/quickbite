import { Router } from "express";
import {
  createOrder,
  getMyOrder,
  getAllOrders,
  updateOrderStatus,
  clearOrder,
} from "../controllers/orderController.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = Router();
router.use(authenticateToken);

router.post("/", createOrder);
router.get("/mine", getMyOrder);

router.get("/", authorizeRole("admin", "stuff"), getAllOrders);
router.patch("/:id/status", authorizeRole("admin", "stuff"), updateOrderStatus);
router.delete("/:id", authorizeRole("admin", "stuff"), clearOrder);

export default router;
