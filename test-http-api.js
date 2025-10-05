// Test HTTP API pentru activități
async function testHTTPAPI() {
  const userId = 31; // Neaga Iulian
  const date = "2025-10-04";

  console.log("=== Test HTTP API Activități ===");

  try {
    // Test GET - verifică activitățile existente
    console.log(`\n🔍 GET Request pentru userId=${userId}&date=${date}`);

    const getResponse = await fetch(
      `http://127.0.0.1:3002/api/activities?userId=${userId}&date=${date}`
    );
    const getData = await getResponse.json();

    console.log("📊 GET Response:", JSON.stringify(getData, null, 2));

    // Test POST - creează o activitate nouă
    console.log(`\n➕ POST Request pentru crearea unei activități noi`);

    const postData = {
      activity: "Test HTTP - Activitate nouă",
      work: "Test HTTP - Verificare API",
      userId: userId,
      date: new Date(date + "T12:00:00.000Z").toISOString(),
      status: "Completat",
      timeSpent: 45,
      baseAct: "ROF HTTP Test",
      attributes: "HTTP, API, Test",
      complexity: "medium",
      observations: "Test HTTP API pentru debugging",
    };

    const postResponse = await fetch("http://127.0.0.1:3002/api/activities", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });

    const postResult = await postResponse.json();

    console.log("📝 POST Response:", JSON.stringify(postResult, null, 2));

    // Test GET din nou după POST pentru a verifica refresh
    console.log(`\n🔍 GET Request din nou după POST`);

    const getResponse2 = await fetch(
      `http://127.0.0.1:3002/api/activities?userId=${userId}&date=${date}`
    );
    const getData2 = await getResponse2.json();

    console.log(
      "📊 GET Response după POST:",
      JSON.stringify(getData2, null, 2)
    );
  } catch (error) {
    console.error("❌ Eroare HTTP API:", error);
  }
}

// Rulează testul
testHTTPAPI();
