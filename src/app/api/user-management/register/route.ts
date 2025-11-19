import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// Coduri mock valide pentru dezvoltare (când Supabase nu e configurat)
const VALID_MOCK_FUNCTII = ["DIR", "SSEF", "EXP", "CONS", "REF"];
const VALID_MOCK_SERVICII = [
  "DTITS",
  "SERV-DEV",
  "SERV-INF",
  "SERV-SEC",
  "SERV-SUP",
];

interface RegisterRequest {
  codUtilizator: string;
  denumireUtilizator: string;
  email: string;
  password: string;
  confirmPassword: string;
  codFunctie: string;
  codServ: string;
  numarMatricol?: string;
}

interface RegisterResponse {
  success: boolean;
  message?: string;
  error?: string;
  user?: {
    id: number;
    codUtilizator: string;
    denumireUtilizator: string;
    email: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Permitem înregistrarea și în modul mock (fără Supabase)
    if (!isSupabaseConfigured) {
      console.warn(
        "⚠️ Supabase nu este configurat. Rulare în mod dezvoltare cu date mock."
      );
    }

    const body: RegisterRequest = await request.json();
    const {
      codUtilizator,
      denumireUtilizator,
      email,
      password,
      confirmPassword,
      codFunctie,
      codServ,
      numarMatricol,
    } = body;

    console.log("📝 Încercare de înregistrare pentru:", codUtilizator);

    // Validări
    if (
      !codUtilizator ||
      !denumireUtilizator ||
      !email ||
      !password ||
      !confirmPassword ||
      !codFunctie ||
      !codServ
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Toate câmpurile obligatorii trebuie completate",
        },
        { status: 400 }
      );
    }

    // Validare email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: "Adresa de email nu este validă",
        },
        { status: 400 }
      );
    }

    // Validare parolă
    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: "Parola trebuie să aibă cel puțin 6 caractere",
        },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "Parolele nu se potrivesc",
        },
        { status: 400 }
      );
    }

    // Verifică dacă cod utilizator există deja
    if (isSupabaseConfigured) {
      const { data: existingUserByCode, error: codeError } = await supabase
        .from("nom_utilizatori")
        .select("id")
        .eq("cod_utilizator", codUtilizator)
        .maybeSingle();

      if (existingUserByCode && !codeError) {
        return NextResponse.json(
          {
            success: false,
            error: "Codul de utilizator există deja în sistem",
          },
          { status: 409 }
        );
      }
    }

    // Verifică dacă email există deja
    if (isSupabaseConfigured) {
      const { data: existingUserByEmail, error: emailError } = await supabase
        .from("nom_utilizatori")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (existingUserByEmail && !emailError) {
        return NextResponse.json(
          {
            success: false,
            error: "Adresa de email este deja înregistrată",
          },
          { status: 409 }
        );
      }
    }

    // Verifică dacă funcția există
    if (isSupabaseConfigured) {
      const { data: functieExists, error: functieError } = await supabase
        .from("nom_functii")
        .select("cod_functie")
        .eq("cod_functie", codFunctie)
        .maybeSingle();

      if (functieError || !functieExists) {
        console.error("❌ Funcția nu există:", codFunctie, functieError);
        return NextResponse.json(
          {
            success: false,
            error: "Funcția selectată nu este validă",
          },
          { status: 400 }
        );
      }
    } else {
      // Validare mock când Supabase nu e configurat
      if (!VALID_MOCK_FUNCTII.includes(codFunctie)) {
        return NextResponse.json(
          {
            success: false,
            error: "Funcția selectată nu este validă",
          },
          { status: 400 }
        );
      }
    }

    // Verifică dacă serviciul există
    if (isSupabaseConfigured) {
      const { data: serviciuExists, error: serviciuError } = await supabase
        .from("nom_servicii")
        .select("cod_serv")
        .eq("cod_serv", codServ)
        .maybeSingle();

      if (serviciuError || !serviciuExists) {
        console.error("❌ Serviciul nu există:", codServ, serviciuError);
        return NextResponse.json(
          {
            success: false,
            error: "Serviciul selectat nu este valid",
          },
          { status: 400 }
        );
      }
    } else {
      // Validare mock când Supabase nu e configurat
      if (!VALID_MOCK_SERVICII.includes(codServ)) {
        return NextResponse.json(
          {
            success: false,
            error: "Serviciul selectat nu este valid",
          },
          { status: 400 }
        );
      }
    }

    // Hash parola
    const hashedPassword = await bcrypt.hash(password, 12);

    // Creează utilizatorul nou în nom_utilizatori
    if (!isSupabaseConfigured) {
      // Mod mock - returnează succes fără a salva în DB
      console.warn(
        "⚠️ Mod dezvoltare: Înregistrare simulată (Supabase nu e configurat)"
      );
      return NextResponse.json(
        {
          success: true,
          message: "Cont creat cu succes (mod dezvoltare - date mock)",
          user: {
            id: Math.floor(Math.random() * 10000),
            codUtilizator: codUtilizator,
            denumireUtilizator: denumireUtilizator,
            email: email,
          },
          mock: true,
        },
        { status: 201 }
      );
    }

    const { data: newUser, error: createError } = await supabase
      .from("nom_utilizatori")
      .insert([
        {
          cod_utilizator: codUtilizator,
          denumire_utilizator: denumireUtilizator,
          email: email,
          password_hash: hashedPassword,
          cod_functie: codFunctie,
          cod_serv: codServ,
          numar_matricol: numarMatricol || null,
          status: "active",
          background_color: "#f9fafb",
        },
      ])
      .select()
      .single();

    if (createError) {
      console.error("❌ Eroare la crearea utilizatorului:", createError);
      return NextResponse.json(
        {
          success: false,
          error: "Eroare la crearea contului. Încearcă din nou.",
        },
        { status: 500 }
      );
    }

    console.log("✅ Utilizator creat cu succes:", newUser.denumire_utilizator);

    const response: RegisterResponse = {
      success: true,
      message: `Cont creat cu succes! Bun venit, ${newUser.denumire_utilizator}!`,
      user: {
        id: newUser.id,
        codUtilizator: newUser.cod_utilizator,
        denumireUtilizator: newUser.denumire_utilizator,
        email: newUser.email,
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("💥 Eroare la înregistrare:", error);

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
    message: "API Register funcționează",
    timestamp: new Date().toISOString(),
  });
}
