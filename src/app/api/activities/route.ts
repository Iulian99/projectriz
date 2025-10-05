import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Obține activitățile utilizatorului
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const date = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Construiește condiția de căutare
    const whereCondition: {
      userId: number;
      date?: {
        gte: Date;
        lt?: Date;
        lte?: Date;
      };
    } = {
      userId: parseInt(userId),
    };

    // Adaugă filtrare după interval de date (startDate și endDate)
    if (startDate && endDate) {
      const start = new Date(startDate + "T00:00:00.000Z");
      const end = new Date(endDate + "T23:59:59.999Z");

      whereCondition.date = {
        gte: start,
        lte: end,
      };
    }
    // Adaugă filtrare după dată specifică dacă este specificată
    else if (date) {
      const selectedDate = new Date(date);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(selectedDate.getDate() + 1);

      whereCondition.date = {
        gte: selectedDate,
        lt: nextDay,
      };
    }

    const activities = await prisma.activity.findMany({
      where: whereCondition,
      include: {
        user: {
          select: {
            name: true,
            identifier: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    // Definim tipul extins pentru Activity pentru a include câmpurile suplimentare
    interface ExtendedActivity {
      id: number;
      date: Date;
      activity: string;
      work: string;
      status: string;
      userId: number;
      createdAt: Date;
      updatedAt: Date;
      user: {
        name: string;
        identifier: string;
      };
      baseAct?: string;
      attributes?: string;
      complexity?: string;
      timeSpent?: number;
      observations?: string;
    }

    // Formatez datele pentru dashboard, incluzând și câmpurile noi
    const formattedActivities = activities.map((activity) => {
      // Folosim casting pentru a informa TypeScript despre câmpurile suplimentare
      const extendedActivity = activity as unknown as ExtendedActivity;

      return {
        id: extendedActivity.id,
        date: extendedActivity.date.toISOString().split("T")[0], // Format ISO pentru consistență
        displayDate: extendedActivity.date.toLocaleDateString("ro-RO"), // Pentru afișare
        employee: `${extendedActivity.user.name} [${extendedActivity.user.identifier}]`,
        activity: extendedActivity.activity,
        work: extendedActivity.work,
        status: extendedActivity.status,
        userId: extendedActivity.userId, // Adăugat pentru compatibilitate cu DailyReportClient
        timeSpent: extendedActivity.timeSpent || 0,
        createdAt: extendedActivity.createdAt.toISOString(), // Folosim createdAt real din baza de date
        updatedAt: extendedActivity.updatedAt.toISOString(), // Folosim updatedAt real din baza de date
        // Includem și câmpurile noi dacă există
        baseAct: extendedActivity.baseAct || "",
        attributes: extendedActivity.attributes || "",
        complexity: extendedActivity.complexity || "",
        observations: extendedActivity.observations || "",
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedActivities,
    });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST - Creează o activitate nouă
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log("POST Request data:", data);

    // Validare câmpuri obligatorii
    if (!data.activity || !data.work || !data.userId) {
      return NextResponse.json(
        { error: "Missing required fields: activity, work, userId" },
        { status: 400 }
      );
    }

    // Validare timeSpent - nu poate fi mai mare de 24 ore sau negativă
    if (data.timeSpent !== undefined) {
      const timeSpent = parseFloat(data.timeSpent);
      if (isNaN(timeSpent) || timeSpent < 0 || timeSpent > 24) {
        return NextResponse.json(
          { error: "timeSpent must be a number between 0 and 24 hours" },
          { status: 400 }
        );
      }
    }

    console.log("Creating activity with data:", data);

    // Construim datele de bază necesare pentru Prisma
    // Doar includem câmpurile care sunt suportate de modelul Prisma
    const activity = await prisma.activity.create({
      data: {
        activity: data.activity,
        work: data.work,
        status: data.status || "Completat",
        userId: parseInt(data.userId),
        date: data.date ? new Date(data.date) : new Date(),
        // Adăugăm doar câmpurile care există în schema Prisma
        // Dacă vreunul din aceste câmpuri nu există în schema, Prisma va arunca o eroare
        ...(data.baseAct ? { baseAct: data.baseAct } : {}),
        ...(data.attributes ? { attributes: data.attributes } : {}),
        ...(data.complexity ? { complexity: data.complexity } : {}),
        ...(data.timeSpent ? { timeSpent: data.timeSpent } : {}),
        ...(data.observations ? { observations: data.observations } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      data: activity,
    });
  } catch (error) {
    console.error("Error creating activity:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT - Actualizează o activitate existentă
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const data = await request.json();

    // Validare ID
    if (!id) {
      return NextResponse.json(
        { error: "Activity ID is required" },
        { status: 400 }
      );
    }

    // Validare câmpuri obligatorii
    if (!data.activity || !data.work || !data.userId) {
      return NextResponse.json(
        { error: "Missing required fields: activity, work, userId" },
        { status: 400 }
      );
    }

    // Validare timeSpent - nu poate fi mai mare de 24 ore sau negativă
    if (data.timeSpent !== undefined) {
      const timeSpent = parseFloat(data.timeSpent);
      if (isNaN(timeSpent) || timeSpent < 0 || timeSpent > 24) {
        return NextResponse.json(
          { error: "timeSpent must be a number between 0 and 24 hours" },
          { status: 400 }
        );
      }
    }

    // Verifică dacă activitatea există
    const existingActivity = await prisma.activity.findUnique({
      where: { id: Number(id) },
    });

    if (!existingActivity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    console.log("Updating activity with data:", data);

    // Actualizează activitatea cu toate câmpurile disponibile
    const updatedActivity = await prisma.activity.update({
      where: { id: Number(id) },
      data: {
        activity: data.activity,
        work: data.work,
        status: data.status || existingActivity.status,
        userId: parseInt(data.userId),
        date: data.date ? new Date(data.date) : existingActivity.date,
        // Adăugăm doar câmpurile care există în schema Prisma
        ...(data.baseAct ? { baseAct: data.baseAct } : {}),
        ...(data.attributes ? { attributes: data.attributes } : {}),
        ...(data.complexity ? { complexity: data.complexity } : {}),
        ...(data.timeSpent ? { timeSpent: data.timeSpent } : {}),
        ...(data.observations ? { observations: data.observations } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedActivity,
    });
  } catch (error) {
    console.error("Error updating activity:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE - Șterge o activitate existentă
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activityId = searchParams.get("id");

    if (!activityId) {
      return NextResponse.json(
        { success: false, error: "ID activitate lipsește" },
        { status: 400 }
      );
    }

    // Verifică dacă activitatea există
    const existingActivity = await prisma.activity.findUnique({
      where: { id: Number(activityId) },
    });

    if (!existingActivity) {
      return NextResponse.json(
        { success: false, error: "Activitatea nu a fost găsită" },
        { status: 404 }
      );
    }

    // Șterge activitatea din baza de date
    await prisma.activity.delete({
      where: { id: Number(activityId) },
    });

    console.log(`Activity deleted successfully with ID: ${activityId}`);

    return NextResponse.json({
      success: true,
      message: "Activitatea a fost ștearsă cu succes",
    });
  } catch (error) {
    console.error("Eroare la ștergerea activității:", error);
    return NextResponse.json(
      { success: false, error: "Eroare la ștergerea activității" },
      { status: 500 }
    );
  }
}
