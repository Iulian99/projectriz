"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import { useBackgroundColor } from "../app/contexts/BackgroundColorContext";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({
  children,
}: ConditionalLayoutProps) {
  const pathname = usePathname();

  // Aplică culoarea de fundal selectată de utilizator
  useBackgroundColor();

  // Pagini care nu afișează navbar-ul
  const pagesWithoutNavbar = ["/login", "/register", "/forgot-password"];
  const shouldShowNavbar = !pagesWithoutNavbar.includes(pathname);

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <main className={`min-h-screen`}>{children}</main>
    </>
  );
}
