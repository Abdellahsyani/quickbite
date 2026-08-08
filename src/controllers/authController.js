import bcrypt from "bcryptjs";
import { prisma } from "../config/db.js";

export const register = async (req, res) => {
  const { email, name, password } = req.body;
}

export const login = async (req, res) => {
  const { email, password } = req.body;
}
