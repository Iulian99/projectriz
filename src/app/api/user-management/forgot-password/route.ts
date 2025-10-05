import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

interface ForgotPasswordRequest {
  identifier: string;
}

// Funcție pentru simularea trimiterii de email
// În producție, aici ai folosi un serviciu real de email (SendGrid, Mailgun, etc.)
async function sendResetEmail(
  email: string,
  resetToken: string,
  userName: string
) {
  const resetUrl = `${
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  }/reset-password?token=${resetToken}`;

  // Pentru dezvoltare, vom loga în consolă
  console.log(`
=====================================
EMAIL DE RESETARE PAROLĂ
=====================================
Către: ${email}
Nume: ${userName}
Link de resetare: ${resetUrl}
Token: ${resetToken}
Expiră în: 1 oră
=====================================
  `);

  // În producție, aici ai implementa trimiterea reală de email
  // Exemplu cu un serviciu de email:
  /*
  await emailService.send({
    to: email,
    subject: "Resetare Parolă - ProjectRIZ",
    html: `
      <h2>Salut ${userName}!</h2>
      <p>Ai solicitat resetarea parolei pentru contul tău ProjectRIZ.</p>
      <p>Dă click pe link-ul de mai jos pentru a-ți reseta parola:</p>
      <a href="${resetUrl}" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
        Resetează Parola
      </a>
      <p>Acest link va expira în 1 oră.</p>
      <p>Dacă nu ai solicitat această resetare, poți ignora acest email.</p>
    `
  });
  */

  return true;
}

export async function POST(request: NextRequest) {
  try {
    const { identifier }: ForgotPasswordRequest = await request.json();

    if (!identifier) {
      return NextResponse.json(
        { success: false, error: "UID sau email este necesar" },
        { status: 400 }
      );
    }

    // Găsește utilizatorul după email sau identifier (UID)
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier.toLowerCase() }, { identifier: identifier }],
      },
      select: {
        id: true,
        email: true,
        name: true,
        identifier: true,
        status: true,
      },
    });

    // Pentru securitate, returnăm success chiar dacă utilizatorul nu există
    // Acest lucru previne atacurile de enumerare a email-urilor
    if (!user) {
      return NextResponse.json({
        success: true,
        message:
          "Dacă acest email există în sistem, vei primi instrucțiuni de resetare.",
      });
    }

    // Verifică dacă contul este activ
    if (user.status !== "active") {
      return NextResponse.json({
        success: true,
        message:
          "Dacă acest email există în sistem, vei primi instrucțiuni de resetare.",
      });
    }

    // Generează token unic
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Setează expirarea la 1 oră de acum
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 oră

    // Salvează token-ul în baza de date
    await prisma.user.update({
      where: { id: user.id },
      data: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        resetToken,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        resetTokenExpiry,
      },
    });

    // Trimite email-ul de resetare
    try {
      await sendResetEmail(user.email, resetToken, user.name);
    } catch (emailError) {
      console.error("Eroare la trimiterea email-ului:", emailError);

      // Șterge token-ul dacă email-ul nu a putut fi trimis
      await prisma.user.update({
        where: { id: user.id },
        data: {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          resetToken: null,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          resetTokenExpiry: null,
        },
      });

      return NextResponse.json(
        {
          success: false,
          error: "Eroare la trimiterea email-ului. Încearcă din nou.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Instrucțiuni de resetare trimise pe email. Verifică-ți căsuța poștală.",
    });
  } catch (error) {
    console.error("Eroare la forgot password:", error);
    return NextResponse.json(
      { success: false, error: "Eroare internă a serverului" },
      { status: 500 }
    );
  }
}
