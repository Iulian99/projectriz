import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";

const prisma = new PrismaClient();

// GET - Obține calendarul pentru o perioadă
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dataStart = searchParams.get("dataStart");
    const dataEnd = searchParams.get("dataEnd");
    const tipZi = searchParams.get("tipZi");

    const whereClause: {
      dataZi?: { gte?: Date; lte?: Date };
      tipZi?: string;
    } = {};

    if (dataStart || dataEnd) {
      whereClause.dataZi = {};
      if (dataStart) whereClause.dataZi.gte = new Date(dataStart);
      if (dataEnd) whereClause.dataZi.lte = new Date(dataEnd);
    }

    if (tipZi) whereClause.tipZi = tipZi;

    const calendar = await prisma.nomCalendar.findMany({
      where: whereClause,
      orderBy: {
        dataZi: "asc",
      },
    });

    return NextResponse.json(calendar);
  } catch (error) {
    console.error("Eroare la obținerea calendarului:", error);
    return NextResponse.json(
      { error: "Eroare la obținerea calendarului" },
      { status: 500 }
    );
  }
}

// POST - Adaugă o zi în calendar
export async function POST(request: NextRequest) {
  try {
    const { dataZi, tipZi } = await request.json();

    if (!dataZi || !tipZi) {
      return NextResponse.json(
        { error: "Data și tipul zilei sunt obligatorii" },
        { status: 400 }
      );
    }

    if (!["lucratoare", "nelucratoare"].includes(tipZi)) {
      return NextResponse.json(
        { error: 'Tipul zilei trebuie să fie "lucratoare" sau "nelucratoare"' },
        { status: 400 }
      );
    }

    const nouaZi = await prisma.nomCalendar.create({
      data: {
        dataZi: new Date(dataZi),
        tipZi,
      },
    });

    return NextResponse.json(nouaZi, { status: 201 });
  } catch (error: unknown) {
    console.error("Eroare la adăugarea zilei în calendar:", error);

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Data există deja în calendar" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Eroare la adăugarea zilei în calendar" },
      { status: 500 }
    );
  }
}

// PUT - Actualizează tipul unei zile
export async function PUT(request: NextRequest) {
  try {
    const { dataZi, tipZi } = await request.json();

    if (!dataZi || !tipZi) {
      return NextResponse.json(
        { error: "Data și tipul zilei sunt obligatorii" },
        { status: 400 }
      );
    }

    if (!["lucratoare", "nelucratoare"].includes(tipZi)) {
      return NextResponse.json(
        { error: 'Tipul zilei trebuie să fie "lucratoare" sau "nelucratoare"' },
        { status: 400 }
      );
    }

    const ziActualizata = await prisma.nomCalendar.update({
      where: {
        dataZi: new Date(dataZi),
      },
      data: {
        tipZi,
      },
    });

    return NextResponse.json(ziActualizata);
  } catch (error: unknown) {
    console.error("Eroare la actualizarea zilei în calendar:", error);

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Data nu există în calendar" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Eroare la actualizarea zilei în calendar" },
      { status: 500 }
    );
  }
}
