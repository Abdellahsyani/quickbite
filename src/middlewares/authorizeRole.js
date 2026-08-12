import { prisma } from "../config/db.js";

export const authorizeRole = (...allowedRole) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRole.includes(userRole)) {
      return res.status(403).json({
        message:
          "Access denied, you don't have permission to perform this action",
      });
    }
    next();
  };
};
