const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testActivitiesAPI() {
  try {
    console.log("=== Test API Activități ===");

    // Găsim un utilizator pentru test
    const user = await prisma.user.findFirst({
      where: {
        identifier: "neaga_iulian",
      },
    });

    if (!user) {
      console.log("❌ Nu s-a găsit utilizatorul de test");
      return;
    }

    console.log(`📝 Utilizator test: ${user.name} (ID: ${user.id})`);

    // Testăm GET pentru data curentă (4 octombrie 2025)
    const today = "2025-10-04";
    console.log(`\n🔍 Căutăm activități pentru ${today}...`);

    const activitiesForToday = await prisma.activity.findMany({
      where: {
        userId: user.id,
        date: {
          gte: new Date(today + "T00:00:00.000Z"),
          lt: new Date("2025-10-05T00:00:00.000Z"),
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    console.log(
      `📊 Găsite ${activitiesForToday.length} activități pentru ${today}`
    );

    if (activitiesForToday.length > 0) {
      activitiesForToday.forEach((activity, index) => {
        console.log(
          `${index + 1}. ${activity.activity} - ${activity.work} (Time: ${
            activity.timeSpent || 0
          } min)`
        );
      });
    }

    // Testăm crearea unei activități noi pentru astăzi
    console.log(`\n➕ Creăm o activitate nouă pentru ${today}...`);

    const newActivity = await prisma.activity.create({
      data: {
        activity: "Test - Verificare funcționalitate",
        work: "Test - Debugging aplicație",
        status: "Completat",
        userId: user.id,
        date: new Date(today + "T10:00:00.000Z"),
        timeSpent: 60,
        baseAct: "ROF Test",
        attributes: "Testare, Debugging",
        complexity: "medium",
        observations: "Activitate de test pentru verificare bug",
      },
    });

    console.log(`✅ Activitate creată cu succes! ID: ${newActivity.id}`);

    // Verificăm din nou activitățile pentru astăzi
    console.log(`\n🔍 Verificăm din nou activitățile pentru ${today}...`);

    const activitiesAfterCreate = await prisma.activity.findMany({
      where: {
        userId: user.id,
        date: {
          gte: new Date(today + "T00:00:00.000Z"),
          lt: new Date("2025-10-05T00:00:00.000Z"),
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    console.log(
      `📊 Acum sunt ${activitiesAfterCreate.length} activități pentru ${today}`
    );

    if (activitiesAfterCreate.length > 0) {
      activitiesAfterCreate.forEach((activity, index) => {
        console.log(
          `${index + 1}. ${activity.activity} - ${activity.work} (Time: ${
            activity.timeSpent || 0
          } min)`
        );
      });
    }

    console.log("\n✅ Test complet!");
  } catch (error) {
    console.error("❌ Eroare în test:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testActivitiesAPI();
