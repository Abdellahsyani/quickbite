import express from "express";
import {config} from "dotenv";
import {connectDB, disconnectDB} from "./config/db.js"

config();
connectDB();

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Hello from my first patch of express");
});

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
