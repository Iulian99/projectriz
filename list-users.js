// Script pentru afișarea utilizatorilor și resetarea parolelor
// Salvați acest fișier ca list-users.js și rulați-l cu: node list-users.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Funcție pentru afișarea utilizatorilor din baza de date
async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        identifier: true,
        role: true,
      },
    });

    console.log("\n=== UTILIZATORI DISPONIBILI ===\n");
    console.table(users);
    console.log(
      "\nPentru a vă autentifica, folosiți identificatorul și parola corespunzătoare."
    );
    console.log(
      "Dacă ați uitat parola, cereți administratorului să o reseteze."
    );
  } catch (error) {
    console.error("Eroare:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Rulăm funcția
listUsers();
