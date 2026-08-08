import bcrypt from "bcryptjs";
import { prisma } from "../config/db.js";

export const register = async (req, res) => {
  try {
    const { email, name, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(404)
        .json({ message: "Please provide name, email, password" });
    }

    const existingUser = prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ messgae: "User already exists" });
    }
    const salt = await bcrypt.getSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select {
        id: true,
          name: true,
          email: true,
          role: true,
          ceatedAt: true,
      },
    });
    return res.status(201).json({message:"User registred successfully", user});
  } catch (error) {
    return res.status(500).json({message:"Server error", error: error.message});
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
};
