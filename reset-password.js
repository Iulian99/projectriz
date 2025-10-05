// Script pentru resetarea parolei unui utilizator
// Salvați acest fișier ca reset-password.js și rulați-l cu:
// node reset-password.js [identifier] [noua_parola]

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function resetPassword() {
  try {
    // Verificăm dacă s-a specificat un identificator
    const userIdentifier = process.argv[2];
    const newPassword = process.argv[3] || "parola123"; // Parola implicită dacă nu se specifică una

    if (!userIdentifier) {
      console.log(
        "\nUtilizare: node reset-password.js [identifier] [noua_parola]"
      );
      console.log("\nExemplu: node reset-password.js admin parola123");

      console.log("\nIdentificatori disponibili:");
      const users = await prisma.user.findMany({
        select: {
          identifier: true,
          name: true,
        },
      });

      users.forEach((user) => {
        console.log(`- ${user.identifier} (${user.name})`);
      });

      return;
    }

    // Verificăm dacă utilizatorul există
    const user = await prisma.user.findUnique({
      where: {
        identifier: userIdentifier,
      },
    });

    if (!user) {
      console.log(
        `\nUtilizatorul cu identificatorul "${userIdentifier}" nu a fost găsit.`
      );
      return;
    }

    // Generăm hash-ul pentru noua parolă
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizăm parola utilizatorului
    await prisma.user.update({
      where: {
        identifier: userIdentifier,
      },
      data: {
        password: hashedPassword,
      },
    });

    console.log(
      `\nParola pentru utilizatorul ${user.name} (${userIdentifier}) a fost resetată cu succes la: ${newPassword}`
    );
  } catch (error) {
    console.error("Eroare:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Rulăm funcția
resetPassword();
