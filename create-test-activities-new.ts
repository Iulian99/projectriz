import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createTestActivities() {
  try {
    console.log("🔄 Creând activități de test...\n");

    // Activități pentru admin (ID: 1)
    await prisma.activity.create({
      data: {
        userId: 1,
        activity: "ROF 11.1.1 - Administrare sistem",
        work: "Administrare - Configurare servere",
        status: "Completat",
        baseAct: "ROF_11_1_1",
        complexity: "high",
        timeSpent: 120,
        observations:
          "Configurare completă servere pentru noile funcționalități",
      },
    });

    await prisma.activity.create({
      data: {
        userId: 1,
        activity: "ROF 11.2.1 - Backup și securitate",
        work: "Securitate - Implementare măsuri noi",
        status: "In Progres",
        baseAct: "ROF_11_2_1",
        complexity: "medium",
        timeSpent: 90,
        observations: "Implementare în curs pentru măsurile de securitate",
      },
    });

    // Activități pentru john_doe (ID: 2)
    await prisma.activity.create({
      data: {
        userId: 2,
        activity: "ROF 12.1.1 - Dezvoltare aplicații",
        work: "Frontend - Dezvoltare interfețe",
        status: "Completat",
        baseAct: "ROF_12_1_1",
        complexity: "medium",
        timeSpent: 180,
        observations: "Interfețe noi pentru modulul de raportare",
      },
    });

    await prisma.activity.create({
      data: {
        userId: 2,
        activity: "ROF 12.2.1 - Testing și QA",
        work: "Testing - Verificare funcționalități",
        status: "In Asteptare",
        baseAct: "ROF_12_2_1",
        complexity: "low",
        timeSpent: 60,
        observations: "Așteaptă confirmarea pentru începerea testelor",
      },
    });

    // Activități pentru neaga_iulian (ID: 3)
    await prisma.activity.create({
      data: {
        userId: 3,
        activity: "ROF 13.1.1 - Analiza cerințe",
        work: "Analiză - Documentație tehnică",
        status: "Completat",
        baseAct: "ROF_13_1_1",
        complexity: "medium",
        timeSpent: 150,
        observations: "Documentația tehnică pentru noile module",
      },
    });

    await prisma.activity.create({
      data: {
        userId: 3,
        activity: "ROF 13.2.1 - Implementare soluții",
        work: "Implementare - Module noi",
        status: "In Progres",
        baseAct: "ROF_13_2_1",
        complexity: "high",
        timeSpent: 200,
        observations: "Implementare module pentru gestionarea utilizatorilor",
      },
    });

    console.log("✅ Au fost create 6 activități de test!");

    // Verifică rezultatele
    const totalActivities = await prisma.activity.count();
    console.log(`📊 Total activități în baza de date: ${totalActivities}`);

    // Afișează activitățile pe utilizatori
    const users = await prisma.user.findMany({
      include: {
        activities: {
          select: {
            id: true,
            activity: true,
            status: true,
          },
        },
      },
    });

    console.log("\n📋 Activități per utilizator:");
    users.forEach((user) => {
      console.log(`\n👤 ${user.name} (${user.identifier}):`);
      if (user.activities.length === 0) {
        console.log("   - Nu are activități");
      } else {
        user.activities.forEach((activity) => {
          console.log(`   - ${activity.activity} [${activity.status}]`);
        });
      }
    });
  } catch (error) {
    console.error("❌ Eroare la crearea activităților:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestActivities();
