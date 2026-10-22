import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";

export const createOrder = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const { items, table, restaurantId } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Order must containe at least one item" });
    }
    if (!restaurantId) {
      return res
        .status(400)
        .json({ message: "Restaurant ID is required to place an order" });
    }
    const parsedRestaurantId = parseInt(restaurantId, 10);

    for (const item of items) {
      if (
        !item.quantity ||
        item.quantity <= 0 ||
        !Number.isInteger(item.quantity)
      ) {
        return res
          .status(400)
          .json({ message: "Each item must have a positive integer quantity" });
      }
    }

    const uniqueItemIds = [...new Set(items.map((item) => item.menuItemId))];
    const dbMenuItems = await prisma.menuItem.findMany({
      where: {
        id: {
          in: uniqueItemIds,
        },
        restaurantId: parsedRestaurantId,
        isDeleted: false,
      },
    });
    if (dbMenuItems.length !== uniqueItemIds.length) {
      return res
        .status(400)
        .json({ message: "One or more menu items do not exists" });
    }
    const unavailableItem = dbMenuItems.find((item) => !item.isAvailable);
    if (unavailableItem) {
      return res.status(400).json({
        message: `Item {$unavailableItem.name} is currently unvailable`,
      });
    }
    let totalPrice = 0;
    const orderItemsData = [];
    for (const item of items) {
      const menuItem = dbMenuItems.find((m) => m.id === item.menuItemId);
      const itemTotal = menuItem.price * item.quantity;
      totalPrice += itemTotal;

      orderItemsData.push({
        menuItemId: menuItem.id,
        quantity: item.quantity,
        price: menuItem.price,
      });
    }

    const newOrder = await prisma.order.create({
      data: {
        userId,
        table: table || "Takeout", // 2. SAVE the table
        totalPrice: parseFloat(totalPrice.toFixed(2)),
        restaurantId: parsedRestaurantId,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: { include: { menuItem: { select: { name: true } } } },
      },
    });
    const io = req.app.get("io");
    if (io) {
      io.to(`restaurant_${parsedRestaurantId}`).emit("new_order", newOrder);
    }

    return res.status(201).json({
      message: "Order placed successfully",
      order: newOrder,
      trackingToken: jwt.sign(
        {
          purpose: "order-tracking",
          orderId: newOrder.id,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
      ),
    });
  } catch (error) {
    console.log("BACK-END ERROR:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const getMyOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await prisma.order.findMany({
      where: {
        userId,
        restaurantId: req.user.restaurantId,
      },
      include: {
        items: {
          include: {
            menuItem: {
              select: {
                name: true,
                category: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json(orders);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const allOrders = await prisma.order.findMany({
      where: {
        restaurantId: req.user.restaurantId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        items: {
          include: {
            menuItem: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json(allOrders);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    const orderId = parseInt(id, 10);

    if (isNaN(orderId)) {
      return res.status(400).json({ message: "Invalid Order Id" });
    }
    if (
      status !== "PENDING" &&
      status !== "PREPARING" &&
      status !== "COMPLETED" &&
      status !== "CANCELLED"
    ) {
      return res.status(400).json({ message: "Not a valide status" });
    }
    const updateResult = await prisma.order.updateMany({
      where: {
        id: orderId,
        restaurantId: req.user.restaurantId,
      },
      data: {
        status,
      },
    });
    if (updateResult.count == 0) {
      return res
        .status(404)
        .json({ message: "Order not found or unauthorized" });
    }
    const updateOrder = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            menuItem: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
    const io = req.app.get("io");
    io?.to(`restaurant_${req.user.restaurantId}`).emit(
      "order_updated",
      updateOrder,
    );
    return res
      .status(200)
      .json({ message: "Status Updated successfully", order: updateOrder });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "order Not found" });
    }
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const clearOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const itemid = parseInt(id, 10);

    if (isNaN(itemid)) {
      return res.status(400).json({ message: "Invalid Order ID" });
    }
    const clearedItem = await prisma.order.updateMany({
      where: {
        id: itemid,
        restaurantId: req.user.restaurantId,
      },
      data: { status: "ARCHIVED" },
    });

    if (clearedItem.count == 0) {
      return res
        .status(404)
        .json({ message: "Order not found or unauthorized" });
    }
    req.app
      .get("io")
      ?.to(`restaurant_${req.user.restaurantId}`)
      .emit("order_updated", {
        id: itemid,
        status: "ARCHIVED",
      });
    return res
      .status(201)
      .json({ message: "Item delteted successfully", itemid: clearedItem });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "order Not found" });
    }
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const trackOrder = async (req, res) => {
  let claims;
  try {
    claims = jwt.verify(req.query.token, process.env.JWT_SECRET);
    if (
      claims.purpose !== "order-tracking" ||
      claims.orderId !== Number(req.params.id)
    )
      throw new Error("Invalid token");
  } catch {
    return res
      .status(401)
      .json({ message: "Invalid or expired tracking link" });
  }
  try {
    const order = await prisma.order.findUnique({
      where: { id: claims.orderId },
      select: {
        id: true,
        status: true,
        table: true,
        totalPrice: true,
        createdAt: true,
        items: {
          select: { quantity: true, menuItem: { select: { name: true } } },
        },
      },
    });
    if (!order) return res.status(404).json({ message: "Order not found" });
    return res.json(order);
  } catch {
    return res.status(500).json({ message: "Unable to fetch order" });
  }
};
