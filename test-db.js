import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "raport_zilnic",
  password: "", // sau 'admin123' dacă setezi parolă
  port: 5432,
});

async function testConnection() {
  try {
    const client = await pool.connect();
    const res = await client.query("SELECT NOW()");
    console.log("Conexiune reușită:", res.rows[0]);
    client.release();
  } catch (err) {
    console.error("Eroare la conexiune:", err);
  }
  await pool.end();
}

testConnection();
