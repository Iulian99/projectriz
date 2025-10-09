import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

interface ResetPasswordRequest {
  token: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Acceptă fie token+password, fie codUtilizator+newPassword
    const { token, password, codUtilizator, newPassword } = body;

    if (codUtilizator && newPassword) {
      // Resetare directă pentru admin/dev
      if (newPassword.length < 6) {
        return NextResponse.json(
          {
            success: false,
            error: "Parola trebuie să aibă cel puțin 6 caractere",
          },
          { status: 400 }
        );
      }
      const user = await prisma.nomUtilizatori.findUnique({
        where: { codUtilizator },
      });
      if (!user) {
        return NextResponse.json(
          { success: false, error: "Utilizatorul nu a fost găsit" },
          { status: 404 }
        );
      }
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await prisma.nomUtilizatori.update({
        where: { codUtilizator },
        data: { password: hashedPassword, updatedAt: new Date() },
      });
      return NextResponse.json({
        success: true,
        message: "Parola a fost resetată cu succes.",
      });
    }

    // Varianta clasică cu token
    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: "Token și parolă sunt obligatorii" },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: "Parola trebuie să aibă cel puțin 6 caractere",
        },
        { status: 400 }
      );
    }
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
        status: "active",
      },
      select: {
        id: true,
        email: true,
        name: true,
        resetToken: true,
        resetTokenExpiry: true,
      },
    });
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Token invalid sau expirat. Solicită din nou resetarea parolei.",
        },
        { status: 400 }
      );
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: user?.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        updatedAt: new Date(),
      },
    });
    return NextResponse.json({
      success: true,
      message:
        "Parola a fost resetată cu succes. Te poți conecta acum cu noua parolă.",
    });
  } catch (error) {
    console.error("Eroare la reset password:", error);
    return NextResponse.json(
      { success: false, error: "Eroare internă a serverului" },
      { status: 500 }
    );
  }
}
