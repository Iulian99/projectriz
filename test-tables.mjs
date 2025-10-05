import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hbvdyzlndibplozogrmp.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhidmR5emxuZGlicGxvem9ncm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NjM4NzUsImV4cCI6MjA3NTIzOTg3NX0.UAGkghi0haGWNem7qT1o6STU7j_gYtBYWMYQRu6ckjA";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testTables() {
  console.log("🧪 Testare tabele create în Supabase...");

  try {
    // Test tabel users
    console.log("📊 Testare tabel users...");
    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("count", { count: "exact", head: true });

    if (usersError) {
      console.log("❌ Eroare la tabelul users:", usersError.message);
    } else {
      console.log("✅ Tabelul users există și funcționează!");
    }

    // Test tabel activities
    console.log("📊 Testare tabel activities...");
    const { data: activitiesData, error: activitiesError } = await supabase
      .from("activities")
      .select("count", { count: "exact", head: true });

    if (activitiesError) {
      console.log("❌ Eroare la tabelul activities:", activitiesError.message);
    } else {
      console.log("✅ Tabelul activities există și funcționează!");
    }

    console.log("🎉 Testarea tabelelor completă!");
  } catch (error) {
    console.error("❌ Eroare generală:", error.message);
  }
}

testTables();
