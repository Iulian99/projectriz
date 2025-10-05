const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createActivityForLoggedUser() {
  try {
    console.log("=== Creez activitate pentru utilizatorul logat (ID: 28) ===");

    const userId = 28; // admin_director - utilizatorul curent logat
    const today = new Date("2025-10-04T16:00:00.000Z");

    // Să verific mai întâi dacă există activități pentru astăzi
    const existingActivities = await prisma.activity.findMany({
      where: {
        userId: userId,
        date: {
          gte: new Date("2025-10-04T00:00:00.000Z"),
          lt: new Date("2025-10-05T00:00:00.000Z"),
        },
      },
    });

    console.log(
      `📊 Activități existente pentru userId ${userId} pe 2025-10-04: ${existingActivities.length}`
    );

    if (existingActivities.length > 0) {
      console.log("📄 Activități existente:");
      existingActivities.forEach((act, index) => {
        console.log(
          `${index + 1}. ${act.activity} - ${act.timeSpent || 0} min`
        );
      });
    }

    const activity = await prisma.activity.create({
      data: {
        activity: "Test UI - Verificare afișare listă activități",
        work: "Frontend - Debug interfață utilizator",
        status: "Completat",
        userId: userId,
        date: today,
        timeSpent: 90,
        baseAct: "ROF Test UI",
        attributes: "Frontend, Testing, UI/UX, Debugging",
        complexity: "medium",
        observations:
          "Test pentru verificarea problemei cu afișarea activităților după adăugare",
      },
    });

    console.log(`✅ Activitate nouă creată cu ID: ${activity.id}`);
    console.log(`📅 Data: ${activity.date.toISOString()}`);
    console.log(`📝 Activitate: ${activity.activity}`);
    console.log(`⏱️ Timp: ${activity.timeSpent} minute`);

    // Verific din nou câte activități sunt acum
    const updatedActivities = await prisma.activity.findMany({
      where: {
        userId: userId,
        date: {
          gte: new Date("2025-10-04T00:00:00.000Z"),
          lt: new Date("2025-10-05T00:00:00.000Z"),
        },
      },
    });

    console.log(
      `📊 Total activități pentru userId ${userId} pe 2025-10-04: ${updatedActivities.length}`
    );
  } catch (error) {
    console.error("❌ Eroare:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createActivityForLoggedUser();
