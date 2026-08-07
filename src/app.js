import express from "express";
import { config } from "dotenv";
import { connectDB, disconnectDB } from "./config/db.js";
import { authRoutes } from "./routes/authRoutes.js";

config();
connectDB();

const app = express();
const PORT = 3000;

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Hello from my first patch of express");
});

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
