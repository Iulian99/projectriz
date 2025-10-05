// Test login API
async function testLogin() {
  const credentials = [
    { identifier: "admin", password: "admin123" },
    { identifier: "john_doe", password: "user123" },
    { identifier: "admin@example.com", password: "admin123" },
  ];

  for (const cred of credentials) {
    console.log(`\n🔍 Testing: ${cred.identifier} / ${cred.password}`);

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: cred.identifier,
          password: cred.password,
          rememberMe: false,
        }),
      });

      const data = await response.json();
      console.log("Status:", response.status);
      console.log("Response:", data);
    } catch (error) {
      console.error("Error:", error);
    }
  }
}

testLogin();
