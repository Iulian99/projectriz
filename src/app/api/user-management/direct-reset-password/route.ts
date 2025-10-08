import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
  const body = await request.json();
  const { identifier, password } = body;
  console.log("[DEBUG] Body primit:", body);

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: "User și parolă sunt obligatorii" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Parola trebuie să aibă cel puțin 6 caractere" },
        { status: 400 }
      );
    }

    // Caută utilizatorul în tabela nom_utilizatori după codUtilizator
    let user = null;
    try {
      user = await prisma.nomUtilizatori.findUnique({ where: { codUtilizator: identifier } });
      console.log("[DEBUG] Rezultat căutare utilizator:", user);
    } catch (err) {
      console.error("[DEBUG] Eroare la căutare utilizator:", err);
      return NextResponse.json(
        { success: false, error: "Eroare la căutare utilizator" },
        { status: 500 }
      );
    }
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Utilizatorul nu a fost găsit" },
        { status: 404 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    try {
      await prisma.nomUtilizatori.update({
        where: { codUtilizator: identifier },
        data: { password: hashedPassword, updatedAt: new Date() },
      });
      console.log("[DEBUG] Parola actualizată cu succes pentru:", identifier);
    } catch (err) {
      console.error("[DEBUG] Eroare la actualizare parolă:", err);
      return NextResponse.json(
        { success: false, error: "Eroare la actualizare parolă" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Parola a fost schimbată cu succes!" });
  } catch (error) {
    console.error("Eroare la direct reset password:", error);
    return NextResponse.json(
      { success: false, error: "Eroare internă a serverului" },
      { status: 500 }
    );
  }
}
