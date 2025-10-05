import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log("=== Verificare baza de date ===");

    // Verifică utilizatorii
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        identifier: true,
        _count: {
          select: {
            activities: true,
          },
        },
      },
    });

    console.log("\n--- Utilizatori ---");
    users.forEach((user) => {
      console.log(
        `ID: ${user.id}, Nume: ${user.name}, Identifier: ${user.identifier}, Activități: ${user._count.activities}`
      );
    });

    // Verifică activitățile
    const activities = await prisma.activity.findMany({
      include: {
        user: {
          select: {
            name: true,
            identifier: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
      take: 20,
    });

    console.log("\n--- Ultimele 20 Activități ---");
    activities.forEach((activity) => {
      console.log(
        `ID: ${activity.id}, Data: ${
          activity.date.toISOString().split("T")[0]
        }, Status: ${activity.status}, User: ${activity.user.name} (${
          activity.userId
        })`
      );
    });

    // Verifică activitățile din octombrie 2025
    const octoberActivities = await prisma.activity.findMany({
      where: {
        date: {
          gte: new Date("2025-10-01"),
          lt: new Date("2025-11-01"),
        },
      },
      include: {
        user: {
          select: {
            name: true,
            identifier: true,
          },
        },
      },
    });

    console.log("\n--- Activități din Octombrie 2025 ---");
    console.log(`Total: ${octoberActivities.length} activități`);
    octoberActivities.forEach((activity) => {
      console.log(
        `Ziua: ${activity.date.getDate()}, Status: ${activity.status}, User: ${
          activity.user.name
        }`
      );
    });
  } catch (error) {
    console.error("Eroare:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
