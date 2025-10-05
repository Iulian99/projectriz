import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Obține statisticile echipei pentru manageri/admin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const managerId = searchParams.get("managerId");

    if (!managerId) {
      return NextResponse.json(
        { error: "Manager ID is required" },
        { status: 400 }
      );
    }

    // Verifică dacă utilizatorul este manager sau admin
    const manager = await prisma.user.findUnique({
      where: { id: parseInt(managerId) },
      select: { role: true },
    });

    if (
      !manager ||
      (manager.role.toUpperCase() !== "MANAGER" &&
        manager.role.toUpperCase() !== "ADMIN")
    ) {
      return NextResponse.json(
        {
          error:
            "Access denied. Only managers and admins can view team statistics.",
        },
        { status: 403 }
      );
    }

    // Obține toți utilizatorii din echipa managerului (sau toți utilizatorii pentru admin)
    let teamMembers: Array<{
      id: number;
      name: string;
      identifier: string;
      role: string;
      activities: Array<{ date: Date }>;
    }>;

    if (manager.role.toUpperCase() === "ADMIN") {
      teamMembers = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          identifier: true,
          role: true,
          activities: {
            select: {
              date: true,
            },
          },
        },
      });
    } else {
      // Pentru manageri, folosim SQL direct pentru a căuta după managerId
      const subordinates = (await prisma.$queryRaw`
        SELECT id, name, identifier, role FROM users WHERE managerId = ${parseInt(
          managerId
        )}
      `) as Array<{
        id: number;
        name: string;
        identifier: string;
        role: string;
      }>;

      // Obținem activitățile pentru fiecare subordonat
      teamMembers = [];
      for (const subordinate of subordinates) {
        const activities = await prisma.activity.findMany({
          where: { userId: subordinate.id },
          select: { date: true },
        });
        teamMembers.push({
          ...subordinate,
          activities,
        });
      }
    }

    // Calculează statisticile pentru luna curentă
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Funcție pentru calculul zilelor lucrătoare
    function getWorkingDaysInMonth(year: number, month: number): number {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      let workingDays = 0;

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          workingDays++;
        }
      }

      return workingDays;
    }

    // Funcție pentru calculul zilelor completate
    function getCompletedDaysFromActivities(
      activities: { date: Date }[],
      year: number,
      month: number
    ): number {
      const completedDates = new Set<string>();

      activities.forEach((activity) => {
        const activityDate = new Date(activity.date);
        if (
          activityDate.getFullYear() === year &&
          activityDate.getMonth() === month
        ) {
          const dateStr = activityDate.toISOString().split("T")[0];
          completedDates.add(dateStr);
        }
      });

      return completedDates.size;
    }
    const totalWorkingDays = getWorkingDaysInMonth(currentYear, currentMonth);

    // Calculează statisticile pentru fiecare membru al echipei
    const teamStats = teamMembers.map((member) => {
      const completedDays = getCompletedDaysFromActivities(
        member.activities,
        currentYear,
        currentMonth
      );
      const completionPercentage =
        totalWorkingDays > 0
          ? Math.round((completedDays / totalWorkingDays) * 100)
          : 0;

      return {
        id: member.id,
        name: member.name,
        identifier: member.identifier,
        role: member.role,
        completedDays,
        totalWorkingDays,
        completionPercentage,
      };
    });

    // Calculează statisticile generale ale echipei
    const teamSummary = {
      totalMembers: teamMembers.length,
      averageCompletionRate:
        teamStats.length > 0
          ? Math.round(
              teamStats.reduce(
                (sum, member) => sum + member.completionPercentage,
                0
              ) / teamStats.length
            )
          : 0,
      totalWorkingDays,
      topPerformer:
        teamStats.length > 0
          ? teamStats.reduce((top, current) =>
              current.completionPercentage > top.completionPercentage
                ? current
                : top
            )
          : null,
      membersWithFullCompletion: teamStats.filter(
        (member) => member.completionPercentage === 100
      ).length,
    };

    return NextResponse.json({
      success: true,
      teamStats,
      teamSummary,
      currentMonth: now.toLocaleDateString("ro-RO", {
        month: "long",
        year: "numeric",
      }),
    });
  } catch (error) {
    console.error("Eroare la obținerea statisticilor echipei:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
