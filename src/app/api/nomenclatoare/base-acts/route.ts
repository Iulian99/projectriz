import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface NomActBazaRow {
  id?: number;
  cod_act?: number | string | null;
  denumire_act?: string | null;
}

export async function GET() {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        {
          success: false,
          error: "Supabase nu este configurat...",
        },
        { status: 500 }
      );
    }

    const { data, error } = await supabase
      .from("nom_act_baza")
      // Notă: în schema actuală nu există coloana "id",
      // așa că selectăm doar câmpurile reale.
      .select("cod_act, denumire_act")
      .order("denumire_act", { ascending: true });

    if (error) {
      console.error("Supabase nom_act_baza error:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Nu am putut încărca lista actelor de bază.",
        },
        { status: 500 }
      );
    }

    const normalized = (data || []).map((row: NomActBazaRow) => {
      const codeValue =
        typeof row.cod_act === "number" || typeof row.cod_act === "string"
          ? String(row.cod_act)
          : "Nespecificat";

      const nameValue =
        (row.denumire_act ?? "").toString().trim() ||
        codeValue ||
        "Act fără nume";

      return {
        // Folosim cod_act ca identificator stabil; dacă lipsește,
        // cădem pe denumire sau un UUID random, doar pentru chei React.
        id: String(row.cod_act ?? row.denumire_act ?? randomUUID()),
        code: codeValue,
        name: nameValue,
      };
    });

    return NextResponse.json({ success: true, data: normalized });
  } catch (error) {
    console.error("Unexpected error fetching base acts:", error);
    return NextResponse.json(
      {
        success: false,
        error: "A apărut o eroare la încărcarea actelor de bază.",
      },
      { status: 500 }
    );
  }
}
