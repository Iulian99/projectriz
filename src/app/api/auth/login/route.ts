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
          error: "Identifier și parola sunt obligatorii",
        },
        { status: 400 }
      );
    }

    // Caută utilizatorul în Supabase
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('identifier', identifier)
      .single();

    if (fetchError || !user) {
      console.log("❌ Utilizator nu a fost găsit:", identifier);
      return NextResponse.json(
        {
          success: false,
          error: "Utilizator sau parolă incorectă",
        },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log("❌ Parolă incorectă pentru:", identifier);
      return NextResponse.json(
        {
          success: false,
          error: "Utilizator sau parolă incorectă",
        },
        { status: 401 }
      );
    }

    console.log("✅ Login reușit pentru:", user.name);

    const response: LoginResponse = {
      success: true,
      message: `Bun venit, ${user.name}!`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        identifier: user.identifier,
        avatar: user.avatar || undefined,
        department: user.department || undefined,
        backgroundColor: (user as { backgroundColor?: string }).backgroundColor || "#f9fafb",
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
