// Importăm modulele necesare
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

// Creăm un script simplu pentru a afișa și reseta parolele utilizatorilor
async function main() {
  const prisma = new PrismaClient();

  try {
    // Obținem toți utilizatorii
    const users = await prisma.user.findMany({
      select: {
        id: true,
        identifier: true,
        name: true,
        email: true,
        role: true,
      },
    });

    console.log("\nLista utilizatorilor disponibili:\n");
    console.table(users);

    console.log("\nPentru a reseta o parolă, rulați:");
    console.log(
      "npx ts-node reset-password.ts reset <identifier> <noua_parola>"
    );

    // Verificăm dacă s-a cerut resetarea parolei
    if (process.argv.length >= 4 && process.argv[2] === "reset") {
      const identifier = process.argv[3];
      const newPassword = process.argv[4] || "parola123";

      const user = await prisma.user.findUnique({
        where: { identifier },
      });

      if (!user) {
        console.log(
          `\nUtilizatorul cu identificatorul ${identifier} nu a fost găsit.`
        );
        return;
      }

      // Hashăm parola nouă
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Actualizăm parola în baza de date
      await prisma.user.update({
        where: { identifier },
        data: { password: hashedPassword },
      });

      console.log(
        `\nParola pentru ${user.name} (${identifier}) a fost resetată la: ${newPassword}`
      );
    }
  } catch (error) {
    console.error("A apărut o eroare:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
