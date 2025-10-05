// Script pentru resetarea parolei unui utilizator
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetPassword() {
  try {
    // Afișează lista tuturor utilizatorilor
    console.log('Lista utilizatorilor din baza de date:');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        identifier: true,
        role: true,
      }
    });

    console.table(users);

    // Definim un utilizator și o parolă nouă
    const userIdentifier = process.argv[2]; // Citim identificatorul utilizatorului din argumentele liniei de comandă
    const newPassword = process.argv[3] || 'parola123'; // Folosim parola din argumente sau una implicită

    if (!userIdentifier) {
      console.error('Trebuie să specificați identificatorul utilizatorului!');
      console.log('Utilizare: node reset-password.js <identifier> [parola_noua]');
      return;
    }

    // Verifică dacă utilizatorul există
    const user = await prisma.user.findUnique({
      where: {
        identifier: userIdentifier,
      },
    });

    if (!user) {
      console.error(`Utilizatorul cu identificatorul ${userIdentifier} nu a fost găsit!`);
      return;
    }

    // Hashează parola nouă
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizează parola utilizatorului
    await prisma.user.update({
      where: {
        identifier: userIdentifier,
      },
      data: {
        password: hashedPassword,
      },
    });

    console.log(`Parola pentru utilizatorul ${user.name} (${userIdentifier}) a fost resetată cu succes la: ${newPassword}`);

  } catch (error) {
    console.error('A apărut o eroare:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();