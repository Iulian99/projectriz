import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    // Șterge activitatea din baza de date
    await prisma.activity.delete({
      where: {
        id: parseInt(activityId),
      },
    });

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
