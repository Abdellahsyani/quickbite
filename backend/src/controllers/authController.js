import bcrypt from "bcryptjs";
import { prisma } from "../config/db.js";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    // Notice we removed 'role' from req.body and added 'token'
    const { email, name, password, token } = req.body;

    if (!name || !email || !password || !token) {
      return res.status(400).json({
        message: "Please provide name, email, password, and an invite token",
      });
    }

    // 1. SECURITY CHECK: Verify the invite token first
    const invite = await prisma.invite.findUnique({
      where: { token },
    });

    if (!invite || invite.isUsed) {
      return res
        .status(403)
        .json({ message: "Invalid or expired invite link." });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. CREATE USER: Force the role to "admin"
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "admin", // <-- Never trust req.body.role for public registration!
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // 3. BURN THE TOKEN: Ensure it can never be used again
    await prisma.invite.update({
      where: { token },
      data: { isUsed: true },
    });

    // 4. GENERATE PASSPORT: Log them in instantly
    const jwtToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" },
    );

    return res.status(201).json({
      message: "Admin registered successfully",
      token: jwtToken,
      user,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please Provide email and password" });
    }
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ messgae: "Invalid email or password" });
    }
    // generate token jwt
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" },
    );
    return res.status(200).json({
      message: "Login Successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
