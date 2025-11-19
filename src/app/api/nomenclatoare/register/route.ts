import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// Date mock pentru dezvoltare (când Supabase nu e configurat)
const mockFunctii = [
  {
    cod_functie: "DIR",
    denumire_functie: "Director",
    tip_functie: "conducere",
  },
  {
    cod_functie: "SSEF",
    denumire_functie: "Șef serviciu",
    tip_functie: "conducere",
  },
  { cod_functie: "EXP", denumire_functie: "Expert", tip_functie: "executie" },
  {
    cod_functie: "CONS",
    denumire_functie: "Consilier",
    tip_functie: "executie",
  },
  { cod_functie: "REF", denumire_functie: "Referent", tip_functie: "executie" },
];

const mockServicii = [
  {
    cod_serv: "DTITS",
    denumire_serv:
      "Direcția Tehnologia Informației și Telecomunicații Speciale",
    cod_dir: "DTITS",
  },
  {
    cod_serv: "SERV-DEV",
    denumire_serv: "Serviciul Dezvoltare Aplicații",
    cod_dir: "DTITS",
  },
  {
    cod_serv: "SERV-INF",
    denumire_serv: "Serviciul Infrastructură IT",
    cod_dir: "DTITS",
  },
  {
    cod_serv: "SERV-SEC",
    denumire_serv: "Serviciul Securitate Cibernetică",
    cod_dir: "DTITS",
  },
  {
    cod_serv: "SERV-SUP",
    denumire_serv: "Serviciul Support & Help Desk",
    cod_dir: "DTITS",
  },
];

// GET - Obține nomenclatoarele pentru înregistrare
export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      console.warn("⚠️ Supabase nu este configurat. Returnez date mock.");

      const { searchParams } = new URL(request.url);
      const type = searchParams.get("type");

      if (type === "functii") {
        return NextResponse.json({
          success: true,
          data: mockFunctii,
          mock: true,
        });
      }

      if (type === "servicii") {
        return NextResponse.json({
          success: true,
          data: mockServicii,
          mock: true,
        });
      }

      return NextResponse.json({
        success: true,
        functii: mockFunctii,
        servicii: mockServicii,
        mock: true,
      });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    // Dacă se solicită funcții
    if (type === "functii") {
      const { data: functii, error } = await supabase
        .from("nom_functii")
        .select("cod_functie, denumire_functie, tip_functie")
        .order("denumire_functie", { ascending: true });

      if (error) {
        console.error("Eroare la obținerea funcțiilor:", error);
        return NextResponse.json(
          { success: false, error: "Eroare la obținerea funcțiilor" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: functii || [],
      });
    }

    // Dacă se solicită servicii
    if (type === "servicii") {
      const { data: servicii, error } = await supabase
        .from("nom_servicii")
        .select("cod_serv, denumire_serv, cod_dir")
        .order("denumire_serv", { ascending: true });

      if (error) {
        console.error("Eroare la obținerea serviciilor:", error);
        return NextResponse.json(
          { success: false, error: "Eroare la obținerea serviciilor" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: servicii || [],
      });
    }

    // Returnează toate nomenclatoarele
    const [functiiResult, serviciiResult] = await Promise.all([
      supabase
        .from("nom_functii")
        .select("cod_functie, denumire_functie, tip_functie")
        .order("denumire_functie", { ascending: true }),
      supabase
        .from("nom_servicii")
        .select("cod_serv, denumire_serv, cod_dir")
        .order("denumire_serv", { ascending: true }),
    ]);

    if (functiiResult.error || serviciiResult.error) {
      console.error("Eroare la obținerea nomenclatoarelor:", {
        functii: functiiResult.error,
        servicii: serviciiResult.error,
      });
      return NextResponse.json(
        { success: false, error: "Eroare la obținerea datelor" },
        { status: 500 }
      );
    }

    // Returnează datele la nivel de rădăcină pentru compatibilitate cu formularul
    return NextResponse.json({
      success: true,
      functii: functiiResult.data || [],
      servicii: serviciiResult.data || [],
    });
  } catch (error) {
    console.error("Eroare la obținerea nomenclatoarelor:", error);

    // Returnează date mock chiar și în caz de eroare
    console.warn("⚠️ Eroare la accesarea bazei de date. Returnez date mock.");
    return NextResponse.json({
      success: true,
      functii: mockFunctii,
      servicii: mockServicii,
      mock: true,
      error: "Database error - using mock data",
    });
  }
}
