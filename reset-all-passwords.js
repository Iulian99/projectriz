const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function resetAllPasswords() {
  try {
    console.log("🔄 Resetând parolele tuturor utilizatorilor...");

    // Hash-ul parolei "admin123"
    const hashedPassword = await bcrypt.hash("admin123", 12);

    // Obține toți utilizatorii
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        identifier: true,
        email: true,
      },
    });

    console.log(`📋 Găsiți ${users.length} utilizatori în baza de date:`);
    users.forEach((user) => {
      console.log(`  - ${user.name} (${user.identifier}) - ${user.email}`);
    });

    // Actualizează parola pentru toți utilizatorii
    const updateResult = await prisma.user.updateMany({
      data: {
        password: hashedPassword,
      },
    });

    console.log(
      `✅ Parola a fost resetată cu succes pentru ${updateResult.count} utilizatori!`
    );
    console.log("🔐 Noua parolă pentru toți utilizatorii este: admin123");

    // Afișează din nou lista utilizatorilor pentru confirmare
    console.log(
      "\n📝 Puteți acum să vă autentificați cu oricare dintre acești utilizatori:"
    );
    users.forEach((user) => {
      console.log(`  - Utilizator: ${user.identifier} | Parolă: admin123`);
    });
  } catch (error) {
    console.error("❌ Eroare la resetarea parolelor:", error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAllPasswords();
