import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// GET - Obține activitățile utilizatorului
export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        {
          error:
            "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
        },
        { status: 500 }
      );
    }
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const date = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Construiește query-ul pentru Supabase (raportul zilnic)
    let raportQuery = supabase
      .from("raport")
      .select(
        `
        raport_id,
        raport_uid,
        raport_data,
        activitate,
        atributii,
        act,
        lucrare,
        intrare,
        iesire,
        principale,
        conexe,
        neproductive,
        total,
        urgenta,
        utilizareit,
        denumireit,
        tipactivitate
      `
      )
      .eq("raport_uid", parseInt(userId))
      .order("raport_data", { ascending: false })
      .order("raport_id", { ascending: false });

    // Adaugă filtrele de dată
    if (date) {
      const [yearStr, monthStr, dayStr] = date.split("-");
      const targetDate = new Date(
        Date.UTC(
          parseInt(yearStr || "0", 10),
          parseInt(monthStr || "1", 10) - 1,
          parseInt(dayStr || "1", 10)
        )
      );
      const startRange = new Date(targetDate);
      startRange.setUTCDate(startRange.getUTCDate() - 1);
      const endRange = new Date(targetDate);
      endRange.setUTCDate(endRange.getUTCDate() + 1);

      raportQuery = raportQuery
        .gte("raport_data", startRange.toISOString())
        .lt("raport_data", endRange.toISOString());
    } else if (startDate && endDate) {
      raportQuery = raportQuery
        .gte("raport_data", new Date(startDate).toISOString())
        .lte("raport_data", new Date(endDate).toISOString());
    }

    const { data: activities, error } = await raportQuery;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch activities" },
        { status: 500 }
      );
    }

    const raportRows = activities || [];

    // Obține detalii utilizatori într-un singur query separat
    const userIds = Array.from(
      new Set(
        raportRows
          .map((row) =>
            row?.raport_uid !== undefined && row?.raport_uid !== null
              ? String(row.raport_uid)
              : null
          )
          .filter((value): value is string => value !== null)
      )
    );

    let usersMap = new Map<
      string,
      { cod_utilizator: string; denumire_utilizator: string }
    >();

    if (userIds.length > 0) {
      const { data: usersData, error: usersError } = await supabase
        .from("nom_utilizatori")
        .select("cod_utilizator, denumire_utilizator")
        .in("cod_utilizator", userIds);

      if (usersError) {
        console.error("Supabase users fetch error:", usersError);
      } else if (usersData) {
        usersMap = new Map(
          usersData.map((user) => [String(user.cod_utilizator), user])
        );
      }
    }

    const roDateFormatter = new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Europe/Bucharest",
    });
    const roDisplayFormatter = new Intl.DateTimeFormat("ro-RO", {
      timeZone: "Europe/Bucharest",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const formattedActivities = raportRows.map((activity) => {
      const raportData = activity as unknown as {
        raport_id: number;
        raport_uid: number;
        raport_data: string;
        activitate: string;
        atributii: string | null;
        act: string | null;
        lucrare: string | null;
        total: number | null;
        tipactivitate: string;
        denumireit: string | null;
        urgenta: string | null;
        utilizareit: string | null;
        intrare: string | null;
        iesire: string | null;
        principale: number | null;
        conexe: number | null;
        neproductive: number | null;
      };

      const raportDate = new Date(raportData.raport_data);
      const userInfo = usersMap.get(String(raportData.raport_uid));
      const localDateString = roDateFormatter.format(raportDate);

      return {
        id: raportData.raport_id,
        date: localDateString,
        displayDate: roDisplayFormatter.format(raportDate),
        employee: userInfo
          ? `${userInfo.denumire_utilizator} [${userInfo.cod_utilizator}]`
          : `Utilizator ${raportData.raport_uid}`,
        activity: raportData.activitate,
        work: raportData.lucrare || "-",
        status: raportData.tipactivitate || "Completat",
        userId: raportData.raport_uid,
        timeSpent: raportData.total ?? 0,
        createdAt: raportDate.toISOString(),
        updatedAt: raportDate.toISOString(),
        baseAct: raportData.act || "",
        attributes: raportData.atributii || "",
        complexity: raportData.urgenta || "",
        observations: raportData.denumireit || "",
        utilization: raportData.utilizareit || "",
        urgency: raportData.urgenta || "",
        itDetails: raportData.denumireit || "",
        activityType: raportData.tipactivitate || "Completat",
        entryReference: raportData.intrare || "",
        exitReference: raportData.iesire || "",
        mainActivities: raportData.principale ?? 0,
        relatedActivities: raportData.conexe ?? 0,
        nonProductiveActivities: raportData.neproductive ?? 0,
      };
    });

    const filteredActivities = date
      ? formattedActivities.filter((activity) => activity.date === date)
      : formattedActivities;

    return NextResponse.json({
      success: true,
      data: filteredActivities,
    });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST - Creează o activitate nouă
export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        {
          error:
            "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
        },
        { status: 500 }
      );
    }
    const data = await request.json();
    console.log("POST Request data:", data);

    // Validare câmpuri obligatorii
    if (!data.activity || !data.work || !data.userId) {
      return NextResponse.json(
        { error: "Missing required fields: activity, work, userId" },
        { status: 400 }
      );
    }

    // Validare timeSpent - nu poate fi mai mare de 24 ore sau negativă
    if (data.timeSpent !== undefined) {
      const timeSpent = parseFloat(data.timeSpent);
      if (isNaN(timeSpent) || timeSpent < 0 || timeSpent > 24) {
        return NextResponse.json(
          { error: "timeSpent must be a number between 0 and 24 hours" },
          { status: 400 }
        );
      }
    }

    console.log("Creating activity with data:", data);

    // Construim datele pentru Supabase
    const itSystems = typeof data.itSystems === "string" ? data.itSystems : "";
    const itSoftware =
      typeof data.itSoftware === "string" ? data.itSoftware : "";

    const itDescription = [itSystems, itSoftware]
      .map((value, index) => {
        const label = index === 0 ? "Sisteme" : "Software";
        return value ? `${label}: ${value}` : "";
      })
      .filter(Boolean)
      .join(" | ");

    const usesIt = Boolean(itSystems.trim() || itSoftware.trim());

    const activityData = {
      raport_uid: parseInt(data.userId),
      raport_data: data.date
        ? new Date(data.date).toISOString()
        : new Date().toISOString(),
      activitate: data.activity,
      atributii: data.attributes || null,
      act: data.baseAct || null,
      lucrare: data.work || null,
      intrare: data.entryReference || null,
      iesire: data.exitReference || null,
      principale: data.mainActivities ?? 0,
      conexe: data.relatedActivities ?? 0,
      neproductive: data.nonProductiveActivities ?? 0,
      total: data.timeSpent ?? 0,
      urgenta:
        typeof data.urgency === "boolean" ? (data.urgency ? "DA" : "NU") : "NU",
      utilizareit: usesIt ? "DA" : "NU",
      denumireit: itDescription || data.observations || null,
      tipactivitate: data.status || data.activityType || "Completat",
    };

    const { data: activity, error } = await supabase
      .from("raport")
      .insert([activityData])
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to create activity" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: activity,
    });
  } catch (error) {
    console.error("Error creating activity:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT - Actualizează o activitate existentă
export async function PUT(request: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        {
          error:
            "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
        },
        { status: 500 }
      );
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const data = await request.json();

    // Validare ID
    if (!id) {
      return NextResponse.json(
        { error: "Activity ID is required" },
        { status: 400 }
      );
    }

    // Validare câmpuri obligatorii
    if (!data.activity || !data.work || !data.userId) {
      return NextResponse.json(
        { error: "Missing required fields: activity, work, userId" },
        { status: 400 }
      );
    }

    // Validare timeSpent - nu poate fi mai mare de 24 ore sau negativă
    if (data.timeSpent !== undefined) {
      const timeSpent = parseFloat(data.timeSpent);
      if (isNaN(timeSpent) || timeSpent < 0 || timeSpent > 24) {
        return NextResponse.json(
          { error: "timeSpent must be a number between 0 and 24 hours" },
          { status: 400 }
        );
      }
    }

    // Verifică dacă activitatea există
    const { data: existingActivity, error: fetchError } = await supabase
      .from("raport")
      .select("*")
      .eq("raport_id", Number(id))
      .single();

    if (fetchError || !existingActivity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    console.log("Updating activity with data:", data);

    // Actualizează activitatea cu toate câmpurile disponibile
    const updateItSystems =
      data.itSystems !== undefined ? data.itSystems : null;
    const updateItSoftware =
      data.itSoftware !== undefined ? data.itSoftware : null;

    const combinedItDescription = (() => {
      if (updateItSystems === null && updateItSoftware === null) {
        return existingActivity.denumireit;
      }

      const parts = [
        updateItSystems
          ? `Sisteme: ${updateItSystems}`
          : updateItSystems === ""
          ? ""
          : undefined,
        updateItSoftware
          ? `Software: ${updateItSoftware}`
          : updateItSoftware === ""
          ? ""
          : undefined,
      ].filter((value) => value !== undefined && value !== "");

      if (parts.length === 0) {
        return data.observations || null;
      }

      return parts.join(" | ");
    })();

    const updatedUsesIt = (() => {
      if (updateItSystems === null && updateItSoftware === null) {
        return existingActivity.utilizareit === "DA";
      }

      const systemsValue = updateItSystems ?? "";
      const softwareValue = updateItSoftware ?? "";
      return Boolean(systemsValue.trim() || softwareValue.trim());
    })();

    const updateData = {
      activitate: data.activity,
      lucrare: data.work,
      tipactivitate:
        data.status || data.activityType || existingActivity.tipactivitate,
      raport_uid: parseInt(data.userId),
      raport_data: data.date
        ? new Date(data.date).toISOString()
        : existingActivity.raport_data,
      act: data.baseAct ?? existingActivity.act,
      atributii:
        data.attributes !== undefined
          ? data.attributes
          : existingActivity.atributii,
      intrare:
        data.entryReference !== undefined
          ? data.entryReference
          : existingActivity.intrare,
      iesire:
        data.exitReference !== undefined
          ? data.exitReference
          : existingActivity.iesire,
      principale:
        data.mainActivities !== undefined
          ? data.mainActivities
          : existingActivity.principale,
      conexe:
        data.relatedActivities !== undefined
          ? data.relatedActivities
          : existingActivity.conexe,
      neproductive:
        data.nonProductiveActivities !== undefined
          ? data.nonProductiveActivities
          : existingActivity.neproductive,
      urgenta:
        typeof data.urgency === "boolean"
          ? data.urgency
            ? "DA"
            : "NU"
          : existingActivity.urgenta,
      total:
        data.timeSpent !== undefined ? data.timeSpent : existingActivity.total,
      denumireit:
        combinedItDescription !== undefined && combinedItDescription !== null
          ? combinedItDescription
          : data.observations !== undefined
          ? data.observations
          : existingActivity.denumireit,
      utilizareit: updatedUsesIt ? "DA" : "NU",
    };

    const { data: updatedActivity, error: updateError } = await supabase
      .from("raport")
      .update(updateData)
      .eq("raport_id", Number(id))
      .select()
      .single();

    if (updateError) {
      console.error("Supabase update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update activity" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedActivity,
    });
  } catch (error) {
    console.error("Error updating activity:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE - Șterge o activitate existentă
export async function DELETE(request: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
        },
        { status: 500 }
      );
    }
    const { searchParams } = new URL(request.url);
    const activityId = searchParams.get("id");

    if (!activityId) {
      return NextResponse.json(
        { success: false, error: "ID activitate lipsește" },
        { status: 400 }
      );
    }

    // Verifică dacă activitatea există
    const { data: existingActivity, error: fetchError } = await supabase
      .from("raport")
      .select("*")
      .eq("raport_id", Number(activityId))
      .single();

    if (fetchError || !existingActivity) {
      return NextResponse.json(
        { success: false, error: "Activitatea nu a fost găsită" },
        { status: 404 }
      );
    }

    // Șterge activitatea din baza de date
    const { error: deleteError } = await supabase
      .from("raport")
      .delete()
      .eq("raport_id", Number(activityId));

    if (deleteError) {
      console.error("Supabase delete error:", deleteError);
      return NextResponse.json(
        { success: false, error: "Eroare la ștergerea activității" },
        { status: 500 }
      );
    }

    console.log(`Activity deleted successfully with ID: ${activityId}`);

    return NextResponse.json({
      success: true,
      message: "Activitatea a fost ștearsă cu succes",
    });
  } catch (error) {
    console.error("Eroare la ștergerea activității:", error);
    return NextResponse.json(
      { success: false, error: "Eroare la ștergerea activității" },
      { status: 500 }
    );
  }
}
