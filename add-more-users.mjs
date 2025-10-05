import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function addMoreUsers() {
  try {
    console.log("Adăugarea mai multor utilizatori pentru testare...");

    // Lista de utilizatori de adăugat
    const usersToAdd = [
      {
        identifier: "popescu_ion",
        email: "ion.popescu@example.com",
        password: "parola123",
        name: "Popescu Ion",
        role: "user",
        department: "SACPCA",
        badge: "5678",
        position: "Analist de Date",
        employeeCode: "18567890",
        unit: "SACPCA",
        phone: "+40 711 222 333",
        address: "Str. Victoriei nr. 10, București",
        status: "active",
      },
      {
        identifier: "ionescu_maria",
        email: "maria.ionescu@example.com",
        password: "parola456",
        name: "Ionescu Maria",
        role: "user",
        department: "Financiar",
        badge: "1234",
        position: "Contabil",
        employeeCode: "12345678",
        unit: "Financiar",
        phone: "+40 722 333 444",
        address: "Str. Unirii nr. 5, București",
        status: "active",
      },
      {
        identifier: "georgescu_andrei",
        email: "andrei.georgescu@example.com",
        password: "parola789",
        name: "Georgescu Andrei",
        role: "manager",
        department: "HR",
        badge: "9876",
        position: "Manager HR",
        employeeCode: "98765432",
        unit: "Resurse Umane",
        phone: "+40 733 444 555",
        address: "Str. Florilor nr. 15, București",
        status: "active",
      },
      {
        identifier: "stanescu_elena",
        email: "elena.stanescu@example.com",
        password: "parola321",
        name: "Stănescu Elena",
        role: "user",
        department: "IT",
        badge: "4321",
        position: "Programator",
        employeeCode: "43219876",
        unit: "Dezvoltare Software",
        phone: "+40 744 555 666",
        address: "Str. Primăverii nr. 25, București",
        status: "active",
      },
      {
        identifier: "vasilescu_mihai",
        email: "mihai.vasilescu@example.com",
        password: "parola654",
        name: "Vasilescu Mihai",
        role: "user",
        department: "Marketing",
        badge: "8765",
        position: "Specialist Marketing",
        employeeCode: "87654321",
        unit: "Marketing",
        phone: "+40 755 666 777",
        address: "Str. Libertății nr. 30, București",
        status: "active",
      },
      {
        identifier: "dumitrescu_alexandra",
        email: "alexandra.dumitrescu@example.com",
        password: "parola987",
        name: "Dumitrescu Alexandra",
        role: "manager",
        department: "Operațiuni",
        badge: "2345",
        position: "Director Operațiuni",
        employeeCode: "23456789",
        unit: "Operațiuni",
        phone: "+40 766 777 888",
        address: "Str. Independenței nr. 40, București",
        status: "active",
      },
      {
        identifier: "munteanu_gabriel",
        email: "gabriel.munteanu@example.com",
        password: "parola135",
        name: "Munteanu Gabriel",
        role: "user",
        department: "Suport",
        badge: "6543",
        position: "Specialist Suport",
        employeeCode: "65432198",
        unit: "Suport Tehnic",
        phone: "+40 777 888 999",
        address: "Str. Crinilor nr. 50, București",
        status: "inactive",
      },
    ];

    // Adăugare utilizatori
    for (const userData of usersToAdd) {
      const hashedPassword = await hash(userData.password, 10);
      
      // Verificare dacă utilizatorul există deja
      const existingUser = await prisma.user.findUnique({
        where: {
          identifier: userData.identifier,
        },
      });

      if (existingUser) {
        console.log(`- Utilizatorul ${userData.identifier} există deja.`);
      } else {
        const user = await prisma.user.create({
          data: {
            ...userData,
            password: hashedPassword,
          },
        });
        console.log(`✓ Utilizator adăugat: ${user.identifier} (${user.email})`);
      }
    }

    console.log("\n=== UTILIZATORI ADĂUGAȚI ===");
    usersToAdd.forEach(user => {
      console.log(`${user.name} (${user.identifier}): parola - ${user.password}`);
    });

  } catch (error) {
    console.error("Eroare:", error);
  } finally {
    await prisma.$disconnect();
  }
}

addMoreUsers();