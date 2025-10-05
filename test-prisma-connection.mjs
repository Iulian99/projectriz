import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testPrismaConnection() {
  try {
    console.log("🧪 Testare conexiune Prisma cu Supabase...");

    // Test conexiune
    await prisma.$connect();
    console.log("✅ Prisma conectat la Supabase!");

    // Test count users
    const userCount = await prisma.user.count();
    console.log(`📊 Numărul de utilizatori: ${userCount}`);

    // Test count activities
    const activityCount = await prisma.activity.count();
    console.log(`📊 Numărul de activități: ${activityCount}`);

    console.log("🎉 Prisma funcționează perfect cu Supabase!");
  } catch (error) {
    console.error("❌ Eroare Prisma:", error.message);

    if (error.message.includes("P1001")) {
      console.log("💡 Sugestie: Verifică DATABASE_URL în .env");
    }
  } finally {
    await prisma.$disconnect();
  }
}

testPrismaConnection();
