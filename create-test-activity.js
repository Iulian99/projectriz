const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createTestActivity() {
  try {
    console.log("=== Creez activitate de test pentru astăzi ===");

    const userId = 31; // Neaga Iulian
    const today = new Date("2025-10-04T14:30:00.000Z");

    const activity = await prisma.activity.create({
      data: {
        activity: "Test frontend - Verificare afișare",
        work: "Frontend - Test lista activități",
        status: "Completat",
        userId: userId,
        date: today,
        timeSpent: 75,
        baseAct: "ROF Frontend",
        attributes: "Frontend, Testing, UI",
        complexity: "medium",
        observations:
          "Test pentru verificarea problemei cu afișarea activităților în frontend",
      },
    });

    console.log(`✅ Activitate creată cu ID: ${activity.id}`);
    console.log(`📅 Data: ${activity.date}`);
    console.log(`📝 Activitate: ${activity.activity}`);
    console.log(`⏱️ Timp: ${activity.timeSpent} minute`);
  } catch (error) {
    console.error("❌ Eroare:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestActivity();
