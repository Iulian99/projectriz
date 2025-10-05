const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testHourlyProgress() {
  console.log("=== TEST PROGRES LUNAR BAZAT PE ORE ===");

  try {
    // Găsește utilizatorul neaga_iulian
    const user = await prisma.user.findFirst({
      where: {
        identifier: "neaga_iulian",
      },
    });

    if (!user) {
      console.log("❌ Utilizator neaga_iulian nu a fost găsit");
      return;
    }

    console.log("👤 Utilizator găsit:", user.name, user.identifier);

    // Găsește toate activitățile pentru octombrie 2025
    const activities = await prisma.activity.findMany({
      where: {
        userId: user.id,
        date: {
          gte: new Date("2025-10-01"),
          lt: new Date("2025-11-01"),
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    console.log(`📊 ACTIVITĂȚI OCTOMBRIE 2025: ${activities.length} total`);

    // Calculează total ore lucrate
    let totalHoursWorked = 0;
    const hoursByDay = {};

    activities.forEach((activity, index) => {
      const activityDate = new Date(activity.date);
      const dayKey = activityDate.toISOString().split("T")[0];

      let timeSpent = activity.timeSpent || 0;

      // Validare
      if (timeSpent > 24) timeSpent = 24;
      if (timeSpent < 0) timeSpent = 0;

      totalHoursWorked += timeSpent;

      if (!hoursByDay[dayKey]) {
        hoursByDay[dayKey] = 0;
      }
      hoursByDay[dayKey] += timeSpent;

      console.log(`${index + 1}. ACTIVITATE ID: ${activity.id}`);
      console.log(`   📅 Data: ${activity.date} (${dayKey})`);
      console.log(`   📝 Activitate: ${activity.activity}`);
      console.log(`   ⏱️  Timp: ${timeSpent}h`);
      console.log(`   ✅ Status: ${activity.status}`);
      console.log("");
    });

    console.log("=== CALCULE PROGRES LUNAR ===");

    // Calculează zilele lucrătoare în octombrie 2025
    function getWorkingDaysInMonth(year, month) {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      let workingDays = 0;

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          workingDays++;
        }
      }

      return workingDays;
    }

    // Calculează orele totale programate pentru octombrie 2025
    function getTotalMonthlyHours(year, month) {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      let totalHours = 0;

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay();

        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          totalHours += dayOfWeek === 5 ? 6 : 8; // Vineri 6h, restul 8h
        }
      }

      return totalHours;
    }

    const totalWorkingDays = getWorkingDaysInMonth(2025, 9); // Octombrie = luna 9
    const totalMonthlyHours = getTotalMonthlyHours(2025, 9);

    console.log(`📊 Zile lucrătoare în octombrie 2025: ${totalWorkingDays}`);
    console.log(`⏰ Ore programate total: ${totalMonthlyHours}h`);
    console.log(`💼 Ore lucrate total: ${totalHoursWorked}h`);

    const hourlyProgress =
      totalMonthlyHours > 0
        ? Math.round((totalHoursWorked / totalMonthlyHours) * 100)
        : 0;

    console.log(`📈 PROGRES LUNAR (bazat pe ore): ${hourlyProgress}%`);

    console.log("\n=== DETALII PE ZILE ===");
    Object.entries(hoursByDay).forEach(([day, hours]) => {
      console.log(`📅 ${day}: ${hours}h`);
    });

    const uniqueDays = Object.keys(hoursByDay).length;
    console.log(
      `\n🎯 Zile cu activități: ${uniqueDays} din ${totalWorkingDays} zile lucrătoare`
    );
  } catch (error) {
    console.error("❌ Eroare:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testHourlyProgress();
