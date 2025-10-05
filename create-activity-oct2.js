const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createActivityForOct2() {
  try {
    console.log("=== Creez activitate pentru 2 octombrie 2025 ===");

    const userId = 28; // admin_director - utilizatorul curent logat
    const oct2Date = new Date("2025-10-02T15:30:00.000Z");

    const activity = await prisma.activity.create({
      data: {
        activity: "TEST FIX - Activitate pentru 2 octombrie",
        work: "TEST - Verificare afișare pe pagina corectă",
        status: "Completat",
        userId: userId,
        date: oct2Date,
        timeSpent: 120,
        baseAct: "ROF Test Fix",
        attributes: "Test, Fix, Debugging",
        complexity: "medium",
        observations:
          "Activitate de test pentru verificarea fix-ului de afișare pe pagina de 2 octombrie",
      },
    });

    console.log(`✅ Activitate creată cu ID: ${activity.id}`);
    console.log(`📅 Data: ${activity.date.toISOString()}`);
    console.log(`📝 Activitate: ${activity.activity}`);
    console.log(`⏱️ Timp: ${activity.timeSpent} minute`);

    // Verific total activități pentru 2 octombrie
    const totalOct2 = await prisma.activity.findMany({
      where: {
        userId: userId,
        date: {
          gte: new Date("2025-10-02T00:00:00.000Z"),
          lt: new Date("2025-10-03T00:00:00.000Z"),
        },
      },
    });

    console.log(`📊 Total activități pentru 2 octombrie: ${totalOct2.length}`);
  } catch (error) {
    console.error("❌ Eroare:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createActivityForOct2();
