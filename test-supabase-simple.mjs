import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("🔍 Verificare configurație Supabase...");
console.log("URL:", supabaseUrl);
console.log("Anon Key:", supabaseAnonKey ? "Configurată ✅" : "Lipsește ❌");

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Variabilele de mediu lipsesc!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseConnection() {
  try {
    console.log("🧪 Testare conexiune Supabase...");

    // Test simplu de conectivitate
    const { data, error } = await supabase
      .from("_test_table_that_does_not_exist")
      .select("*")
      .limit(1);

    if (error && error.code === "PGRST116") {
      console.log("✅ Conexiunea la Supabase funcționează!");
      console.log("💡 Tabelul nu există încă, dar baza de date răspunde");
      return true;
    } else if (error) {
      console.log("⚠️  Răspuns de la Supabase, dar cu eroare:", error.message);
      return true; // conexiunea funcționează, dar avem alte probleme
    } else {
      console.log("✅ Conexiunea la Supabase funcționează perfect!");
      return true;
    }
  } catch (error) {
    console.error("❌ Eroare conexiune Supabase:", error.message);
    return false;
  }
}

testSupabaseConnection();
