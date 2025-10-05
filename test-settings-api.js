// Test script pentru API-ul de setări
const baseUrl = "http://localhost:3001";

async function testSettingsAPI() {
  try {
    console.log("🧪 Testing Settings API...");

    // Test 1: Încearcă să obții setările pentru un utilizator
    console.log("\n1. Testing GET /api/settings");
    const getResponse = await fetch(`${baseUrl}/api/settings?userId=1`);
    const getData = await getResponse.json();
    console.log("GET Response:", getData);

    // Test 2: Încearcă să actualizezi culoarea de fundal
    console.log("\n2. Testing PATCH /api/settings");
    const patchResponse = await fetch(`${baseUrl}/api/settings`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: 1,
        backgroundColor: "#eff6ff",
      }),
    });
    const patchData = await patchResponse.json();
    console.log("PATCH Response:", patchData);

    // Test 3: Verifică din nou setările după actualizare
    console.log("\n3. Testing GET /api/settings after update");
    const getResponse2 = await fetch(`${baseUrl}/api/settings?userId=1`);
    const getData2 = await getResponse2.json();
    console.log("GET Response after update:", getData2);
  } catch (error) {
    console.error("Error testing API:", error);
  }
}

testSettingsAPI();
