import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Obține informații despre zilele completate pentru calendar
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const year = searchParams.get("year");
    const month = searchParams.get("month");

    console.log("=== Calendar API called with:", { userId, year, month });

    if (!userId || !year || !month) {
      return NextResponse.json(
        { error: "User ID, year și month sunt obligatorii" },
        { status: 400 }
      );
    }

    // Calculează prima și ultima zi din lună
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(
      parseInt(year),
      parseInt(month),
      0,
      23,
      59,
      59,
      999
    );

    console.log("Date range:", { startDate, endDate });

    // Obține toate activitățile din luna specificată
    const activities = await prisma.activity.findMany({
      where: {
        userId: parseInt(userId),
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        date: true,
        status: true,
        activity: true,
        work: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    console.log(
      `Found ${activities.length} activities for user ${userId} in ${year}-${month}`
    );

    // Grupează activitățile pe zile
    interface DayActivity {
      id: number;
      date: Date;
      status: string;
      activity: string;
      work: string;
    }

    const dayActivities: { [key: string]: DayActivity[] } = {};
    const completedDays = new Set<number>();
    const inProgressDays = new Set<number>();

    activities.forEach((activity) => {
      // Convertește data folosind fusul orar românesc
      const utcDate = new Date(activity.date);

      // Convertim UTC la fusul orar românesc (UTC+2 în octombrie)
      const romanianTime = new Date(utcDate.getTime() + 2 * 60 * 60 * 1000);

      // Extragem ziua din data română
      const day = romanianTime.getUTCDate();
      const dayKey = day.toString();

      if (!dayActivities[dayKey]) {
        dayActivities[dayKey] = [];
      }

      dayActivities[dayKey].push(activity);

      // Marchează ziua ca fiind completată sau în progres
      if (activity.status === "Completat") {
        completedDays.add(day);
      } else if (activity.status === "In Progres") {
        inProgressDays.add(day);
      }
    });

    // Calculează statistici
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
    const today = new Date();
    const isCurrentMonth =
      parseInt(year) === today.getFullYear() &&
      parseInt(month) === today.getMonth() + 1;

    // Calculează zilele lucrătoare (exclude weekend-urile și sărbătorile)
    const getRomanianHolidays = (year: number) => {
      if (year === 2025) {
        return [
          new Date(year, 0, 1), // 1 ianuarie - Anul Nou
          new Date(year, 0, 2), // 2 ianuarie - A doua zi de Anul Nou
          new Date(year, 0, 6), // 6 ianuarie - Boboteaza
          new Date(year, 0, 7), // 7 ianuarie - Sfântul Ioan Botezătorul
          new Date(year, 0, 24), // 24 ianuarie - Ziua Unirii Principatelor Române
          new Date(year, 3, 18), // 18 aprilie - Vinerea Mare (Paște ortodox 2025)
          new Date(year, 3, 19), // 19 aprilie - Sâmbăta Mare
          new Date(year, 3, 20), // 20 aprilie - Paștele ortodox
          new Date(year, 3, 21), // 21 aprilie - A doua zi de Paște
          new Date(year, 4, 1), // 1 mai - Ziua Muncii
          new Date(year, 5, 1), // 1 iunie - Ziua Copilului
          new Date(year, 5, 8), // 8 iunie - Rusalii
          new Date(year, 5, 9), // 9 iunie - A doua zi de Rusalii
          new Date(year, 7, 15), // 15 august - Adormirea Maicii Domnului
          new Date(year, 10, 30), // 30 noiembrie - Sfântul Andrei
          new Date(year, 11, 1), // 1 decembrie - Ziua Națională a României
          new Date(year, 11, 25), // 25 decembrie - Crăciunul
          new Date(year, 11, 26), // 26 decembrie - A doua zi de Crăciun
        ];
      } else {
        // Pentru alți ani, păstrează sărbătorile fixe
        return [
          new Date(year, 0, 1), // Anul Nou
          new Date(year, 0, 2), // Anul Nou
          new Date(year, 0, 6), // Boboteaza
          new Date(year, 0, 7), // Sfântul Ioan
          new Date(year, 0, 24), // Ziua Unirii
          new Date(year, 4, 1), // Ziua Muncii
          new Date(year, 5, 1), // Ziua Copilului
          new Date(year, 7, 15), // Adormirea Maicii Domnului
          new Date(year, 10, 30), // Sfântul Andrei
          new Date(year, 11, 1), // Ziua Națională
          new Date(year, 11, 25), // Crăciunul
          new Date(year, 11, 26), // A doua zi de Crăciun
        ];
      }
    };

    const holidays = getRomanianHolidays(parseInt(year));
    let workingDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(parseInt(year), parseInt(month) - 1, day);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isHoliday = holidays.some(
        (h) => h.getDate() === day && h.getMonth() === parseInt(month) - 1
      );

      // Dacă e luna curentă, nu conta zilele viitoare
      if (isCurrentMonth && day > today.getDate()) {
        continue;
      }

      if (!isWeekend && !isHoliday) {
        workingDays++;
      }
    }

    const completionRate =
      workingDays > 0
        ? Math.round((completedDays.size / workingDays) * 100)
        : 0;

    const result = {
      success: true,
      data: {
        completedDays: Array.from(completedDays),
        inProgressDays: Array.from(inProgressDays),
        dayActivities,
        statistics: {
          totalActivities: activities.length,
          completedDays: completedDays.size,
          inProgressDays: inProgressDays.size,
          workingDays,
          completionRate,
          daysInMonth,
        },
      },
    };

    console.log("Returning calendar data:", JSON.stringify(result, null, 2));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Eroare la obținerea datelor de calendar:", error);
    return NextResponse.json(
      { error: "Eroare internă a serverului" },
      { status: 500 }
    );
  }
}
