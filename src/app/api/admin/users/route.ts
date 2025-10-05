import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Manager {
  id: number;
  name: string;
}

interface CountResult {
  count: bigint;
}

interface UserWithExtras {
  id: number;
  name: string;
  email: string;
  identifier: string;
  role: string;
  department: string | null;
  position: string | null;
  status: string;
  manager: Manager | null;
  _count: {
    subordinates: number;
  };
}

// GET - Obține toți utilizatorii
export async function GET() {
  try {
    // Obține toți utilizatorii
    const users = await prisma.user.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        identifier: true,
        role: true,
        department: true,
        position: true,
        status: true,
      },
    });

    // Procesăm fiecare utilizator pentru a adăuga informații despre manager și subordonați
    const enhancedUsers: UserWithExtras[] = [];

    for (const user of users) {
      // Găsim managerul utilizatorului curent (dacă există)
      const managerRelation = await prisma.$queryRaw<Manager[]>`
        SELECT u2.id, u2.name 
        FROM users u1 
        JOIN users u2 ON u1.managerId = u2.id 
        WHERE u1.id = ${user.id}
      `;

      // Numărăm subordonații
      const subordinatesCount = await prisma.$queryRaw<CountResult[]>`
        SELECT COUNT(*) as count 
        FROM users 
        WHERE managerId = ${user.id}
      `;

      const manager =
        managerRelation.length > 0
          ? {
              id: managerRelation[0].id,
              name: managerRelation[0].name,
            }
          : null;

      enhancedUsers.push({
        ...user,
        manager,
        _count: {
          subordinates: Number(subordinatesCount[0].count),
        },
      });
    }

    return NextResponse.json({
      success: true,
      users: enhancedUsers,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST - Creează sau actualizează un utilizator
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Verificăm dacă utilizatorul există deja
    if (data.id) {
      // Folosim raw queries pentru a actualiza utilizatorul cu sau fără manager
      if (data.managerId) {
        // Update cu manager
        await prisma.$executeRaw`
          UPDATE users 
          SET name = ${data.name}, 
              email = ${data.email}, 
              role = ${data.role}, 
              department = ${data.department || null}, 
              position = ${data.position || null}, 
              status = ${data.status},
              managerId = ${data.managerId},
              updatedAt = datetime('now')
          WHERE id = ${data.id}
        `;
      } else {
        // Update fără manager (resetează managerId la null)
        await prisma.$executeRaw`
          UPDATE users 
          SET name = ${data.name}, 
              email = ${data.email}, 
              role = ${data.role}, 
              department = ${data.department || null}, 
              position = ${data.position || null}, 
              status = ${data.status},
              managerId = NULL,
              updatedAt = datetime('now')
          WHERE id = ${data.id}
        `;
      }

      // Obținem utilizatorul actualizat
      const user = await prisma.user.findUnique({
        where: { id: data.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          department: true,
          position: true,
          status: true,
          identifier: true,
        },
      });

      return NextResponse.json({
        success: true,
        user,
      });
    } else {
      // Creăm un utilizator nou cu raw query
      await prisma.$executeRaw`
        INSERT INTO users (
          name, email, identifier, password, role, department, position, 
          status, managerId, createdAt, updatedAt
        ) VALUES (
          ${data.name}, 
          ${data.email}, 
          ${data.identifier}, 
          ${data.password}, 
          ${data.role || "user"}, 
          ${data.department || null}, 
          ${data.position || null}, 
          ${data.status || "active"}, 
          ${data.managerId || null}, 
          datetime('now'), 
          datetime('now')
        )
      `;

      // Obținem utilizatorul nou creat
      const newUser = await prisma.user.findFirst({
        where: { email: data.email },
        orderBy: { id: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          department: true,
          position: true,
          status: true,
          identifier: true,
        },
      });

      return NextResponse.json({
        success: true,
        user: newUser,
      });
    }
  } catch (error) {
    console.error("Error creating/updating user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
