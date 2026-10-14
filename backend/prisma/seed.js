import { prisma } from "../src/config/db.js";
import bcrypt from "bcrypt";

// Deleted 'const prisma = new PrismaClient()' because you already imported it on line 1!

async function main() {
  console.log("🌱 Seeding database...");
  console.log("Bypassing API and injecting admin...");

  const hashedPassword = await bcrypt.hash("admin", 10);

  // Use upsert so you can run this script safely as many times as you want
  const admin = await prisma.user.upsert({
    where: { email: "abdellah@gmail.com" },
    update: {
      password: hashedPassword,
      role: "moderator",
    },
    create: {
      name: "abdellah",
      email: "abdellah@gmail.com",
      password: hashedPassword,
      role: "moderator",
    },
  });

  console.log("✅ Moderator account secured for:", admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
