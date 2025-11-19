import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface NomUtilizatoriRow {
  cod_utilizator: number; // Supabase converts bigint to number
  denumire_utilizator: string;
  cod_functie: string;
  numar_matricol: number | null; // integer in database
  cod_serv: string;
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("nom_utilizatori")
      .select(
        "cod_utilizator, denumire_utilizator, cod_functie, numar_matricol, cod_serv"
      )
      .order("denumire_utilizator", { ascending: true });

    if (error) {
      console.error("❌ Eroare la obținerea utilizatorilor:", error);
      return NextResponse.json(
        { error: "Eroare la obținerea utilizatorilor" },
        { status: 500 }
      );
    }

    const users = (data || []) as NomUtilizatoriRow[];

    console.log(`✅ Găsiți ${users.length} utilizatori`);

    return NextResponse.json({
      success: true,
      data: users.map((user) => ({
        id: user.cod_utilizator,
        name: user.denumire_utilizator,
        role: user.cod_functie,
        matricol: user.numar_matricol,
        service: user.cod_serv,
        label: `${user.denumire_utilizator} (${
          user.numar_matricol || "N/A"
        }) - ${user.cod_serv.toUpperCase()}`,
      })),
    });
  } catch (error) {
    console.error("💥 Eroare la procesarea utilizatorilor:", error);
    return NextResponse.json(
      { error: "Eroare internă de server" },
      { status: 500 }
    );
  }
}
