import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Obține toți subordonații unui manager
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

    // Obținem toți utilizatorii care au acest manager ID folosind relația corectă
    const subordinates = await prisma.user.findMany({
      where: {
        managerId: parseInt(managerId),
      },
      select: {
        id: true,
        name: true,
        identifier: true,
        email: true,
        department: true,
        position: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      users: subordinates,
    });
  } catch (error) {
    console.error("Error fetching subordinates:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
