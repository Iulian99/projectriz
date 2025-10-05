const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function debugActivities() {
  try {
    // Găsește utilizatorul neaga_iulian
    const user = await prisma.user.findFirst({
      where: { identifier: "neaga_iulian" },
    });

    if (!user) {
      console.log("Utilizatorul neaga_iulian nu a fost găsit");
      return;
    }

    console.log("=== ANALIZA ACTIVITĂȚI PENTRU NEAGA IULIAN ===\n");

    // Verifică activitățile din octombrie 2025
    const activities = await prisma.activity.findMany({
      where: {
        userId: user.id,
        date: {
          gte: new Date("2025-10-01T00:00:00.000Z"),
          lte: new Date("2025-10-31T23:59:59.999Z"),
        },
      },
      orderBy: { date: "asc" },
    });

    console.log(`📊 ACTIVITĂȚI OCTOMBRIE 2025: ${activities.length} total\n`);

    activities.forEach((activity, index) => {
      const dateField = new Date(activity.date);
      const createdAtField = new Date(activity.createdAt);

      console.log(`${index + 1}. ACTIVITATE ID: ${activity.id}`);
      console.log(
        `   📅 activity.date: ${dateField.toISOString()} (${dateField.toLocaleDateString(
          "ro-RO"
        )})`
      );
      console.log(
        `   🕐 activity.createdAt: ${createdAtField.toISOString()} (${createdAtField.toLocaleDateString(
          "ro-RO"
        )})`
      );
      console.log(`   📝 activity.activity: ${activity.activity}`);
      console.log(`   📋 activity.work: ${activity.work}`);
      console.log(`   ⏱️  activity.timeSpent: ${activity.timeSpent || 0} min`);
      console.log(`   ✅ activity.status: ${activity.status}`);
      console.log("");
    });

    // Calculează zile distincte pe ambele câmpuri
    const datesFromDateField = [
      ...new Set(activities.map((a) => a.date.toISOString().split("T")[0])),
    ];
    const datesFromCreatedAt = [
      ...new Set(
        activities.map((a) => a.createdAt.toISOString().split("T")[0])
      ),
    ];

    console.log("=== ANALIZA ZILE DISTINCTE ===\n");
    console.log(
      "📅 Zile distincte din activity.date:",
      datesFromDateField.length
    );
    datesFromDateField.forEach((date) => {
      const activitiesCount = activities.filter(
        (a) => a.date.toISOString().split("T")[0] === date
      ).length;
      console.log(`   - ${date}: ${activitiesCount} activități`);
    });

    console.log(
      "\n🕐 Zile distincte din activity.createdAt:",
      datesFromCreatedAt.length
    );
    datesFromCreatedAt.forEach((date) => {
      const activitiesCount = activities.filter(
        (a) => a.createdAt.toISOString().split("T")[0] === date
      ).length;
      console.log(`   - ${date}: ${activitiesCount} activități`);
    });

    console.log("\n=== SIMULARE CALCULE ===\n");
    console.log(
      "🎯 Dashboard ar calcula:",
      datesFromDateField.length,
      "zile (folosește activity.date)"
    );
    console.log(
      "📅 Calendar ar calcula:",
      datesFromCreatedAt.length,
      "zile (folosește activity.createdAt)"
    );
  } catch (error) {
    console.error("Eroare:", error);
  } finally {
    await prisma.$disconnect();
  }
}

debugActivities();
