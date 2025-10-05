import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabaseUrl = "https://hbvdyzlndibplozogrmp.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhidmR5emxuZGlicGxvem9ncm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NjM4NzUsImV4cCI6MjA3NTIzOTg3NX0.UAGkghi0haGWNem7qT1o6STU7j_gYtBYWMYQRu6ckjA";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seedDatabase() {
  console.log("🌱 Populare bază de date cu utilizatori de test...");

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash("123456", 10);

    // Creare utilizator de test
    const testUser = {
      identifier: "admin",
      email: "admin@projectriz.com",
      password: hashedPassword,
      name: "Administrator",
      role: "admin",
      department: "IT",
      position: "System Administrator",
    };

    console.log("👤 Creez utilizator admin...");
    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert([testUser])
      .select();

    if (userError) {
      if (userError.message.includes("duplicate")) {
        console.log("⚠️  Utilizatorul admin există deja");
      } else {
        console.log("❌ Eroare la crearea utilizatorului:", userError.message);
        return;
      }
    } else {
      console.log("✅ Utilizator admin creat cu succes!");
      console.log("📧 Email: admin@projectriz.com");
      console.log("🔑 Parolă: 123456");
    }

    // Verificare utilizatori
    const { data: allUsers, error: countError } = await supabase
      .from("users")
      .select("id, name, email, role");

    if (countError) {
      console.log("❌ Eroare la citirea utilizatorilor:", countError.message);
    } else {
      console.log(`📊 Total utilizatori în baza de date: ${allUsers.length}`);
      allUsers.forEach((user) => {
        console.log(`  - ${user.name} (${user.email}) - ${user.role}`);
      });
    }

    console.log("🎉 Seed completat cu succes!");
  } catch (error) {
    console.error("❌ Eroare la seed:", error.message);
  }
}

seedDatabase();
