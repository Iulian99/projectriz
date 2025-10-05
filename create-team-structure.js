const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function createTeamStructure() {
  try {
    console.log("🏗️  Creând structura echipelor...");

    // Hash-ul parolei "admin123"
    const hashedPassword = await bcrypt.hash("admin123", 12);

    // Șterge utilizatorii existenți pentru a avea o structură curată
    await prisma.activity.deleteMany({});
    await prisma.user.deleteMany({});

    console.log("🧹 Baza de date curățată...");

    // Creează 3 administratori
    const administrators = [
      {
        identifier: "admin_director",
        email: "director@example.com",
        name: "Popescu Gabriel - Director",
        role: "admin",
        department: "SACPCA - Direcție",
        position: "Director Departament",
        employeeCode: "DIR001",
        unit: "Conducere",
        phone: "+40721123456",
        address: "București, Sector 1",
        status: "active",
      },
      {
        identifier: "admin_sef_serviciu",
        email: "sef.serviciu@example.com",
        name: "Ionescu Maria - Șef Serviciu",
        role: "admin",
        department: "SACPCA - Serviciul IT",
        position: "Șef Serviciu IT",
        employeeCode: "SIT001",
        unit: "Serviciul IT",
        phone: "+40721234567",
        address: "București, Sector 2",
        status: "active",
      },
      {
        identifier: "admin_coordonator",
        email: "coordonator@example.com",
        name: "Dumitrescu Andrei - Coordonator",
        role: "admin",
        department: "SACPCA - Dezvoltare",
        position: "Coordonator Dezvoltare",
        employeeCode: "DEV001",
        unit: "Dezvoltare Software",
        phone: "+40721345678",
        address: "București, Sector 3",
        status: "active",
      },
    ];

    console.log("👨‍💼 Creând administratorii...");
    const createdAdmins = [];

    for (const admin of administrators) {
      const createdAdmin = await prisma.user.create({
        data: {
          ...admin,
          password: hashedPassword,
          birthDate: new Date("1980-01-01"),
          hireDate: new Date("2020-01-01"),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      createdAdmins.push(createdAdmin);
      console.log(`  ✅ ${createdAdmin.name} (${createdAdmin.identifier})`);
    }

    // Creează echipele pentru fiecare administrator
    const teams = [
      // Echipa Directorului
      [
        {
          identifier: "neaga_iulian",
          email: "iulian.neaga@example.com",
          name: "Neaga Iulian Costin",
          role: "manager",
          department: "SACPCA - Direcție",
          position: "Manager Proiect Senior",
          employeeCode: "18123781",
          unit: "Management Proiecte",
          phone: "+40721111111",
          address: "București, Sector 1",
          managerId: createdAdmins[0].id,
        },
        {
          identifier: "vasile_ana",
          email: "ana.vasile@example.com",
          name: "Vasile Ana Maria",
          role: "user",
          department: "SACPCA - Direcție",
          position: "Analist Business",
          employeeCode: "AN001",
          unit: "Analiză Business",
          phone: "+40721111112",
          address: "București, Sector 1",
          managerId: createdAdmins[0].id,
        },
        {
          identifier: "radulescu_mihai",
          email: "mihai.radulescu@example.com",
          name: "Rădulescu Mihai Alexandru",
          role: "user",
          department: "SACPCA - Direcție",
          position: "Specialist Calitate",
          employeeCode: "QA001",
          unit: "Asigurarea Calității",
          phone: "+40721111113",
          address: "București, Sector 1",
          managerId: createdAdmins[0].id,
        },
        {
          identifier: "constantinescu_elena",
          email: "elena.constantinescu@example.com",
          name: "Constantinescu Elena",
          role: "user",
          department: "SACPCA - Direcție",
          position: "Consultant Senior",
          employeeCode: "CS001",
          unit: "Consultanță",
          phone: "+40721111114",
          address: "București, Sector 1",
          managerId: createdAdmins[0].id,
        },
        {
          identifier: "munteanu_robert",
          email: "robert.munteanu@example.com",
          name: "Munteanu Robert",
          role: "user",
          department: "SACPCA - Direcție",
          position: "Specialist Tehnic",
          employeeCode: "ST001",
          unit: "Suport Tehnic",
          phone: "+40721111115",
          address: "București, Sector 1",
          managerId: createdAdmins[0].id,
        },
      ],
      // Echipa Șefului de Serviciu IT
      [
        {
          identifier: "popescu_dan",
          email: "dan.popescu@example.com",
          name: "Popescu Dan Cristian",
          role: "manager",
          department: "SACPCA - Serviciul IT",
          position: "Team Lead Backend",
          employeeCode: "TLB001",
          unit: "Dezvoltare Backend",
          phone: "+40721222221",
          address: "București, Sector 2",
          managerId: createdAdmins[1].id,
        },
        {
          identifier: "georgescu_laura",
          email: "laura.georgescu@example.com",
          name: "Georgescu Laura",
          role: "user",
          department: "SACPCA - Serviciul IT",
          position: "Developer Backend",
          employeeCode: "DB001",
          unit: "Dezvoltare Backend",
          phone: "+40721222222",
          address: "București, Sector 2",
          managerId: createdAdmins[1].id,
        },
        {
          identifier: "stanescu_alexandru",
          email: "alexandru.stanescu@example.com",
          name: "Stănescu Alexandru",
          role: "user",
          department: "SACPCA - Serviciul IT",
          position: "Database Administrator",
          employeeCode: "DBA001",
          unit: "Administrare Baze de Date",
          phone: "+40721222223",
          address: "București, Sector 2",
          managerId: createdAdmins[1].id,
        },
        {
          identifier: "marinescu_diana",
          email: "diana.marinescu@example.com",
          name: "Marinescu Diana",
          role: "user",
          department: "SACPCA - Serviciul IT",
          position: "System Administrator",
          employeeCode: "SA001",
          unit: "Administrare Sistem",
          phone: "+40721222224",
          address: "București, Sector 2",
          managerId: createdAdmins[1].id,
        },
      ],
      // Echipa Coordonatorului Dezvoltare
      [
        {
          identifier: "pavel_cristina",
          email: "cristina.pavel@example.com",
          name: "Pavel Cristina",
          role: "manager",
          department: "SACPCA - Dezvoltare",
          position: "Team Lead Frontend",
          employeeCode: "TLF001",
          unit: "Dezvoltare Frontend",
          phone: "+40721333331",
          address: "București, Sector 3",
          managerId: createdAdmins[2].id,
        },
        {
          identifier: "tudor_vlad",
          email: "vlad.tudor@example.com",
          name: "Tudor Vlad",
          role: "user",
          department: "SACPCA - Dezvoltare",
          position: "Frontend Developer",
          employeeCode: "FD001",
          unit: "Dezvoltare Frontend",
          phone: "+40721333332",
          address: "București, Sector 3",
          managerId: createdAdmins[2].id,
        },
        {
          identifier: "stoica_andreea",
          email: "andreea.stoica@example.com",
          name: "Stoica Andreea",
          role: "user",
          department: "SACPCA - Dezvoltare",
          position: "UX/UI Designer",
          employeeCode: "UX001",
          unit: "Design UX/UI",
          phone: "+40721333333",
          address: "București, Sector 3",
          managerId: createdAdmins[2].id,
        },
        {
          identifier: "ilie_gabriel",
          email: "gabriel.ilie@example.com",
          name: "Ilie Gabriel",
          role: "user",
          department: "SACPCA - Dezvoltare",
          position: "QA Tester",
          employeeCode: "QT001",
          unit: "Testare Software",
          phone: "+40721333334",
          address: "București, Sector 3",
          managerId: createdAdmins[2].id,
        },
        {
          identifier: "barbu_alexandra",
          email: "alexandra.barbu@example.com",
          name: "Barbu Alexandra",
          role: "user",
          department: "SACPCA - Dezvoltare",
          position: "DevOps Engineer",
          employeeCode: "DO001",
          unit: "DevOps",
          phone: "+40721333335",
          address: "București, Sector 3",
          managerId: createdAdmins[2].id,
        },
      ],
    ];

    console.log("\n👥 Creând echipele...");
    let totalMembers = 0;

    for (let i = 0; i < teams.length; i++) {
      const team = teams[i];
      const admin = createdAdmins[i];

      console.log(`\n  📋 Echipa lui ${admin.name}:`);

      for (const member of team) {
        const createdMember = await prisma.user.create({
          data: {
            ...member,
            password: hashedPassword,
            birthDate: new Date(
              1985 + Math.floor(Math.random() * 15),
              Math.floor(Math.random() * 12),
              Math.floor(Math.random() * 28) + 1
            ),
            hireDate: new Date(
              2018 + Math.floor(Math.random() * 6),
              Math.floor(Math.random() * 12),
              Math.floor(Math.random() * 28) + 1
            ),
            status: "active",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        console.log(
          `    ✅ ${createdMember.name} (${createdMember.identifier}) - ${createdMember.position}`
        );
        totalMembers++;
      }
    }

    // Afișează statisticile finale
    const totalUsers = await prisma.user.count();
    const admins = await prisma.user.count({ where: { role: "admin" } });
    const managers = await prisma.user.count({ where: { role: "manager" } });
    const users = await prisma.user.count({ where: { role: "user" } });

    console.log("\n📊 Statistici finale:");
    console.log(`  🏢 Total utilizatori: ${totalUsers}`);
    console.log(`  👑 Administratori: ${admins}`);
    console.log(`  👨‍💼 Manageri: ${managers}`);
    console.log(`  👤 Utilizatori: ${users}`);

    console.log("\n🔐 Toate conturile au parola: admin123");

    console.log("\n👨‍💼 Administratori:");
    for (const admin of createdAdmins) {
      const teamSize = await prisma.user.count({
        where: { managerId: admin.id },
      });
      console.log(
        `  - ${admin.identifier} | ${admin.name} | Echipa: ${teamSize} membri`
      );
    }
  } catch (error) {
    console.error("❌ Eroare la crearea structurii echipelor:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTeamStructure();
