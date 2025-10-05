import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

// For better TypeScript support with global prisma instance
declare global {
  var prisma: PrismaClient | undefined;
}

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

// Funcții pentru utilizatori
export class UserService {
  // Găsește utilizator după identifier sau email
  static async findByIdentifier(identifier: string) {
    try {
      return await prisma.user.findFirst({
        where: {
          OR: [{ identifier }, { email: identifier }],
        },
      });
    } catch (error) {
      console.error("Eroare la căutarea utilizatorului:", error);
      throw new Error("Eroare la căutarea utilizatorului");
    }
  }

  // Găsește utilizator după ID
  static async findById(id: number) {
    try {
      return await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          identifier: true,
          name: true,
          role: true,
          avatar: true,
          department: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      console.error("Eroare la găsirea utilizatorului după ID:", error);
      throw new Error("Eroare la găsirea utilizatorului");
    }
  }

  // Creează un utilizator nou
  static async create(userData: {
    email: string;
    identifier: string;
    name: string;
    password: string;
    role?: string;
    avatar?: string;
    department?: string;
  }) {
    try {
      return await prisma.user.create({
        data: userData,
      });
    } catch (error) {
      console.error("Eroare la crearea utilizatorului:", error);
      throw new Error("Eroare la crearea utilizatorului");
    }
  }

  // Verifică dacă identifier-ul există deja
  static async identifierExists(identifier: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { identifier },
      });
      return !!user;
    } catch (error) {
      console.error("Eroare la verificarea identifier-ului:", error);
      return false;
    }
  }

  // Verifică dacă email-ul există deja
  static async emailExists(email: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });
      return !!user;
    } catch (error) {
      console.error("Eroare la verificarea email-ului:", error);
      return false;
    }
  }
}

// Testează conexiunea la baza de date
export async function testConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT NOW()`;
    console.log("✅ Conexiune la baza de date reușită");
    return true;
  } catch (error) {
    console.error("❌ Eroare la conexiunea la baza de date:", error);
    return false;
  }
}

export default prisma;
