import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId este necesar" },
        { status: 400 }
      );
    }

    // Obține informațiile utilizatorului curent (șeful)
    const { data: managerData, error: managerError } = await supabase
      .from("nom_utilizatori")
      .select("cod_serv, cod_functie")
      .eq("cod_utilizator", parseInt(userId))
      .limit(1);

    if (managerError) {
      console.error("Supabase error:", managerError);
      return NextResponse.json(
        { error: "Eroare la căutarea utilizatorului" },
        { status: 500 }
      );
    }

    if (!managerData || managerData.length === 0) {
      return NextResponse.json(
        { error: "Utilizatorul nu a fost găsit" },
        { status: 404 }
      );
    }

    const manager = managerData[0];

    // Verifică dacă utilizatorul este șef
    if (manager.cod_functie !== "sef") {
      return NextResponse.json(
        { error: "Doar șefii pot vedea membrii echipei" },
        { status: 403 }
      );
    }

    // Obține toți consilieri și experți din același serviciu
    const { data: teamMembersData, error: teamError } = await supabase
      .from("nom_utilizatori")
      .select(
        "cod_utilizator, denumire_utilizator, cod_functie, numar_matricol, cod_serv, email, background_color"
      )
      .eq("cod_serv", manager.cod_serv)
      .in("cod_functie", ["consilier", "expert"])
      .order("cod_functie", { ascending: true })
      .order("denumire_utilizator", { ascending: true });

    if (teamError) {
      console.error("Supabase error:", teamError);
      return NextResponse.json(
        { error: "Eroare la încărcarea membrilor echipei" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      codServ: manager.cod_serv,
      totalMembers: teamMembersData?.length || 0,
      members: (teamMembersData || []).map((member) => ({
        id: member.cod_utilizator,
        name: member.denumire_utilizator,
        position: member.cod_functie,
        identifier: member.numar_matricol,
        department: member.cod_serv,
        email: member.email,
        backgroundColor: member.background_color,
      })),
    });
  } catch (error) {
    console.error("Error fetching team members:", error);
    return NextResponse.json(
      { error: "Eroare la încărcarea membrilor echipei" },
      { status: 500 }
    );
  }
}
