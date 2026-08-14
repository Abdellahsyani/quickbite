import { prisma, OrderStatus } from "../config/db.js";

export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Order must containe at least one item" });
    }

    const itemIds = items.map((item) => item.menuItemId);
    const dbMenuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: itemIds },
      },
    });
    if (dbMenuItems.length !== itemIds.length) {
      return res
        .status(400)
        .json({ message: "One or more menu items do not exists" });
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
        totalPrice: parseFloat(totalPrice.toFixed(2)),
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
      },
    });
    return res
      .status(201)
      .json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const getMyOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await prisma.orders.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            menuItem: { select: { name: true, category: true } },
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
    const allOrders = await prisma.orders.findMany({
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
    const { state } = req.body;
    const { id } = req.params;
    const orderId = parseInt(id, 10);

    if (isNaN(orderId)) {
      return res.status(400).json({ message: "Invalid Order Id" });
    }
    if (
      state !== "PENDING" &&
      state !== "PREPARING" &&
      state !== "COMPLETED" &&
      state !== "CANCELLED"
    ) {
      return res.status(400).json({ message: "Not a valide status" });
    }
    const updateOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
      },
    });
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
