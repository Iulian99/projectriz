const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function debugDashboard() {
  try {
    // Găsește utilizatorul iulina neaga
    const users = await prisma.user.findMany();
    const user = users.find((u) =>
      u.identifier.toLowerCase().includes("neaga_iulian")
    );

    if (!user) {
      console.log("Utilizatorul neaga_iulian nu a fost găsit");
      return;
    }

    console.log("Utilizator găsit:", {
      id: user.id,
      identifier: user.identifier,
      name: user.name,
    });

    // Verifică activitățile din octombrie 2025
    const activities = await prisma.activity.findMany({
      where: {
        userId: user.id,
        date: {
          gte: new Date("2025-10-01T00:00:00.000Z"),
          lte: new Date("2025-10-31T23:59:59.999Z"),
        },
      },
      orderBy: { date: "desc" },
    });

    console.log("\nActivități din octombrie 2025:", activities.length);
    activities.forEach((activity, index) => {
      const dateStr = activity.date.toISOString().split("T")[0];
      console.log(
        `${index + 1}. ${dateStr} - ${activity.activity} - ${activity.status}`
      );
    });

    // Verifică zilele distincte în octombrie
    const distinctDates = [
      ...new Set(activities.map((a) => a.date.toISOString().split("T")[0])),
    ];
    console.log(
      "\nZile distincte cu activități în octombrie:",
      distinctDates.length
    );
    distinctDates.forEach((date) => {
      console.log(`- ${date}`);
    });

    // Calculează zilele lucrătoare în octombrie 2025
    let workingDays = 0;
    for (let day = 1; day <= 31; day++) {
      const date = new Date(2025, 9, day); // 9 = octombrie (0-indexed)
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // Nu weekend
        workingDays++;
      }
    }

    console.log("\nZile lucrătoare în octombrie 2025:", workingDays);
    console.log(
      "Progres calculat:",
      Math.round((distinctDates.length / workingDays) * 100) + "%"
    );
  } catch (error) {
    console.error("Eroare:", error);
  } finally {
    await prisma.$disconnect();
  }
}

debugDashboard();
