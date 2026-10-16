import bcrypt from "bcrypt";
import { prisma } from "../config/db.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export const generateInviteLink = async (req, res) => {
  try {
    const token = crypto.randomBytes(16).toString("hex");

    await prisma.invite.create({
      data: {
        token: token,
        isUsed: false,
      },
    });
    const inviteUrl = `http://localhost:5173/register?token=${token}`;
    return res.status(201).json({ inviteUrl });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

function hasInvalidNameChars(txt) {
  // [^ ... ] means "Find anything that is NOT inside these brackets"
  // \p{L} allows any letter from any language
  // \s allows spaces
  // \- allows hyphens (for names like Jean-Luc)
  // The 'u' at the end enables Unicode support for \p{L}
  const regex = /[^\p{L}\s\-]/u;

  // This will return TRUE if the name contains numbers or special characters
  return regex.test(txt);
}

export const createStaff = async (req, res) => {
  try {
    const { name, email, password, position } = req.body;

    if (!name || !email || !password || !position) {
      return res
        .status(400)
        .json({ message: "Please provide name, email, and password." });
    }
    if (password.length < 4) {
      return res
        .status(400)
        .json({ message: "Password must be at least 4 characters long" });
    }
    if (hasInvalidNameChars(name)) {
      return res.status(400).json({
        message: "Name can only contain letters, spaces, and hyphens.",
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Force the role to "member" regardless of what the frontend sends
    const staff = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        position,
        isActive: true,
        role: "staff",
        restaurantId: req.user.restaurantId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        position: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return res
      .status(201)
      .json({ message: "Chef account created successfully!", staff });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Optional: A function to get the list of current staff
export const getStaff = async (req, res) => {
  try {
    const staff = await prisma.user.findMany({
      where: { role: "staff", isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        position: true,
        isActive: true,
        createdAt: true,
      },
    });
    return res.status(200).json(staff);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

function isStrongPassword(password) {
  // Regex Breakdown:
  // (?=.*[a-z])   -> At least one lowercase letter
  // (?=.*[A-Z])   -> At least one uppercase letter
  // (?=.*\d)      -> At least one number
  // (?=.*[\W_])   -> At least one special character (e.g., !@#$%^&*)
  // .{8,}         -> Minimum 8 characters total
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return regex.test(password);
}

export const register = async (req, res) => {
  try {
    // Notice we removed 'role' from req.body and added 'token'
    const { email, name, password, token } = req.body;

    if (!name || !email || !password || !token) {
      return res.status(400).json({
        message: "Please provide name, email, password, and an invite token",
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message:
          "password must be at least 8 characters long and include uppercase letter, a lowercase letter, a number, and a special character",
      });
    }

    if (hasInvalidNameChars(name)) {
      return res.status(400).json({
        message: "Name can only contain letters, spaces, and hyphens.",
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
        restaurant: {
          create: {
            name: name,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        restaurantId: true,
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
      { id: user.id, role: user.role, restaurantId: user.restaurantId },
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
    if (user && user.isActive === false) {
      return res
        .status(400)
        .json({ message: "This account has been deactivated" });
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
