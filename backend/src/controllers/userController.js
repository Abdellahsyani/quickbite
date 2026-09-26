import { prisma } from "../config/db.js";

// Route: GET /auth/me
export const getMe = async (req, res) => {
  try {
    // req.user.id comes from authenticateToken middleware
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const deactivateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const staffId = parseInt(id, 10);

    if (isNaN(staffId)) {
      return res.status(400).json({ message: "Invalid Id format" });
    }

    const updateUser = await prisma.user.update({
      where: { id: staffId },
      data: { isActivate: false },
    });
    return (
      res,
      status(200).json({
        message: "Staff member deactivate successfully",
        user: updateUser,
      })
    );
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Staff member not found" });
    }
    return res
      .status(500)
      .json({ message: "server error:", error: error.message });
  }
};
