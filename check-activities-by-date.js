const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkActivitiesByDate() {
  try {
    console.log("=== Verificare activități pe zile ===");

    const userId = 28; // admin_director - utilizatorul curent logat

    // Verifică activități pentru 2 octombrie
    const oct2 = await prisma.activity.findMany({
      where: {
        userId: userId,
        date: {
          gte: new Date("2025-10-02T00:00:00.000Z"),
          lt: new Date("2025-10-03T00:00:00.000Z"),
        },
      },
    });

    // Verifică activități pentru 3 octombrie
    const oct3 = await prisma.activity.findMany({
      where: {
        userId: userId,
        date: {
          gte: new Date("2025-10-03T00:00:00.000Z"),
          lt: new Date("2025-10-04T00:00:00.000Z"),
        },
      },
    });

    // Verifică activități pentru 4 octombrie
    const oct4 = await prisma.activity.findMany({
      where: {
        userId: userId,
        date: {
          gte: new Date("2025-10-04T00:00:00.000Z"),
          lt: new Date("2025-10-05T00:00:00.000Z"),
        },
      },
    });

    console.log(`📅 2 Octombrie 2025: ${oct2.length} activități`);
    oct2.forEach((act, index) => {
      console.log(
        `   ${index + 1}. ${act.activity} (${act.date.toISOString()})`
      );
    });

    console.log(`📅 3 Octombrie 2025: ${oct3.length} activități`);
    oct3.forEach((act, index) => {
      console.log(
        `   ${index + 1}. ${act.activity} (${act.date.toISOString()})`
      );
    });

    console.log(`📅 4 Octombrie 2025: ${oct4.length} activități`);
    oct4.forEach((act, index) => {
      console.log(
        `   ${index + 1}. ${act.activity} (${act.date.toISOString()})`
      );
    });
  } catch (error) {
    console.error("❌ Eroare:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkActivitiesByDate();
