import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";

const prisma = new PrismaClient();

type ActivityType = {
  id: number;
  date: Date;
  activity: string;
  work: string;
  status: string;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
  baseAct?: string;
  attributes?: string;
  complexity?: string;
  timeSpent?: number;
  observations?: string;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const month = searchParams.get("month");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "ID utilizator este obligatoriu" },
        { status: 400 }
      );
    }

    // Preia utilizatorul pentru informațiile de header
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Utilizatorul nu a fost găsit" },
        { status: 404 }
      );
    }

    // Construiește filtrul pentru perioada specificată
    let activities: ActivityType[];

    if (startDate && endDate) {
      // Folosește startDate și endDate dacă sunt specificate
      const start = new Date(startDate + "T00:00:00.000Z");
      const end = new Date(endDate + "T23:59:59.999Z");

      activities = (await prisma.$queryRaw`
        SELECT * FROM activities 
        WHERE userId = ${parseInt(userId)} 
        AND date >= ${start.toISOString()} 
        AND date <= ${end.toISOString()}
        ORDER BY date ASC
      `) as ActivityType[];
    } else if (month) {
      // Fallback pentru month format: "2025-10" (YYYY-MM)
      const [year, monthNum] = month.split("-");
      const start = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
      const end = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59);

      activities = (await prisma.$queryRaw`
        SELECT * FROM activities 
        WHERE userId = ${parseInt(userId)} 
        AND date >= ${start.toISOString()} 
        AND date <= ${end.toISOString()}
        ORDER BY date ASC
      `) as ActivityType[];
    } else {
      // Preia toate activitățile utilizatorului dacă nu este specificată perioada
      activities = (await prisma.$queryRaw`
        SELECT * FROM activities WHERE userId = ${parseInt(
          userId
        )} ORDER BY date ASC
      `) as ActivityType[];
    }

    // Creează workbook Excel
    const workbook = XLSX.utils.book_new();

    // Date pentru header-ul raportului
    const monthNames = [
      "Ianuarie",
      "Februarie",
      "Martie",
      "Aprilie",
      "Mai",
      "Iunie",
      "Iulie",
      "August",
      "Septembrie",
      "Octombrie",
      "Noiembrie",
      "Decembrie",
    ];

    let periodText = "Toate perioadele";
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      periodText = `${start.toLocaleDateString(
        "ro-RO"
      )} - ${end.toLocaleDateString("ro-RO")}`;
    } else if (month) {
      const [year, monthNum] = month.split("-");
      periodText = `${monthNames[parseInt(monthNum) - 1]} ${year}`;
    }

    // Structura raportului conform modelului solicitat
    const headerData = [
      ["MINISTERUL FINANȚELOR PUBLICE"],
      [
        "Centrul National pentru Informatii Financiare/Directia Tehnologia Informatiei a Trezoreriei Statului",
      ],
      ["Serviciul Aplicatii Contabilitate Publica si Control Angajamente"],
      [""],
      ["RAPORT INDIVIDUAL DE ACTIVITATE 1"],
      [""],
      ["NUME ȘI PRENUME:", user.name],
      ["Număr marca:", user.badge || "N/A"],
      ["Perioada:", periodText],
      [""],
    ];

    // Header pentru tabelul de activități conform modelului solicitat
    const tableHeaders = [
      "Data (Ziua)",
      "Nr. crt.",
      "Activitate",
      "Atribuții",
      "Actul de bază (OMFP, adresă, notă etc.)/ din oficiu",
      "Denumire lucrare elaborată",
      "Nr. și data intrare (dacă este cazul)",
      "Nr. și data ieșire (dacă este cazul)",
      "Nr.minute - Activități principale",
      "Nr.minute - Activități conexe",
      "Nr.minute - Activități neproductive",
      "Timp total (S col. 8¸10)",
      "Caracterul urgent al lucrării (DA/NU)",
      "Activitatea implică utilizarea programelor IT (DA/NU)",
      "Denumirea aplicației",
      "Tipul activității (individuală/ colectivă)",
    ];

    // Grupează activitățile după data (ziua)
    const activitiesByDay = new Map();
    activities.forEach((activity: ActivityType) => {
      const date = new Date(activity.date || activity.createdAt);
      const dateKey = date.toLocaleDateString("ro-RO");

      if (!activitiesByDay.has(dateKey)) {
        activitiesByDay.set(dateKey, []);
      }
      activitiesByDay.get(dateKey).push(activity);
    });

    // Date pentru activități
    const activitiesData: (string | number)[][] = [];

    // Pentru fiecare zi, adaugă activitățile
    [...activitiesByDay.entries()]
      .sort()
      .forEach(([dateKey, dayActivities]) => {
        dayActivities.forEach((activity: ActivityType, index: number) => {
          // Calculare durata în minute
          const timeSpent = activity.timeSpent || 45; // Default 45 minute dacă nu există
          const date = new Date(activity.date || activity.createdAt);

          // Extrage atributele dacă sunt disponibile ca string separat prin virgulă
          const attributesArr = activity.attributes
            ? activity.attributes.split(",")
            : ["N/A"];
          const attributeText =
            attributesArr.length > 0
              ? attributesArr[0]
              : "7.Desfatoara activitasi de realizare a programelor pentru calculator, conform unor specificatii predefinite";

          // Adaugă rândul activității
          activitiesData.push([
            date.toLocaleDateString("ro-RO"), // Data (Ziua)
            index + 1, // Nr. crt.
            activity.activity, // Activitate
            attributeText, // Atribuții
            activity.baseAct || "La cerere", // Actul de bază
            activity.work, // Denumire lucrare elaborată
            dateKey, // Nr. și data intrare
            dateKey, // Nr. și data ieșire
            timeSpent, // Nr. minute - Activități principale
            0, // Nr. minute - Activități conexe
            0, // Nr. minute - Activități neproductive
            timeSpent, // Timp total
            "NU", // Caracterul urgent al lucrării
            "DA", // Activitatea implică utilizarea programelor IT
            activity.complexity === "high"
              ? "Java EE, Oracle WebLogic Server, PL/SQL, XML"
              : "Microsoft Office", // Denumirea aplicației
            "INDIVIDUALĂ", // Tipul activității
          ]);
        });
      });

    // Adaugă totalurile pentru fiecare zi
    const totalByDay = new Map();
    [...activitiesByDay.entries()].forEach(([dateKey, dayActivities]) => {
      let totalMinutes = 0;
      dayActivities.forEach((activity: ActivityType) => {
        totalMinutes += activity.timeSpent || 45;
      });
      totalByDay.set(dateKey, totalMinutes);
    });

    // Adaugă totaluri zilnice după activitățile zilei respective
    const dataWithDailyTotals: (string | number)[][] = [];
    let currentDay = "";

    activitiesData.forEach((row) => {
      if (currentDay !== String(row[0])) {
        // Am trecut la o nouă zi, dacă nu e prima iterație, adăugăm totalul pentru ziua anterioară
        if (currentDay !== "") {
          dataWithDailyTotals.push([
            "", // Data (goală pentru linia de total)
            "TOTAL", // Nr. crt.
            "",
            "",
            "",
            "",
            "",
            "", // Restul coloanelor goale
            totalByDay.get(currentDay), // Total minute activități principale
            0, // Total minute activități conexe
            0, // Total minute activități neproductive
            totalByDay.get(currentDay), // Timp total pentru ziua respectivă
            "",
            "",
            "",
            "", // Restul coloanelor goale
          ]);
        }
        currentDay = String(row[0]);
      }
      dataWithDailyTotals.push(row);
    });

    // Adăugăm totalul pentru ultima zi
    if (currentDay !== "") {
      dataWithDailyTotals.push([
        "", // Data (goală pentru linia de total)
        "TOTAL", // Nr. crt.
        "",
        "",
        "",
        "",
        "",
        "", // Restul coloanelor goale
        totalByDay.get(currentDay), // Total minute activități principale
        0, // Total minute activități conexe
        0, // Total minute activități neproductive
        totalByDay.get(currentDay), // Timp total pentru ziua respectivă
        "",
        "",
        "",
        "", // Restul coloanelor goale
      ]);
    }

    // Combină toate datele
    const worksheetData = [...headerData, tableHeaders, ...dataWithDailyTotals];

    // Adaugă note explicative la sfârșitul raportului
    const notesData = [
      [""],
      ["1 Se completează zilnic"],
      [
        "2 Se completează cu activitatea din ROF în baza căreia se elaborează lucrarea",
      ],
      [
        "3 Se completează cu atribuția corespunzătoare activității în baza căreia se elaborează lucrarea",
      ],
      [
        '4 Se completează cu tipul și conținutul pe scurt al lucrării repartizate care stă la baza elaborării lucrării de răspuns. În cazul în care lucrarea se elaborează la inițiativa STRUCTURII se menționează "din oficiu"',
      ],
      [
        '5 Se introduce data la care lucrarea de bază v-a fost repartizată. În situația lucrărilor elaborate "din oficiu" se menționeaza data la care s-a primit sarcina de la superiorul ierarhic în vederea elaborării lucrării sau v-ați sesizat din oficiu să o elaborați',
      ],
      [
        "6 Se introduce data la care ați înaintat lucrarea superiorului ierarhic",
      ],
      [
        "7 Timpul alocat realizării unei atribuții se va exprima în ore sau minute, la latitudinea șefului structurii, pentru un calcul unitar al timpilor atunci când se vor centraliza datele tuturor angajaților STRUCTURII. În cazul în care s-a colaborat cu unul sau mai multi colegi, timpul completat pentru realizarea atribuției este cel corespunzător persoanei care își evaluează gradul de încărcare din totalul timpului acordat de către toți cei implicați.",
      ],
    ];

    const finalData = [...worksheetData, ...notesData];

    // Creează worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(finalData);

    // Setează lățimile coloanelor pentru o afișare mai bună conform modelului
    const columnWidths = [
      { wch: 12 }, // Data (Ziua)
      { wch: 6 }, // Nr. crt.
      { wch: 35 }, // Activitate
      { wch: 30 }, // Atribuții
      { wch: 20 }, // Actul de bază
      { wch: 25 }, // Denumire lucrare elaborată
      { wch: 15 }, // Nr. și data intrare
      { wch: 15 }, // Nr. și data ieșire
      { wch: 12 }, // Nr. minute - Activități principale
      { wch: 12 }, // Nr. minute - Activități conexe
      { wch: 12 }, // Nr. minute - Activități neproductive
      { wch: 12 }, // Timp total
      { wch: 10 }, // Caracterul urgent
      { wch: 10 }, // Utilizare programe IT
      { wch: 25 }, // Denumirea aplicației
      { wch: 15 }, // Tipul activității
    ];
    worksheet["!cols"] = columnWidths;

    // Stilizează header-ul principal și titlurile
    for (let i = 0; i < 5; i++) {
      const cellAddress = XLSX.utils.encode_cell({ r: i, c: 0 });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          font: { bold: true, size: i === 0 ? 14 : i === 4 ? 12 : 10 },
          alignment: { horizontal: "center" },
        };
      }
    }

    // Merge celule pentru titluri pe toată lățimea
    for (let i = 0; i < 5; i++) {
      worksheet["!merges"] = worksheet["!merges"] || [];
      worksheet["!merges"].push({
        s: { r: i, c: 0 },
        e: { r: i, c: tableHeaders.length - 1 },
      });
    }

    // Stilizează header-urile tabelului
    const headerRowIndex = headerData.length; // Index-ul rândului cu header-ele tabelului
    for (let col = 0; col < tableHeaders.length; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: headerRowIndex, c: col });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          font: { bold: true, sz: 10 },
          fill: { fgColor: { rgb: "E6E6E6" } },
          border: {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          },
          alignment: {
            vertical: "center",
            horizontal: "center",
            wrapText: true,
          },
        };
      }
    }

    // Stilizează totalurile zilnice
    for (
      let r = headerRowIndex + 1;
      r < headerRowIndex + 1 + dataWithDailyTotals.length;
      r++
    ) {
      const cellB = XLSX.utils.encode_cell({ r: r, c: 1 });
      if (worksheet[cellB] && worksheet[cellB].v === "TOTAL") {
        for (let c = 0; c < tableHeaders.length; c++) {
          const cell = XLSX.utils.encode_cell({ r: r, c: c });
          if (worksheet[cell]) {
            worksheet[cell].s = {
              font: { bold: true },
              fill: { fgColor: { rgb: "F2F2F2" } },
              border: {
                top: { style: "thin" },
                bottom: { style: "thin" },
                left: { style: "thin" },
                right: { style: "thin" },
              },
            };
          }
        }
      }
    }

    // Adaugă worksheet-ul la workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Raport Individual");

    // Setează înălțimea rândurilor pentru header
    worksheet["!rows"] = [];
    for (let i = 0; i < headerData.length; i++) {
      worksheet["!rows"][i] = { hpt: i === 4 ? 30 : 20 }; // Înălțime mai mare pentru titlul principal
    }

    // Setează înălțime mai mare pentru rândul de header al tabelului
    worksheet["!rows"][headerData.length] = { hpt: 40 };

    // Generează buffer-ul Excel
    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
      bookSST: false,
      cellStyles: true,
    });

    // Numele fișierului cu timestamp și perioada
    let periodForFileName = "toate_perioadele";
    if (month) {
      const [year, monthNum] = month.split("-");
      periodForFileName = `${monthNames[
        parseInt(monthNum) - 1
      ].toLowerCase()}_${year}`;
    }

    const fileName = `Raport_Individual_${user.name.replace(
      /\s+/g,
      "_"
    )}_${periodForFileName}_${new Date().toISOString().split("T")[0]}.xlsx`;

    // Returnează fișierul Excel
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": excelBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Eroare la generarea raportului Excel:", error);
    return NextResponse.json(
      { success: false, error: "Eroare internă de server" },
      { status: 500 }
    );
  }
}
