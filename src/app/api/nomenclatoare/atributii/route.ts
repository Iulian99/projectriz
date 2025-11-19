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

    // Obține datele utilizatorului pentru a afla cod_serv și cod_functie
    const { data: users, error: userError } = await supabase
      .from("nom_utilizatori")
      .select("cod_serv, cod_functie")
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

    // Obține tip_functie din tabela nom_functii
    const { data: functii, error: functieError } = await supabase
      .from("nom_functii")
      .select("tip_functie")
      .eq("cod_functie", user.cod_functie);

    if (functieError) {
      console.error("Eroare la căutarea funcției:", functieError);
      return NextResponse.json(
        { error: "Eroare la căutarea funcției" },
        { status: 500 }
      );
    }

    if (!functii || functii.length === 0) {
      console.error("Funcție negăsită cu cod:", user.cod_functie);
      return NextResponse.json({ error: "Funcție negăsită" }, { status: 404 });
    }

    const functie = functii[0];

    console.log(
      `📋 Căutare atribuții pentru serviciu: ${user.cod_serv}, tip_functie: ${functie.tip_functie}`
    );

    // Caută atribuțiile pentru acest serviciu și tip de funcție
    const { data: atributii, error: atributiiError } = await supabase
      .from("nom_atributii")
      .select("cod_atributie, denumire_atributie")
      .eq("cod_serv", user.cod_serv)
      .eq("tip_functie", functie.tip_functie)
      .order("cod_atributie", { ascending: true });

    if (atributiiError) {
      console.error("Eroare la încărcarea atribuțiilor:", atributiiError);
      return NextResponse.json(
        { error: "Eroare la încărcarea atribuțiilor" },
        { status: 500 }
      );
    }

    // Formatează pentru dropdown (folosim denumire_atributie ca și value și label)
    const formattedAtributii =
      atributii?.map((atr) => ({
        value: atr.denumire_atributie,
        label: atr.denumire_atributie,
        cod: atr.cod_atributie,
      })) || [];

    console.log(
      `✅ Găsite ${formattedAtributii.length} atribuții pentru ${user.cod_serv}/${functie.tip_functie}`
    );

    return NextResponse.json(formattedAtributii);
  } catch (error) {
    console.error("Eroare la procesarea atribuțiilor:", error);
    return NextResponse.json({ error: "Eroare internă" }, { status: 500 });
  }
}
