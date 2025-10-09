import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      codUtilizator,
      denumireUtilizator,
      email,
      password,
      codFunctie,
      codServ,
    } = body;
    if (
      !codUtilizator ||
      !denumireUtilizator ||
      !email ||
      !password ||
      !codFunctie ||
      !codServ
    ) {
      return NextResponse.json(
        { success: false, error: "Toate câmpurile sunt obligatorii" },
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
    // Verifică cod utilizator duplicat
    const existingCod = await prisma.nomUtilizatori.findUnique({
      where: { codUtilizator },
    });
    if (existingCod) {
      return NextResponse.json(
        { success: false, error: "Codul de utilizator există deja" },
        { status: 409 }
      );
    }
    // Verifică email duplicat
    const existingEmail = await prisma.nomUtilizatori.findUnique({
      where: { email },
    });
    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: "Emailul există deja" },
        { status: 409 }
      );
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.nomUtilizatori.create({
      data: {
        codUtilizator,
        denumireUtilizator,
        email,
        password: hashedPassword,
        status: "active",
        codFunctie,
        codServ,
      },
    });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    // Returnează detalii de eroare pentru debug
    let errorMsg = "Eroare la adăugare utilizator";
    if (err instanceof Error) {
      errorMsg = err.message;
    }
    return NextResponse.json(
      { success: false, error: errorMsg, details: err },
      { status: 500 }
    );
  }
}
