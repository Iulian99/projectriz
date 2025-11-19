import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId este obligatoriu" },
        { status: 400 }
      );
    }

    // Obține cod_serv al utilizatorului
    const { data: users, error: userError } = await supabase
      .from("nom_utilizatori")
      .select("cod_serv")
      .eq("cod_utilizator", userId);

    if (userError) {
      console.error("Eroare la căutarea utilizatorului:", userError);
      return NextResponse.json(
        { error: "Eroare la căutarea utilizatorului" },
        { status: 500 }
      );
    }

    if (!users || users.length === 0) {
      console.error("Utilizator negăsit cu ID:", userId);
      return NextResponse.json(
        { error: "Utilizator negăsit" },
        { status: 404 }
      );
    }

    const user = users[0];

    console.log(`📋 Căutare lucrări pentru serviciul: ${user.cod_serv}`);

    // Caută lucrările pentru acest serviciu
    const { data: lucrari, error: lucrariError } = await supabase
      .from("nom_lucrari")
      .select("cod_lucrare, denumire_lucrare")
      .eq("cod_serv", user.cod_serv)
      .order("cod_lucrare", { ascending: true });

    if (lucrariError) {
      console.error("Eroare la încărcarea lucrărilor:", lucrariError);
      return NextResponse.json(
        { error: "Eroare la încărcarea lucrărilor" },
        { status: 500 }
      );
    }

    // Formatează pentru dropdown
    const formattedLucrari =
      lucrari?.map((lucr) => ({
        value: lucr.denumire_lucrare,
        label: lucr.denumire_lucrare,
        cod: lucr.cod_lucrare,
      })) || [];

    console.log(
      `✅ Găsite ${formattedLucrari.length} lucrări pentru ${user.cod_serv}`
    );

    return NextResponse.json(formattedLucrari);
  } catch (error) {
    console.error("Eroare la procesarea lucrărilor:", error);
    return NextResponse.json({ error: "Eroare internă" }, { status: 500 });
  }
}
