// Test script pentru noile funcționalități
const baseUrl = "http://localhost:3000";

async function testSettingsFeatures() {
  try {
    console.log("🧪 Testing New Settings Features...");

    // Test 1: Testează API-ul de setări
    console.log("\n1. Testing GET /api/settings");
    const getResponse = await fetch(`${baseUrl}/api/settings?userId=1`);
    const getData = await getResponse.json();
    console.log("GET Settings Response:", getData);

    // Test 2: Testează actualizarea culorii (mod luminos)
    console.log("\n2. Testing PATCH /api/settings - Light Mode");
    const lightColorResponse = await fetch(`${baseUrl}/api/settings`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: 1,
        backgroundColor: "#eff6ff", // Albastru deschis
      }),
    });
    const lightColorData = await lightColorResponse.json();
    console.log("Light Color Response:", lightColorData);

    // Test 3: Testează actualizarea culorii (mod întunecat)
    console.log("\n3. Testing PATCH /api/settings - Dark Mode");
    const darkColorResponse = await fetch(`${baseUrl}/api/settings`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: 1,
        backgroundColor: "#111827", // Negru clasic
      }),
    });
    const darkColorData = await darkColorResponse.json();
    console.log("Dark Color Response:", darkColorData);

    // Test 4: Testează API-ul de schimbarea parolei (cu parolă greșită)
    console.log(
      "\n4. Testing POST /api/auth/change-password - Wrong current password"
    );
    const wrongPasswordResponse = await fetch(
      `${baseUrl}/api/auth/change-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: 1,
          currentPassword: "wrongpassword",
          newPassword: "newpassword123",
        }),
      }
    );
    const wrongPasswordData = await wrongPasswordResponse.json();
    console.log("Wrong Password Response:", wrongPasswordData);

    // Test 5: Verifică din nou setările finale
    console.log("\n5. Testing GET /api/settings - Final check");
    const finalResponse = await fetch(`${baseUrl}/api/settings?userId=1`);
    const finalData = await finalResponse.json();
    console.log("Final Settings:", finalData);

    console.log("\n✅ All tests completed!");
    console.log("\n📋 Summary:");
    console.log("- Settings API should be working");
    console.log("- Color preference should be saved and retrieved");
    console.log("- Password change API should validate current password");
    console.log(
      "- Access the settings page at: http://localhost:3000/settings"
    );
  } catch (error) {
    console.error("❌ Error testing features:", error);
  }
}

testSettingsFeatures();
