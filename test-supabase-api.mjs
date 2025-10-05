// Test simplu pentru conexiunea Supabase
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hbvdyzlndibplozogrmp.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhidmR5emxuZGlicGxvem9ncm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NjM4NzUsImV4cCI6MjA3NTIzOTg3NX0.UAGkghi0haGWNem7qT1o6STU7j_gYtBYWMYQRu6ckjA";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log("🧪 Testing Supabase API connection...");

    // Test conexiune API
    const { data, error } = await supabase
      .from("_non_existent_table")
      .select("*")
      .limit(1);

    if (error) {
      if (
        error.message.includes("relation") ||
        error.message.includes("does not exist")
      ) {
        console.log(
          "✅ Supabase API works! (Table doesn't exist yet, but connection is OK)"
        );
        return true;
      } else {
        console.log("⚠️  Supabase API response:", error.message);
        return false;
      }
    }

    console.log("✅ Supabase API works perfectly!");
    return true;
  } catch (err) {
    console.error("❌ Supabase API error:", err.message);
    return false;
  }
}

testConnection();
