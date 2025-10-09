const { Client } = require("pg");

async function testPgConnection() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    // Try to force IPv4
    host: "db.hbvdyzlndibplozogrmp.supabase.co",
    port: 5432,
    user: "postgres",
    password: "1810Nelu#123",
    database: "postgres",
    // Connection options
    connectionTimeoutMillis: 10000,
    query_timeout: 10000,
    // Try IPv4 first
    family: 4,
  });

  try {
    console.log("🧪 Testare conexiune PostgreSQL directă...");
    await client.connect();
    console.log("✅ Conectat la PostgreSQL!");

    const result = await client.query(
      "SELECT COUNT(*) as count FROM nom_utilizatori"
    );
    console.log(`📊 Număr utilizatori: ${result.rows[0].count}`);

    await client.end();
    console.log("🎉 Conexiune reușită!");
  } catch (error) {
    console.error("❌ Eroare conexiune:", error.message);
    console.log("💡 Acest lucru confirmă problema de conectivitate IPv6");
  }
}

testPgConnection();
