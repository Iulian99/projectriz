import { NextResponse } from "next/server";
import { Pool } from "pg";

export async function GET() {
  const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "raport_zilnic",
    password: "admin123", // încearcă cu această parolă
    port: 5432,
  });

  try {
    const client = await pool.connect();
    const res = await client.query("SELECT NOW(), version()");
    client.release();
    await pool.end();

    return NextResponse.json({
      success: true,
      message: "Conexiune reușită!",
      data: res.rows[0],
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Eroare necunoscută",
      },
      { status: 500 }
    );
  }
}
