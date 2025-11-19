import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function DELETE(request: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
        },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const activityId = searchParams.get("id");

    if (!activityId) {
      return NextResponse.json(
        { success: false, error: "ID activitate lipsește" },
        { status: 400 }
      );
    }

    const numericId = Number.parseInt(activityId, 10);

    if (Number.isNaN(numericId)) {
      return NextResponse.json(
        { success: false, error: "ID activitate invalid" },
        { status: 400 }
      );
    }

    const { data: existingActivity, error: fetchError } = await supabase
      .from("raport")
      .select("raport_id")
      .eq("raport_id", numericId)
      .maybeSingle();

    if (fetchError) {
      console.error("Supabase fetch error:", fetchError);
      return NextResponse.json(
        { success: false, error: "Eroare la căutarea activității" },
        { status: 500 }
      );
    }

    if (!existingActivity) {
      return NextResponse.json(
        { success: false, error: "Activitatea nu a fost găsită" },
        { status: 404 }
      );
    }

    const { error: deleteError } = await supabase
      .from("raport")
      .delete()
      .eq("raport_id", numericId);

    if (deleteError) {
      console.error("Supabase delete error:", deleteError);
      return NextResponse.json(
        { success: false, error: "Eroare la ștergerea activității" },
        { status: 500 }
      );
    }

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
