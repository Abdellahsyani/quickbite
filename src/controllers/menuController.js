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
