import { NextRequest, NextResponse } from "next/server";
import {
  supabase as sharedSupabase,
  isSupabaseConfigured,
} from "@/lib/supabase";

// Definim tipurile pentru activități
// Activity type kept for reference

interface DayActivity {
  id: number;
  activity: string;
  work: string;
  status: string;
  date: string;
}

const supabase = sharedSupabase;

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        {
          error:
            "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
        },
        { status: 500 }
      );
    }
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
      .from("raport")
      .select("raport_id, raport_data, tipactivitate, activitate, lucrare")
      .eq("raport_uid", parseInt(userId))
      .gte("raport_data", startDateString)
      .lte("raport_data", endDateString)
      .order("raport_data", { ascending: true })
      .order("raport_id", { ascending: true });

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
      const dayKey = new Date(activity.raport_data).toISOString().split("T")[0];

      if (!dayActivities[dayKey]) dayActivities[dayKey] = [];

      dayActivities[dayKey].push({
        id: activity.raport_id,
        activity: activity.activitate,
        work: activity.lucrare || "-",
        status: activity.tipactivitate || "Necunoscut",
        date: activity.raport_data,
      });

      if (activity.tipactivitate?.toLowerCase() === "completat") {
        completedDays.add(dayKey);
      } else if (activity.tipactivitate?.toLowerCase() === "in progres") {
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
  } catch {
    return NextResponse.json(
      { error: "Eroare internă a serverului" },
      { status: 500 }
    );
  }
}
