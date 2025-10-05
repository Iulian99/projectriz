const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkUser() {
  try {
    // Găsește utilizatorul iulina neaga
    const users = await prisma.user.findMany();
    const user = users.find(
      (u) =>
        u.identifier.toLowerCase().includes("iulina") ||
        u.name.toLowerCase().includes("iulina") ||
        u.name.toLowerCase().includes("neaga")
    );

    if (!user) {
      console.log("Utilizatorul iulina neaga nu a fost găsit");
      return;
    }

    console.log("Utilizator găsit:", {
      id: user.id,
      identifier: user.identifier,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    // Verifică activitățile acestui utilizator
    const activities = await prisma.activity.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    console.log("\nActivități găsite:", activities.length);
    activities.forEach((activity, index) => {
      console.log(
        `${index + 1}. ${activity.activity} - ${activity.date} - Status: ${
          activity.status
        }`
      );
    });

    // Verifică zilele distincte cu activități
    const distinctDays = await prisma.activity.groupBy({
      by: ["date"],
      where: { userId: user.id },
      _count: { id: true },
    });

    console.log("\nZile distincte cu activități:", distinctDays.length);
    distinctDays.forEach((day) => {
      console.log(`- ${day.date}: ${day._count.id} activități`);
    });

    // Verifică toate utilizatorii pentru comparație
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        identifier: true,
        name: true,
        _count: {
          select: { activities: true },
        },
      },
    });

    console.log("\nToți utilizatorii:");
    allUsers.forEach((u) => {
      console.log(
        `- ${u.identifier} (${u.name}): ${u._count.activities} activități`
      );
    });
  } catch (error) {
    console.error("Eroare:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
