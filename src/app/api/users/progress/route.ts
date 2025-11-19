import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Interfață pentru activități din Prisma
interface ActivityWithTimeSpent {
  id: number;
  date: Date;
  activity: string;
  work: string;
  status: string;
  userId: number;
  timeSpent?: number | null;
}

interface SubordinateSummary {
  id: number;
  name: string;
  identifier: string;
  department: string | null;
  position: string | null;
}

// GET - Obține procentul de completare a programului pentru echipă
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const managerId = searchParams.get("managerId");
    const month = searchParams.get("month"); // Format: YYYY-MM

    if (!managerId) {
      return NextResponse.json(
        { error: "Manager ID is required" },
        { status: 400 }
      );
    }

    // Verificăm dacă luna este specificată, altfel folosim luna curentă
    let startDate: Date;
    let endDate: Date;

    if (month) {
      const [year, monthNum] = month.split("-").map(Number);
      startDate = new Date(year, monthNum - 1, 1); // Prima zi a lunii specificate
      endDate = new Date(year, monthNum, 0); // Ultima zi a lunii specificate
    } else {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    // Obținem toți utilizatorii care au acest manager ca șef
    const subordinates: SubordinateSummary[] = await prisma.user.findMany({
      where: {
        managerId: parseInt(managerId),
      },
      select: {
        id: true,
        name: true,
        identifier: true,
        department: true,
        position: true,
      },
    });

    // Pentru fiecare subordonat, calculăm procentul de completare
    const usersWithProgress = await Promise.all(
      subordinates.map(async (user: SubordinateSummary) => {
        // Obținem toate activitățile utilizatorului pentru luna specificată
        const activities = await prisma.activity.findMany({
          where: {
            userId: user.id,
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
          select: {
            id: true,
            date: true,
            activity: true,
            work: true,
            status: true,
            userId: true,
            timeSpent: true,
          },
        });

        // Calculăm suma timpului petrecut pentru toate activitățile
        const totalMinutes = activities.reduce((total, activity) => {
          return total + (activity.timeSpent || 0);
        }, 0);

        // Calculăm numărul de zile lucrătoare în luna respectivă
        const workdays = getWorkdaysInMonth(startDate, endDate);

        // Un program complet de lucru are aproximativ 8 ore pe zi (480 minute)
        const totalRequiredMinutes = workdays * 480;

        // Calculăm procentul de completare
        const completionPercentage = Math.min(
          100,
          Math.round((totalMinutes / totalRequiredMinutes) * 100)
        );

        // Obținem rapoartele zilnice pentru a vedea progresul pe zile
        const dailyReports = getDailyReports(activities, startDate, endDate);

        return {
          ...user,
          completionPercentage,
          dailyReports,
        };
      })
    );

    return NextResponse.json({
      success: true,
      users: usersWithProgress,
    });
  } catch (error) {
    console.error("Error fetching team progress:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Funcție pentru a calcula numărul de zile lucrătoare într-o lună
function getWorkdaysInMonth(startDate: Date, endDate: Date): number {
  let count = 0;
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Ziua 0 este Duminică, ziua 6 este Sâmbătă
      count++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return count;
}

// Funcție pentru a obține rapoarte zilnice cu procent de completare
function getDailyReports(
  activities: ActivityWithTimeSpent[],
  startDate: Date,
  endDate: Date
) {
  // Creăm un map pentru fiecare zi din perioada specificată
  const dailyReports: { date: string; percentage: number }[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dateString = currentDate.toISOString().split("T")[0];

    // Filtrăm activitățile pentru ziua curentă
    const dailyActivities = activities.filter((activity) => {
      const activityDate = new Date(activity.date);
      return (
        activityDate.getFullYear() === currentDate.getFullYear() &&
        activityDate.getMonth() === currentDate.getMonth() &&
        activityDate.getDate() === currentDate.getDate()
      );
    });

    // Calculăm timpul total petrecut în ziua respectivă
    const dailyMinutes = dailyActivities.reduce((total, activity) => {
      return total + (activity.timeSpent || 0);
    }, 0);

    // Un program complet de lucru are aproximativ 8 ore pe zi (480 minute)
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Doar zile lucrătoare
      const dailyPercentage = Math.min(
        100,
        Math.round((dailyMinutes / 480) * 100)
      );
      dailyReports.push({
        date: dateString,
        percentage: dailyPercentage,
      });
    }

    // Trecem la următoarea zi
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dailyReports;
}
