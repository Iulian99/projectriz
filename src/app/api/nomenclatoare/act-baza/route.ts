import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data: acts, error } = await supabase
      .from("nom_act_baza")
      .select("cod_act, denumire_act")
      .order("denumire_act", { ascending: true });

    if (error) {
      console.error("Eroare la încărcarea actelor de bază:", error);
      return NextResponse.json(
        { error: "Eroare la încărcarea actelor de bază" },
        { status: 500 }
      );
    }

    // Formatează pentru dropdown
    const formattedActs =
      acts?.map((act) => ({
        value: act.cod_act,
        label: act.denumire_act,
      })) || [];

    return NextResponse.json(formattedActs);
  } catch (error) {
    console.error("Eroare la procesarea actelor de bază:", error);
    return NextResponse.json({ error: "Eroare internă" }, { status: 500 });
  }
}
