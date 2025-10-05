const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createTestActivities() {
  try {
    console.log("Creez activități de test...");

    // Găsesc utilizatorii existenți
    const users = await prisma.user.findMany();
    console.log(
      "Utilizatori găsiți:",
      users.map((u) => `${u.name} (${u.identifier})`)
    );

    if (users.length === 0) {
      console.log("Nu există utilizatori în baza de date!");
      return;
    }

    const admin = users.find((u) => u.identifier === "admin");
    const user = users.find((u) => u.identifier === "john_doe");

    const activitiesData = [
      {
        activity: "ROF 11.1.1 - Analiza aplicatii TREZOR",
        work: "Trezor - Baze de date",
        status: "In Progres",
        userId: admin ? admin.id : users[0].id,
        date: new Date("2025-09-19"),
      },
      {
        activity: "ROF 11.5.1 - Implementare ForexeSNM",
        work: "ForexeSNM - asistenta tehnica",
        status: "Completat",
        userId: admin ? admin.id : users[0].id,
        date: new Date("2025-09-18"),
      },
      {
        activity: "ROF 11.2.7 - Asistenta tehnica",
        work: "Mentenanta sistem informatic Forexebug",
        status: "Completat",
        userId: admin ? admin.id : users[0].id,
        date: new Date("2025-09-17"),
      },
    ];

    if (user) {
      activitiesData.push(
        {
          activity: "ROF 12.1.1 - Dezvoltare aplicatie web",
          work: "Frontend React - Componente UI",
          status: "In Progres",
          userId: user.id,
          date: new Date("2025-09-19"),
        },
        {
          activity: "ROF 12.2.1 - Testing aplicatie",
          work: "Unit tests pentru servicii backend",
          status: "Completat",
          userId: user.id,
          date: new Date("2025-09-18"),
        }
      );
    }

    for (const activityData of activitiesData) {
      const activity = await prisma.activity.create({
        data: activityData,
      });
      console.log(`✓ Activitate creată: ${activity.activity}`);
    }

    console.log("\n=== Activități create cu succes! ===");
  } catch (error) {
    console.error("Eroare:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestActivities();
