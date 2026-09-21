import { prisma } from "../src/config/db.js";
import bcrypt from "bcrypt";

// Deleted 'const prisma = new PrismaClient()' because you already imported it on line 1!

async function main() {
  console.log("Bypassing API and injecting admin...");

  const hashedPassword = await bcrypt.hash("admin123", 10);

  // Use upsert so you can run this script safely as many times as you want
  const admin = await prisma.user.upsert({
    where: { email: "abdo@gmail.com" },
    update: {
      password: hashedPassword,
      role: "admin",
    },
    create: {
      name: "abdo",
      email: "abdo@gmail.com",
      password: hashedPassword,
      role: "admin",
    },
  });

  console.log("✅ Admin account secured for:", admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
