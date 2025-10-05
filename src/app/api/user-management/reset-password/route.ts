import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

interface ResetPasswordRequest {
  token: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ResetPasswordRequest = await request.json();
    const { token, password } = body;

    // Validare input
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

    // Găsește utilizatorul cu token-ul și verifică expirarea
    const user = await prisma.user.findFirst({
      where: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        resetToken: token,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        resetTokenExpiry: {
          gt: new Date(), // Token-ul nu a expirat
        },
        status: "active", // Doar utilizatori activi
      },
      select: {
        id: true,
        email: true,
        name: true,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        resetToken: true,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
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

    // Hash-uiește noua parolă
    const hashedPassword = await bcrypt.hash(password, 12);

    // Actualizează parola și șterge token-ul de resetare
    await prisma.user.update({
      where: { id: user?.id },
      data: {
        password: hashedPassword,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        resetToken: null,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        resetTokenExpiry: null,
        updatedAt: new Date(),
      },
    });

    console.log(`
=====================================
PAROLĂ RESETATĂ CU SUCCES
=====================================
User: ${user.name} (${user.email})
Token folosit: ${token}
Data resetării: ${new Date().toISOString()}
=====================================
    `);

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
