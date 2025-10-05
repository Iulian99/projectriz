import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log("🔍 Verificând utilizatorii din baza de date...\n");

    const users = await prisma.user.findMany({
      select: {
        id: true,
        identifier: true,
        email: true,
        name: true,
        role: true,
        department: true,
        status: true,
      },
    });

    if (users.length === 0) {
      console.log("❌ Nu există utilizatori în baza de date!");
    } else {
      console.log(`✅ Găsiți ${users.length} utilizatori:\n`);

      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name}`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Identifier: ${user.identifier}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Rol: ${user.role}`);
        console.log(`   Departament: ${user.department || "N/A"}`);
        console.log(`   Status: ${user.status}\n`);
      });
    }

    // Verifică și activitățile
    const activitiesCount = await prisma.activity.count();
    console.log(`📊 Total activități: ${activitiesCount}\n`);
  } catch (error) {
    console.error("❌ Eroare la verificarea utilizatorilor:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
