import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type ApiProfilePayload = {
  id: number;
  identifier: string;
  name: string;
  role: string;
  department: string | null;
  email: string;
  badge: string | null;
  position: string | null;
  employeeCode: string | null;
  unit: string | null;
  phone: string | null;
  address: string | null;
  birthDate: string | null;
  hireDate: string | null;
  status: string;
};

function parseNumericId(value: string | number | null | undefined) {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function normalizeUserRecord(
  user: Record<string, unknown>,
  identifierHint?: string
): ApiProfilePayload {
  const safe = user as Record<string, unknown>;
  const identifier =
    (safe.identifier as string | undefined) ||
    (safe.cod_utilizator as string | undefined) ||
    identifierHint ||
    "";

  const fallbackId =
    parseNumericId(safe.id as number | string | undefined) ??
    parseNumericId(identifier) ??
    Date.now();

  return {
    id: fallbackId,
    identifier,
    name:
      (safe.name as string | undefined) ||
      (safe.denumire_utilizator as string | undefined) ||
      "Utilizator",
    role:
      (safe.role as string | undefined) ||
      (safe.tip_functie as string | undefined) ||
      (safe.cod_functie as string | undefined) ||
      "user",
    department:
      (safe.department as string | null | undefined) ??
      (safe.cod_serv as string | undefined) ??
      null,
    email:
      (safe.email as string | undefined) ||
      (safe.adresa_email as string | undefined) ||
      `${identifier}@dtits.ro`,
    badge:
      (safe.badge as string | null | undefined) ??
      (safe.numar_matricol as string | undefined) ??
      null,
    position:
      (safe.position as string | null | undefined) ??
      (safe.cod_functie as string | undefined) ??
      null,
    employeeCode:
      (safe.employeeCode as string | null | undefined) ??
      (safe.cod_utilizator as string | undefined) ??
      null,
    unit:
      (safe.unit as string | null | undefined) ??
      (safe.cod_serv as string | undefined) ??
      null,
    phone:
      (safe.phone as string | null | undefined) ??
      (safe.telefon as string | undefined) ??
      null,
    address:
      (safe.address as string | null | undefined) ??
      (safe.adresa as string | undefined) ??
      null,
    birthDate:
      (safe.birthDate as string | null | undefined) ??
      (safe.data_nastere as string | undefined) ??
      null,
    hireDate:
      (safe.hireDate as string | null | undefined) ??
      (safe.data_angajare as string | undefined) ??
      null,
    status: (safe.status as string | undefined) || "active",
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get("userId");
    const identifierParam = searchParams.get("identifier");

    if (!userIdParam && !identifierParam) {
      return NextResponse.json(
        { success: false, error: "ID sau cod utilizator este obligatoriu" },
        { status: 400 }
      );
    }

    const identifierToUse = identifierParam || userIdParam || undefined;
    const numericId = parseNumericId(userIdParam);

    let userRecord: Record<string, unknown> | null = null;
    let source: "users" | "nom" | null = null;

    if (numericId !== null) {
      const result = await supabase
        .from("users")
        .select("*")
        .eq("id", numericId)
        .maybeSingle();
      if (result.data) {
        userRecord = result.data as Record<string, unknown>;
        source = "users";
      }
    }

    if (!userRecord && identifierToUse) {
      const result = await supabase
        .from("users")
        .select("*")
        .eq("identifier", identifierToUse)
        .maybeSingle();
      if (result.data) {
        userRecord = result.data as Record<string, unknown>;
        source = "users";
      }
    }

    if (!userRecord && identifierToUse) {
      const result = await supabase
        .from("nom_utilizatori")
        .select("*")
        .eq("cod_utilizator", identifierToUse)
        .maybeSingle();
      if (result.data) {
        userRecord = result.data as Record<string, unknown>;
        source = "nom";
      }
    }

    if (!userRecord) {
      return NextResponse.json(
        { success: false, error: "Utilizatorul nu a fost găsit" },
        { status: 404 }
      );
    }

    const userPayload = normalizeUserRecord(userRecord, identifierToUse);

    return NextResponse.json({
      success: true,
      user: userPayload,
      canEdit: source !== "nom",
    });
  } catch (error) {
    console.error("Eroare la preluarea profilului:", error);
    return NextResponse.json(
      { success: false, error: "Eroare internă de server" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, identifier, name, email, phone, address } = body;

    if (!userId && !identifier) {
      return NextResponse.json(
        { success: false, error: "ID sau cod utilizator este obligatoriu" },
        { status: 400 }
      );
    }

    const identifierToUse = identifier || userId?.toString();
    const numericId =
      typeof userId === "number"
        ? userId
        : typeof userId === "string"
        ? parseNumericId(userId)
        : null;

    const updateData: Record<string, string> = {};
    if (typeof name === "string") updateData.name = name;
    if (typeof email === "string") updateData.email = email;
    if (typeof phone === "string") updateData.phone = phone;
    if (typeof address === "string") updateData.address = address;

    if (!Object.keys(updateData).length) {
      return NextResponse.json(
        { success: false, error: "Nu există câmpuri de actualizat" },
        { status: 400 }
      );
    }

    let updatedRecord: Record<string, unknown> | null = null;
    let updatedSource: "users" | "nom" | null = null;

    if (numericId !== null) {
      const result = await supabase
        .from("users")
        .update(updateData)
        .eq("id", numericId)
        .select("*")
        .maybeSingle();
      if (result.data) {
        updatedRecord = result.data as Record<string, unknown>;
        updatedSource = "users";
      }
    }

    if (!updatedRecord && identifierToUse) {
      const result = await supabase
        .from("users")
        .update(updateData)
        .eq("identifier", identifierToUse)
        .select("*")
        .maybeSingle();
      if (result.data) {
        updatedRecord = result.data as Record<string, unknown>;
        updatedSource = "users";
      }
    }

    if (!updatedRecord && identifierToUse) {
      const nomUpdateData: Record<string, unknown> = {};
      if (typeof name === "string") {
        nomUpdateData.denumire_utilizator = name;
      }
      if (typeof email === "string") {
        nomUpdateData.email = email;
      }
      if (Object.keys(nomUpdateData).length) {
        const result = await supabase
          .from("nom_utilizatori")
          .update(nomUpdateData)
          .eq("cod_utilizator", identifierToUse)
          .select("*")
          .maybeSingle();
        if (result.data) {
          updatedRecord = result.data as Record<string, unknown>;
          updatedSource = "nom";
        }
      }
    }

    if (!updatedRecord) {
      return NextResponse.json(
        { success: false, error: "Eroare la actualizarea profilului" },
        { status: 500 }
      );
    }

    const normalizedUser = normalizeUserRecord(
      updatedRecord,
      identifierToUse || undefined
    );

    return NextResponse.json({
      success: true,
      user: normalizedUser,
      canEdit: updatedSource !== "nom",
      message:
        updatedSource === "nom"
          ? "Profilul a fost actualizat parțial (date sincronizate din sistem)."
          : "Profilul a fost actualizat cu succes",
    });
  } catch (error) {
    console.error("Eroare la actualizarea profilului:", error);
    return NextResponse.json(
      { success: false, error: "Eroare internă de server" },
      { status: 500 }
    );
  }
}
