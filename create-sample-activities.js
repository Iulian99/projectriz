const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createSampleActivities() {
  try {
    console.log("🎯 Creând activități de test pentru membrii echipei...");

    // Obține utilizatorii care au manageri (nu sunt administratori)
    const teamMembers = await prisma.user.findMany({
      where: {
        managerId: { not: null },
      },
      select: {
        id: true,
        name: true,
        identifier: true,
        manager: {
          select: {
            name: true,
          },
        },
      },
    });

    console.log(
      `📋 Găsiți ${teamMembers.length} membri de echipă pentru care vor fi create activități:\n`
    );

    // Activități de exemplu
    const sampleActivities = [
      {
        activity:
          "ROF 11.1.1 - Analizeaza, proiecteaza, programeaza, testeaza, implementeaza aplicatii specifice trezoreriei statului",
        work: "Trezor - Dezvoltare modul contabilitate",
        baseAct: "OMFP 1234/2025",
        attributes:
          "1. Participa ca personal proiectant la dezvoltarea aplicatiilor informatice",
        timeSpent: 480, // 8 ore
        status: "Completat",
      },
      {
        activity:
          "ROF 11.1.2 - Realizeaza si intretine componenta de servicii informatice pentru trezoreria statului",
        work: "Trezor - Mentenanta baze de date",
        baseAct: "Din oficiu",
        attributes: "19. Acorda asistenta tehnica pentru tratarea incidentelor",
        timeSpent: 240, // 4 ore
        status: "In Progres",
      },
      {
        activity:
          "ROF 11.1.3 - Actualizeaza aplicatiile dezvoltate cu modificarile legislative/procedurale",
        work: "ForexeNomen - Actualizare validari",
        baseAct: "Adresa MF 5678/2025",
        attributes:
          "15. Actualizeaza aplicatiile dezvoltate cu modificarile legislative",
        timeSpent: 360, // 6 ore
        status: "Completat",
      },
      {
        activity:
          "ROF 11.5.1 - Evalueaza cerintele, analizeaza, proiecteaza pentru TREZOR",
        work: "Trezor - Analiza cerinте noi",
        baseAct: "Nota 9999/2025",
        attributes:
          "5. Desfasoara activitati de analiza pentru definirea specificatiilor",
        timeSpent: 180, // 3 ore
        status: "In Asteptare",
      },
    ];

    let totalActivities = 0;

    for (const member of teamMembers) {
      console.log(
        `👤 Creând activități pentru: ${member.name} (Manager: ${member.manager?.name})`
      );

      // Creează 3-5 activități pentru fiecare membru în ultimele 10 zile
      const numActivities = 3 + Math.floor(Math.random() * 3); // 3-5 activități

      for (let i = 0; i < numActivities; i++) {
        const randomActivity =
          sampleActivities[Math.floor(Math.random() * sampleActivities.length)];

        // Generează o dată din ultimele 10 zile
        const daysAgo = Math.floor(Math.random() * 10);
        const activityDate = new Date();
        activityDate.setDate(activityDate.getDate() - daysAgo);

        await prisma.activity.create({
          data: {
            userId: member.id,
            date: activityDate,
            activity: randomActivity.activity,
            work: randomActivity.work,
            baseAct: randomActivity.baseAct,
            attributes: randomActivity.attributes,
            timeSpent:
              randomActivity.timeSpent + Math.floor(Math.random() * 120) - 60, // ±1 oră variație
            status: randomActivity.status,
            observations: `Activitate creată automat pentru testare - ${new Date().toLocaleDateString(
              "ro-RO"
            )}`,
          },
        });

        totalActivities++;
      }

      console.log(`  ✅ ${numActivities} activități create`);
    }

    console.log(
      `\n🎉 Total: ${totalActivities} activități create pentru toți membrii echipei!`
    );
    console.log(
      "\n📊 Acum puteți testa funcționalitatea de export Excel în pagina Team Reports"
    );
  } catch (error) {
    console.error("❌ Eroare la crearea activităților:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleActivities();
