import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, currentPassword, newPassword } = body;

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Toate câmpurile sunt obligatorii" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: "Parola nouă trebuie să aibă cel puțin 6 caractere",
        },
        { status: 400 }
      );
    }

    // Găsește utilizatorul
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("id", parseInt(userId))
      .single();

    if (fetchError || !user) {
      return NextResponse.json(
        { success: false, error: "Utilizatorul nu a fost găsit" },
        { status: 404 }
      );
    }

    // Verifică parola curentă
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Parola curentă este incorectă" },
        { status: 401 }
      );
    }

    // Hash-uiește parola nouă
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Actualizează parola în baza de date
    const { error: updateError } = await supabase
      .from("users")
      .update({ password: hashedNewPassword })
      .eq("id", parseInt(userId));

    if (updateError) {
      return NextResponse.json(
        { success: false, error: "Eroare la actualizarea parolei" },
        { status: 500 }
      );
    }

    console.log(
      `✅ Parola a fost schimbată cu succes pentru utilizatorul: ${user.name}`
    );

    return NextResponse.json({
      success: true,
      message: "Parola a fost schimbată cu succes",
    });
  } catch (error) {
    console.error("💥 Eroare la schimbarea parolei:", error);

    return NextResponse.json(
      { success: false, error: "Eroare internă a serverului" },
      { status: 500 }
    );
  }
}
