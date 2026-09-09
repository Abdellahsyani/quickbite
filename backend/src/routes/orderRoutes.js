import { Router } from "express";
import {
  createOrder,
  getMyOrder,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = Router();
router.use(authenticateToken);

router.post("/", createOrder);
router.get("/mine", getMyOrder);

router.get("/", authorizeRole("admin"), getAllOrders);
router.patch("/:id/status", authorizeRole("admin"), updateOrderStatus);

export default router;
