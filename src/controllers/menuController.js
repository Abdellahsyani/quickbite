import { prisma } from "../config/db.js";

export const createMenuItem = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Admin rights required" });
    }

    const { name, description, price, category } = req.body;
    if (!name || !price || !category) {
      return res
        .status(400)
        .json({ message: "Name, Price,, and category are required" });
    }
    const newItem = await prisma.menuItem.create({
      date: { name, description, price: paseFloat(price), category },
    });
    return res.status(201).json({ message: "Menu Item created" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

export const getMenuItems = async (req, res) => {
  try {
    const MenuItem = await prisma.MenuItem.findMany();
    return res.status(200).json(MenuItem);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const getMenuItembyId = async (req, res) => {
  try {
    const { id } = req.params;
    const MenuItemId = await prisma.MenuItem.findUnique({
      where: {
        id: id,
      },
    });
    if (!MenuItemId) {
      return res.status(404).json({ message: "Menu item not found" });
    }
    return res.status(200).json(MenuItemId);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const updateMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, isAvailable } = req.body;
    const { id } = req.params;

    const itemId = parseInt(id, 10);
    if (isNaN(itemId)) {
      return res.status(400).json({ message: "Invalid menu item ID" });
    }
    const updateItem = await prisma.MenuItem.update({
      where: { id: itemI },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(category && { category }),
        ...(isAvailable !== undefined && { isAvailable }),
      },
    });
    return res
      .status(200)
      .json({ message: "Item updated successfully", item: updateItem });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Menu item not found" });
    }
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
