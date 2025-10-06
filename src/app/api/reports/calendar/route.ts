import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Definim tipurile pentru activități
interface Activity {
  id: number;
  date: string;
  status: string;
  activity: string;
  work: string;
}

interface DayActivity {
  id: number;
  activity: string;
  work: string;
  status: string;
  date: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const year = searchParams.get("year");
    const month = searchParams.get("month");

    if (!userId || !year || !month) {
      return NextResponse.json(
        { error: "User ID, year și month sunt obligatorii" },
        { status: 400 }
      );
    }

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

    const startDateString = startDate.toISOString();
    const endDateString = endDate.toISOString();

    const { data: activities, error } = await supabase
      .from("Activity")
      .select("id, date, status, activity, work")
      .eq("userId", parseInt(userId))
      .gte("date", startDateString)
      .lte("date", endDateString)
      .order("date", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: "Eroare la baza de date" },
        { status: 500 }
      );
    }

    const completedDays = new Set<string>();
    const inProgressDays = new Set<string>();
    const dayActivities: { [key: string]: DayActivity[] } = {};

    (activities || []).forEach((activity) => {
      const dayKey = new Date(activity.date).toISOString().split("T")[0];

      if (!dayActivities[dayKey]) dayActivities[dayKey] = [];

      dayActivities[dayKey].push({
        id: activity.id,
        activity: activity.activity,
        work: activity.work,
        status: activity.status,
        date: activity.date,
      });

      if (activity.status?.toLowerCase() === "completat") {
        completedDays.add(dayKey);
      } else if (activity.status?.toLowerCase() === "in progres") {
        inProgressDays.add(dayKey);
      }
    });

    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
    let workingDays = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const dayOfWeek = new Date(
        parseInt(year),
        parseInt(month) - 1,
        day
      ).getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) workingDays++;
    }

    const completionRate =
      workingDays > 0
        ? Math.round((completedDays.size / workingDays) * 100)
        : 0;

    return NextResponse.json({
      success: true,
      data: {
        completedDays: Array.from(completedDays),
        inProgressDays: Array.from(inProgressDays),
        dayActivities,
        statistics: {
          totalActivities: activities?.length || 0,
          completedDays: completedDays.size,
          inProgressDays: inProgressDays.size,
          workingDays,
          completionRate,
          daysInMonth,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Eroare internă a serverului" },
      { status: 500 }
    );
  }
}
