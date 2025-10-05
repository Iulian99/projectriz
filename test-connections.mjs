import { prisma } from "./src/lib/prisma.js";
import { supabase } from "./src/lib/supabase.js";

async function testConnections() {
  console.log("🧪 Testare conexiuni...");

  try {
    // Test Prisma connection
    console.log("📊 Testare conexiune Prisma...");
    await prisma.$connect();

    // Test database query
    const userCount = await prisma.user.count();
    console.log(
      `✅ Prisma: Conectat! Utilizatori în baza de date: ${userCount}`
    );

    // Test Supabase connection
    console.log("🔄 Testare conexiune Supabase...");
    const { data, error } = await supabase
      .from("users")
      .select("count", { count: "exact", head: true });

    if (error) {
      console.log(
        "⚠️  Supabase: Tabelul users nu există încă sau RLS este activat"
      );
      console.log("💡 Aceasta este normal înainte de aplicarea migrărilor");
    } else {
      console.log(
        `✅ Supabase: Conectat! Utilizatori prin Supabase: ${data?.length || 0}`
      );
    }

    console.log("🎉 Testarea conexiunilor s-a terminat cu succes!");
  } catch (error) {
    console.error("❌ Eroare la testarea conexiunilor:", error);
    console.log("\n💡 Asigură-te că:");
    console.log("1. Ai completat corect .env.local cu credențialele Supabase");
    console.log("2. Ai rulat: npx prisma db push");
    console.log("3. Proiectul Supabase este activ");
  } finally {
    await prisma.$disconnect();
  }
}

testConnections();
