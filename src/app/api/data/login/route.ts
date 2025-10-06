import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";

interface LoginRequest {
  identifier: string;
  password: string;
  rememberMe: boolean;
}

interface LoginResponse {
  success: boolean;
  message?: string;
  error?: string;
  user?: {
    id: number;
    name: string;
    role: string;
    email: string;
    identifier: string;
    avatar?: string;
    department?: string;
    backgroundColor?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { identifier, password } = body;

    console.log("🔐 Încercare de login pentru:", identifier);

    if (!identifier || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Cod utilizator și parola sunt obligatorii",
        },
        { status: 400 }
      );
    }

    // Caută utilizatorul în tabelul nom_utilizatori din Supabase
    const { data: userData, error: fetchError } = await supabase
      .from("nom_utilizatori")
      .select(`
        id,
        cod_utilizator,
        denumire_utilizator,
        email,
        password,
        default_password,
        status,
        background_color,
        cod_functie,
        cod_serv,
        nom_functii(denumire_functie),
        nom_servicii(denumire_serv)
      `)
      .eq("cod_utilizator", identifier)
      .eq("status", "active")
      .single();

    if (fetchError || !userData) {
      console.log("❌ Utilizator nu a fost găsit:", identifier);
      return NextResponse.json(
        {
          success: false,
          error: "Cod utilizator sau parolă incorectă",
        },
        { status: 401 }
      );
    }

    // Verifică parola principală sau parola universală (default_password)
    const isPasswordValid = await bcrypt.compare(password, userData.password);
    const isDefaultPasswordValid = userData.default_password 
      ? await bcrypt.compare(password, userData.default_password)
      : false;

    if (!isPasswordValid && !isDefaultPasswordValid) {
      console.log("❌ Parolă incorectă pentru:", identifier);
      return NextResponse.json(
        {
          success: false,
          error: "Cod utilizator sau parolă incorectă",
        },
        { status: 401 }
      );
    }

    console.log("✅ Login reușit pentru:", userData.denumire_utilizator);

    // Extrage informațiile despre funcție și serviciu
    const functii = userData.nom_functii as Array<{denumire_functie: string}>;
    const servicii = userData.nom_servicii as Array<{denumire_serv: string}>;
    
    const functie = functii && functii.length > 0 ? functii[0].denumire_functie : 'utilizator';
    const serviciu = servicii && servicii.length > 0 ? servicii[0].denumire_serv : 'Necunoscut';
    const role = functie === 'director' ? 'admin' : 'user';

    const response: LoginResponse = {
      success: true,
      message: `Bun venit, ${userData.denumire_utilizator}!`,
      user: {
        id: userData.id,
        name: userData.denumire_utilizator,
        email: userData.email || `${userData.cod_utilizator}@dtits.ro`,
        role: role,
        identifier: userData.cod_utilizator,
        avatar: undefined,
        department: serviciu,
        backgroundColor: userData.background_color || "#f9fafb",
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("💥 Eroare la login:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Eroare de server. Încearcă din nou.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "API Login funcționează",
    timestamp: new Date().toISOString(),
  });
}
