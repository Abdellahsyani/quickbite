import express from "express";
import { config } from "dotenv";
import { connectDB, disconnectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

config();
connectDB();

const app = express();
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/profile", userRoutes);
// app.use("/api/orders", orderRoutes);
// app.use("/api/users", userRoutes);

export default app;
