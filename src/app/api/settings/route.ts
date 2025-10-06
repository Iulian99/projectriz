import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET - Setari
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId este necesar" },
        { status: 400 }
      );
    }

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

    return NextResponse.json({
      success: true,
      settings: {
        backgroundColor:
          (user as { backgroundColor?: string }).backgroundColor || "#f9fafb",
      },
    });
  } catch (error) {
    console.error("Eroare la obținerea setărilor:", error);
    return NextResponse.json(
      { success: false, error: "Eroare internă a serverului" },
      { status: 500 }
    );
  }
}

// PATCH - actualizare Setari
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, backgroundColor } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId este necesar" },
        { status: 400 }
      );
    }

    if (!backgroundColor) {
      return NextResponse.json(
        { success: false, error: "backgroundColor este necesar" },
        { status: 400 }
      );
    }

    // Formatul culorii (hex color)
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexColorRegex.test(backgroundColor)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Formatul culorii nu este valid (folosește format hex: #ffffff)",
        },
        { status: 400 }
      );
    }

    // Verificare utilizator existent
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("id", parseInt(userId))
      .single();

    if (fetchError || !existingUser) {
      return NextResponse.json(
        { success: false, error: "Utilizatorul nu a fost găsit" },
        { status: 404 }
      );
    }

    // Actualizare culoarea de fundal
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({ backgroundColor })
      .eq("id", parseInt(userId))
      .select()
      .single();

    if (updateError || !updatedUser) {
      return NextResponse.json(
        { success: false, error: "Eroare la actualizarea setărilor" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Setările au fost actualizate cu succes",
      settings: {
        backgroundColor: (updatedUser as { backgroundColor?: string })
          .backgroundColor,
      },
    });
  } catch (error) {
    console.error("Eroare la actualizarea setărilor:", error);
    return NextResponse.json(
      { success: false, error: "Eroare internă a serverului" },
      { status: 500 }
    );
  }
}
