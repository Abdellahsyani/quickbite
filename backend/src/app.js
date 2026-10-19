import express from "express";
import { config } from "dotenv";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import jwt from "jsonwebtoken";
import { connectDB, prisma } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

config();
connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  },
});

app.set("io", io);

io.use(async (socket, next) => {
  try {
    const decoded = jwt.verify(
      socket.handshake.auth?.token,
      process.env.JWT_SECRET,
    );
    if (!Number.isInteger(decoded.id) || decoded.purpose) return next(new Error("Invalid token"));
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { isActive: true, role: true, restaurantId: true },
    });
    if (
      !user?.isActive ||
      !["admin", "staff"].includes(user.role) ||
      !user.restaurantId
    ) {
      return next(new Error("Access denied"));
    }
    socket.data.restaurantId = user.restaurantId;
    socket.data.userId = decoded.id;
    next();
  } catch {
    next(new Error("Invalid or expired token"));
  }
});

io.on("connection", (socket) => {
  console.log(`🟢 New KDS connected! Socket ID: ${socket.id}`);

  // Membership comes from the authenticated account, never a client-supplied ID.
  socket.join(`restaurant_${socket.data.restaurantId}`);
  socket.join(`user_${socket.data.userId}`);

  socket.on("disconnect", () => {
    console.log(`🔴 KDS disconnected! Socket ID: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/api/auth", authRoutes);
// app.use("/api/profile", userRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);

server.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});

export default app;
