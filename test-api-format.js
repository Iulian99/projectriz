const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testAPIFormat() {
  try {
    console.log("=== Test Format API ===");

    const userId = 31; // Neaga Iulian
    const date = "2025-10-04";

    // Simulez logica din API
    const selectedDate = new Date(date);
    const nextDay = new Date(selectedDate);
    nextDay.setDate(selectedDate.getDate() + 1);

    const activities = await prisma.activity.findMany({
      where: {
        userId: userId,
        date: {
          gte: selectedDate,
          lt: nextDay,
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
      orderBy: {
        date: "desc",
      },
    });

    console.log(`📊 Găsite ${activities.length} activități raw din Prisma`);

    // Formatez exact ca în API
    const formattedActivities = activities.map((activity) => {
      return {
        id: activity.id,
        date: activity.date.toISOString().split("T")[0],
        displayDate: activity.date.toLocaleDateString("ro-RO"),
        employee: `${activity.user.name} [${activity.user.identifier}]`,
        activity: activity.activity,
        work: activity.work,
        status: activity.status,
        userId: activity.userId,
        timeSpent: activity.timeSpent || 0,
        createdAt: activity.createdAt.toISOString(),
        updatedAt: activity.updatedAt.toISOString(),
        baseAct: activity.baseAct || "",
        attributes: activity.attributes || "",
        complexity: activity.complexity || "",
        observations: activity.observations || "",
      };
    });

    console.log("\n📄 Activități formatate pentru frontend:");
    formattedActivities.forEach((activity, index) => {
      console.log(`${index + 1}. ${activity.activity}`);
      console.log(`   Work: ${activity.work}`);
      console.log(`   Date: ${activity.date}`);
      console.log(`   TimeSpent: ${activity.timeSpent}`);
      console.log(`   CreatedAt: ${activity.createdAt}`);
      console.log(`   UserId: ${activity.userId}`);
      console.log("");
    });
  } catch (error) {
    console.error("❌ Eroare:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testAPIFormat();
