import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface RofItem {
  cod_dir: string;
  cod_serv: string;
  cod_rof: string;
  denumire_rof: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const codServ = searchParams.get("cod_serv");
    const userId = searchParams.get("userId");

    // Dacă nu avem cod_serv, încearcă să-l obținem din userId
    let userCodServ = codServ;

    if (!userCodServ && userId) {
      const { data: userData, error: userError } = await supabase
        .from("nom_utilizatori")
        .select("cod_serv")
        .eq("cod_utilizator", Number(userId))
        .single();

      if (userError || !userData) {
        return NextResponse.json(
          { error: "Utilizator negăsit" },
          { status: 404 }
        );
      }

      userCodServ = userData.cod_serv;
    }

    if (!userCodServ) {
      return NextResponse.json(
        { error: "cod_serv sau userId este necesar" },
        { status: 400 }
      );
    }

    console.log("📋 Căutare activități ROF pentru serviciul:", userCodServ);

    // Query pentru activitățile ROF filtrate după serviciu
    const { data: rofData, error: rofError } = await supabase
      .from("nom_rof")
      .select("cod_dir, cod_serv, cod_rof, denumire_rof")
      .eq("cod_serv", userCodServ)
      .order("denumire_rof", { ascending: true });

    if (rofError) {
      console.error("❌ Eroare la obținerea ROF:", rofError);
      return NextResponse.json(
        { error: "Eroare la obținerea activităților ROF" },
        { status: 500 }
      );
    }

    const rofItems = (rofData || []) as RofItem[];

    console.log(
      `✅ Găsite ${rofItems.length} activități ROF pentru ${userCodServ}`
    );

    return NextResponse.json({
      success: true,
      data: rofItems.map((item) => ({
        value: item.cod_rof,
        label: item.denumire_rof,
        codDir: item.cod_dir,
        codServ: item.cod_serv,
      })),
    });
  } catch (error) {
    console.error("💥 Eroare la procesarea ROF:", error);
    return NextResponse.json(
      { error: "Eroare internă de server" },
      { status: 500 }
    );
  }
}
