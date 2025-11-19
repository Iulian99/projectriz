import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

// Codul unic pentru resetarea parolei
const UNIQUE_RESET_CODE = process.env.UNIQUE_RESET_CODE;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, password, uniqueCode } = body;
    console.log("[DEBUG] Resetare parolă pentru:", identifier);

    // Validare câmpuri
    if (!identifier || !password || !uniqueCode) {
      return NextResponse.json(
        { success: false, error: "Toate câmpurile sunt obligatorii" },
        { status: 400 }
      );
    }

    // Verifică codul unic
    if (uniqueCode !== UNIQUE_RESET_CODE) {
      return NextResponse.json(
        { success: false, error: "Cod unic invalid!" },
        { status: 403 }
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

    // Convertire identifier la numar pentru cod_utilizator
    const numericId = Number(identifier);
    if (isNaN(numericId)) {
      return NextResponse.json(
        { success: false, error: "Cod utilizator invalid" },
        { status: 400 }
      );
    }

    console.log(
      "[DEBUG] Căutare cu numericId:",
      numericId,
      "tip:",
      typeof numericId
    );

    // Search utilizator db -> nom_utilizatori
    let { data: users, error: findError } = await supabase
      .from("nom_utilizatori")
      .select("cod_utilizator, denumire_utilizator, status")
      .eq("cod_utilizator", numericId);

    console.log("[DEBUG] Rezultat căutare număr:", {
      found: users?.length || 0,
      error: findError,
      users: users,
    });

    // not found with numericId, try as string
    if ((!users || users.length === 0) && !findError) {
      console.log("[DEBUG] Încercăm căutare ca string:", identifier);
      const result = await supabase
        .from("nom_utilizatori")
        .select("cod_utilizator, denumire_utilizator, status")
        .eq("cod_utilizator", identifier);

      users = result.data;
      findError = result.error;

      console.log("[DEBUG] Rezultat căutare string:", {
        found: users?.length || 0,
        error: findError,
        users: users,
      });
    }

    if (findError) {
      console.error("[DEBUG] Eroare la căutare utilizator:", findError);
      return NextResponse.json(
        { success: false, error: "Eroare la căutarea utilizatorului" },
        { status: 500 }
      );
    }

    if (!users || users.length === 0) {
      console.error("[DEBUG] Utilizator negăsit pentru cod:", numericId);

      return NextResponse.json(
        { success: false, error: "Utilizatorul nu a fost găsit" },
        { status: 404 }
      );
    }

    const user = users[0];

    // Verificare utilizator activ
    if (user.status && user.status.toLowerCase() !== "active") {
      return NextResponse.json(
        { success: false, error: "Contul este inactiv" },
        { status: 403 }
      );
    }

    // Generare hash
    const hashedPassword = await bcrypt.hash(password, 10);

    // Actualizare parola baza de date
    const { error: updateError } = await supabase
      .from("nom_utilizatori")
      .update({
        password_hash: hashedPassword,
        updated_at: new Date().toISOString(),
      })
      .eq("cod_utilizator", numericId);

    if (updateError) {
      console.error("[DEBUG] Eroare la actualizare parolă:", updateError);
      return NextResponse.json(
        { success: false, error: "Eroare la actualizare parolă" },
        { status: 500 }
      );
    }

    console.log(
      `Parolă resetată cu succes pentru: ${user.denumire_utilizator} (${identifier})`
    );

    return NextResponse.json({
      success: true,
      message: `Parola a fost schimbată cu succes pentru ${user.denumire_utilizator}!`,
    });
  } catch (error) {
    console.error("💥 Eroare la resetare parolă:", error);
    return NextResponse.json(
      { success: false, error: "Eroare internă a serverului" },
      { status: 500 }
    );
  }
}
