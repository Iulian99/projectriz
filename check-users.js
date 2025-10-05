const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function checkAndCreateUsers() {
  try {
    console.log("Verificând utilizatorii existenți...");

    // Verifică utilizatorii existenți
    const users = await prisma.user.findMany();
    console.log("Utilizatori găsiți:", users.length);

    users.forEach((user) => {
      console.log(`- ${user.identifier} (${user.email}) - Role: ${user.role}`);
    });

    // Dacă nu există utilizatori, îi creez
    if (users.length === 0) {
      console.log("\nCreez utilizatori de test...");

      // Admin user
      const adminPassword = await bcrypt.hash("admin123", 10);
      const admin = await prisma.user.create({
        data: {
          identifier: "admin",
          email: "admin@example.com",
          password: adminPassword,
          name: "Administrator",
          role: "admin",
        },
      });
      console.log("✓ Admin creat:", admin.identifier);

      // Test user
      const userPassword = await bcrypt.hash("user123", 10);
      const user = await prisma.user.create({
        data: {
          identifier: "john_doe",
          email: "john@example.com",
          password: userPassword,
          name: "John Doe",
          role: "user",
          department: "IT",
        },
      });
      console.log("✓ User creat:", user.identifier);

      // Test user 2
      const testPassword = await bcrypt.hash("test123", 10);
      const testUser = await prisma.user.create({
        data: {
          identifier: "test",
          email: "test@example.com",
          password: testPassword,
          name: "Test User",
          role: "user",
        },
      });
      console.log("✓ Test user creat:", testUser.identifier);
    }

    console.log("\n=== CONTURI DISPONIBILE ===");
    console.log("Admin: admin / admin123");
    console.log("User: john_doe / user123");
    console.log("Test: test / test123");
  } catch (error) {
    console.error("Eroare:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndCreateUsers();
