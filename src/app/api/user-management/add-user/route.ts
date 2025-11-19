import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email și parolă sunt obligatorii" },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: "Parola trebuie să aibă cel puțin 6 caractere",
        },
        { status: 400 }
      );
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    let errorMsg = "Eroare la adăugare utilizator";
    if (err instanceof Error) {
      errorMsg = err.message;
    }
    return NextResponse.json(
      { success: false, error: errorMsg, details: err },
      { status: 500 }
    );
  }
}
