import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await hash("admin123", 10);
  await prisma.user.create({
    data: {
      identifier: "admin",
      email: "admin@example.com",
      password: adminPassword,
      name: "Administrator",
      role: "admin",
      badge: "001",
      position: "Administrator Sistem",
      employeeCode: "ADM001",
      unit: "Departament IT",
      phone: "+40 123 456 789",
      department: "IT",
      status: "active",
    },
  });

  // Create test user
  const userPassword = await hash("user123", 10);
  await prisma.user.create({
    data: {
      identifier: "john_doe",
      email: "john@example.com",
      password: userPassword,
      name: "John Doe",
      role: "user",
      department: "IT",
      badge: "7848",
      position: "Specialist IT",
      employeeCode: "18123781",
      unit: "SACPCA",
      phone: "+40 123 456 790",
      status: "active",
    },
  });

  // Create another user with more complete profile
  const user2Password = await hash("user123", 10);
  await prisma.user.create({
    data: {
      identifier: "neaga_iulian",
      email: "iulian.neaga@example.com",
      password: user2Password,
      name: "Neaga Iulian Costin",
      role: "user",
      department: "SACPCA",
      badge: "7848",
      position: "Specialist IT",
      employeeCode: "18123781",
      unit: "SACPCA",
      phone: "+40 123 456 791",
      address: "Strada Exemplu, nr. 123, București",
      status: "active",
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
