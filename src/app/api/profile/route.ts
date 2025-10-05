import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "ID utilizator este obligatoriu" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(userId),
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Utilizatorul nu a fost găsit" },
        { status: 404 }
      );
    }

    // Remove sensitive data
    const userWithoutPassword = { ...user };
    delete (userWithoutPassword as { password?: string }).password;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Eroare la preluarea profilului:", error);
    return NextResponse.json(
      { success: false, error: "Eroare internă de server" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, email, phone, address } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "ID utilizator este obligatoriu" },
        { status: 400 }
      );
    }

    const updateData: Record<string, string> = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;

    const updatedUser = await prisma.user.update({
      where: {
        id: parseInt(userId),
      },
      data: updateData,
    });

    // Remove sensitive data
    const userWithoutPassword = { ...updatedUser };
    delete (userWithoutPassword as { password?: string }).password;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: "Profilul a fost actualizat cu succes",
    });
  } catch (error) {
    console.error("Eroare la actualizarea profilului:", error);
    return NextResponse.json(
      { success: false, error: "Eroare internă de server" },
      { status: 500 }
    );
  }
}
