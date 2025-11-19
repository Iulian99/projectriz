import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("🔍 Verificare utilizatori în Supabase...\n");
console.log("URL:", supabaseUrl);
console.log("Key exists:", !!supabaseKey);

const supabase = createClient(supabaseUrl, supabaseKey);

// Test 1: Vezi dacă tabela există și are date
console.log("\n📊 Test 1: Count total utilizatori");
const { count, error: countError } = await supabase
  .from("nom_utilizatori")
  .select("*", { count: "exact", head: true });

console.log("Count:", count);
console.log("Error:", countError);

// Test 2: Încearcă să citești toți utilizatorii
console.log("\n📊 Test 2: SELECT * (primii 10)");
const { data: allUsers, error: allError } = await supabase
  .from("nom_utilizatori")
  .select("cod_utilizator, denumire_utilizator, status")
  .limit(10);

console.log("Găsit:", allUsers?.length || 0);
console.log("Utilizatori:", allUsers);
console.log("Error:", allError);

// Test 3: Caută specific 18123781
console.log("\n📊 Test 3: Căutare cod_utilizator = 18123781");
const { data: specific, error: specificError } = await supabase
  .from("nom_utilizatori")
  .select("*")
  .eq("cod_utilizator", 18123781);

console.log("Găsit:", specific?.length || 0);
console.log("Date:", specific);
console.log("Error:", specificError);

// Test 4: Vezi politicile RLS
console.log("\n📊 Test 4: Verificare RLS policies");
const { data: policies, error: policyError } = await supabase
  .rpc("pg_policies")
  .eq("tablename", "nom_utilizatori");

console.log("Policies:", policies);
console.log("Error:", policyError);

console.log("\n✅ Test finalizat");
