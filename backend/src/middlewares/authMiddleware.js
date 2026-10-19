import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";

export const authenticateToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access denied. No token provided" });
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!Number.isInteger(decoded.id) || decoded.purpose) throw new Error("Invalid token");
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: true, restaurantId: true, isActive: true },
    });
    if (!user?.isActive) return res.status(401).json({ message: "Account is inactive or unavailable" });
    if (["admin", "staff"].includes(user.role) && !user.restaurantId) {
      return res.status(403).json({ message: "Account has no restaurant assigned" });
    }
    req.user = user;
    next();
  } catch {
    return res.status(500).json({ message: "Authentication unavailable" });
  }
};

export const optionalAuthenticateToken = (req, res, next) =>
  req.headers.authorization ? authenticateToken(req, res, next) : next();
