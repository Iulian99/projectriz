const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function showTeamStructure() {
  try {
    console.log("👥 Structura echipelor din baza de date:\n");

    // Obține toți administratorii
    const admins = await prisma.user.findMany({
      where: { role: "admin" },
      include: {
        subordinates: {
          include: {
            subordinates: true, // Pentru a vedea și subordonații de nivel 2
          },
        },
      },
    });

    for (const admin of admins) {
      console.log(`👑 ${admin.name} (${admin.identifier})`);
      console.log(`   Departament: ${admin.department}`);
      console.log(`   Poziție: ${admin.position}`);
      console.log(`   Echipa: ${admin.subordinates.length} membri\n`);

      for (const subordinate of admin.subordinates) {
        const roleIcon = subordinate.role === "manager" ? "👨‍💼" : "👤";
        console.log(
          `   ${roleIcon} ${subordinate.name} (${subordinate.identifier})`
        );
        console.log(`      Poziție: ${subordinate.position}`);

        if (subordinate.subordinates.length > 0) {
          console.log(
            `      Sub-echipa: ${subordinate.subordinates.length} membri`
          );
          for (const subSubordinate of subordinate.subordinates) {
            console.log(
              `        👤 ${subSubordinate.name} (${subSubordinate.identifier})`
            );
          }
        }
        console.log("");
      }
      console.log("─".repeat(60) + "\n");
    }

    // Statistici generale
    const totalUsers = await prisma.user.count();
    const adminCount = await prisma.user.count({ where: { role: "admin" } });
    const managerCount = await prisma.user.count({
      where: { role: "manager" },
    });
    const userCount = await prisma.user.count({ where: { role: "user" } });

    console.log("📊 Statistici:");
    console.log(`Total utilizatori: ${totalUsers}`);
    console.log(`Administratori: ${adminCount}`);
    console.log(`Manageri: ${managerCount}`);
    console.log(`Utilizatori: ${userCount}`);
  } catch (error) {
    console.error("❌ Eroare:", error);
  } finally {
    await prisma.$disconnect();
  }
}

showTeamStructure();
