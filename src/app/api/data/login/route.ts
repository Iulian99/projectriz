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

const extendedSelect = `
  cod_utilizator,
  denumire_utilizator,
  cod_functie,
  cod_serv,
  email,
  status,
  background_color,
  password_hash,
  default_password_hash,
  nom_functii(denumire_functie)
`;

type SupabaseUserRow = {
  cod_utilizator: string;
  denumire_utilizator: string;
  cod_functie: string;
  cod_serv: string;
  email?: string | null;
  status?: string | null;
  background_color?: string | null;
  password?: string | null;
  default_password?: string | null;
  password_hash?: string | null;
  default_password_hash?: string | null;
  nom_functii?: unknown;
  nom_servicii?: unknown;
};

const PG_UNDEFINED_COLUMN = "42703";

function resolveNestedValue<T extends Record<string, unknown> | undefined>(
  value: unknown
): T | undefined {
  if (!value) {
    return undefined;
  }

  if (Array.isArray(value)) {
    return (value[0] as T) || undefined;
  }

  return value as T;
}

function mapRole(codFunctie: string) {
  const normalized = codFunctie?.toLowerCase();

  if (normalized === "director" || normalized === "dir") {
    return "admin";
  }

  if (normalized === "sef" || normalized === "manager") {
    return "manager";
  }

  return "user";
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

    // Convertește identificatorul la număr și verifică validitatea
    const numericId = Number(identifier);
    console.log(
      "📊 Căutare utilizator - ID numeric:",
      numericId,
      "ID original:",
      identifier
    );

    // Încearcă să citești coloanele extinse; dacă nu există, reexecută cu minimul necesar
    let userData: SupabaseUserRow | null = null;
    let fetchError: unknown = null;

    // Prima încercare cu query extins
    const { data: extendedData, error: extendedError } = await supabase
      .from("nom_utilizatori")
      .select(extendedSelect)
      .eq("cod_utilizator", numericId)
      .maybeSingle();

    console.log("🔍 Prima încercare (extendedSelect):", {
      found: !!extendedData,
      error: extendedError,
      errorCode: (extendedError as { code?: string })?.code,
    });

    if (
      extendedError &&
      (extendedError as { code?: string }).code === PG_UNDEFINED_COLUMN
    ) {
      console.log("⚠️ Coloane lipsă, folosesc query fallback");
      const { data: fallbackData, error: basicError } = await supabase
        .from("nom_utilizatori")
        .select("*")
        .eq("cod_utilizator", numericId)
        .maybeSingle();

      userData = fallbackData as SupabaseUserRow | null;
      fetchError = basicError;
      console.log(
        "📦 Fallback result:",
        fallbackData ? "Utilizator găsit" : "Null",
        "Error:",
        basicError
      );
    } else {
      userData = extendedData as SupabaseUserRow | null;
      fetchError = extendedError;
      console.log(
        "📦 Extended result:",
        extendedData ? "Utilizator găsit" : "Null",
        "Error:",
        extendedError
      );
    }

    if (fetchError || !userData) {
      console.log(
        "❌ Utilizator nu a fost găsit:",
        identifier,
        "Error detaliat:",
        JSON.stringify(fetchError)
      );
      return NextResponse.json(
        {
          success: false,
          error: "Cod utilizator sau parolă incorectă",
        },
        { status: 401 }
      );
    }

    const isActive =
      !userData.status || userData.status.toLowerCase() === "active";

    if (!isActive) {
      console.log("❌ Utilizator inactiv:", identifier);
      return NextResponse.json(
        {
          success: false,
          error: "Contul este inactiv. Contactează administratorul.",
        },
        { status: 403 }
      );
    }

    const hashedPassword = (userData as Record<string, unknown>)["password"] as
      | string
      | undefined;
    const fallbackHashed = (userData as Record<string, unknown>)[
      "default_password"
    ] as string | undefined;

    const storedPasswordHash = userData.password_hash || hashedPassword || null;
    const defaultPasswordHash =
      userData.default_password_hash || fallbackHashed || null;
    const hasHashedPassword = Boolean(
      storedPasswordHash || defaultPasswordHash
    );

    let passwordValid = false;

    if (storedPasswordHash) {
      passwordValid = await bcrypt.compare(password, storedPasswordHash);
    }

    if (!passwordValid && defaultPasswordHash) {
      passwordValid = await bcrypt.compare(password, defaultPasswordHash);
    }

    if (!passwordValid && !hasHashedPassword) {
      // fallback pentru inițializare: acceptă codul utilizatorului sau parola implicită "123456"
      passwordValid =
        password === userData.cod_utilizator || password === "123456";
    }

    if (!passwordValid) {
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

    const functieRow = resolveNestedValue<{ denumire_functie?: string }>(
      userData.nom_functii
    );

    const functie =
      functieRow?.denumire_functie || userData.cod_functie || "utilizator";
    const serviciu = userData.cod_serv || "Necunoscut";
    const role = mapRole(userData.cod_functie || functie);

    const userNumericId = Number.parseInt(userData.cod_utilizator, 10);

    const response: LoginResponse = {
      success: true,
      message: `Bun venit, ${userData.denumire_utilizator}!`,
      user: {
        id: Number.isNaN(userNumericId) ? Date.now() : userNumericId,
        name: userData.denumire_utilizator,
        email: userData.email || `${userData.cod_utilizator}@dtits.ro`,
        role,
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
