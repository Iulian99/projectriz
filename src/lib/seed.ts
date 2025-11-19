import { PrismaClient } from "@/generated/prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const userPassword = await bcrypt.hash("user123", 10);

  await prisma.user.upsert({
    where: { identifier: "admin" },
    update: {},
    create: {
      identifier: "admin",
      email: "admin@example.com",
      password: adminPassword,
      name: "Administrator",
      role: "admin",
      department: "Management",
    },
  });

  await prisma.user.upsert({
    where: { identifier: "john_doe" },
    update: {},
    create: {
      identifier: "john_doe",
      email: "john@example.com",
      password: userPassword,
      name: "John Doe",
      role: "user",
      department: "Sales",
    },
  });

  console.log("✅ Useri de test creați cu succes!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
