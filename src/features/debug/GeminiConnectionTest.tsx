"use client";

import { useEffect } from "react";

export default function GeminiConnectionTest() {
  useEffect(() => {
    async function testConnection() {
      try {
        const res = await fetch("/api/sensei/ping");
        const data = await res.json();

        if (data.status === "success") {
          console.log("%c[Gemini Connection] ✅ Success:", "color: #4CAF50; font-weight: bold;");
          console.log(`"${data.message}"`);
        } else {
          console.log("%c[Gemini Connection] ❌ Failed:", "color: #F44336; font-weight: bold;");
          console.log(data.message);
        }
      } catch (err) {
        console.log("%c[Gemini Connection] ❌ Error:", "color: #F44336; font-weight: bold;");
        console.error(err);
      }
    }

    testConnection();
  }, []);

  return null; // This component doesn't render anything
}
