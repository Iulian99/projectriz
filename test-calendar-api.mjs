// Test API calendar direct
const testCalendarAPI = async () => {
  try {
    console.log("=== Test API Calendar ===");

    // Testez cu user ID 31 (Neaga Iulian) care are 20 activități
    const userId = 31;
    const year = 2025;
    const month = 10;

    const url = `http://localhost:3000/api/reports/calendar?userId=${userId}&year=${year}&month=${month}`;
    console.log("URL:", url);

    const response = await fetch(url);
    console.log("Status:", response.status);

    if (response.ok) {
      const data = await response.json();
      console.log("Response:", JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log("Error:", errorText);
    }
  } catch (error) {
    console.error("Fetch error:", error);
  }
};

testCalendarAPI();
