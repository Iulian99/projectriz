"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewActivityPage() {
  const router = useRouter();

  // Redirectionare pagina zi curenta
  useEffect(() => {
    // Data curenta
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    // Redirectionare pagina zilnica
    router.push(`/reports/daily/${year}/${month}/${day}`);
  }, [router]);

  // Afisare indicator de incarcare pana la redirectionare
  return (
    <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecționare către formular...</p>
      </div>
    </div>
  );
}
