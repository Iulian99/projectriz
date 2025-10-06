// Checked
// Background dark/white
"use client";

import { useEffect } from "react";
import { useAuth } from "./AuthContext";

// verificare culoare intunecată
const isColorDark = (hexColor: string): boolean => {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128;
};

export function useBackgroundColor() {
  const { user, updateUser } = useAuth();

  useEffect(() => {
    // culoare fundal si dark mode
    const backgroundColor = user?.backgroundColor || "#f9fafb";
    const isDark = isColorDark(backgroundColor);

    // setare culoare fundal
    document.documentElement.style.setProperty("--bg-color", backgroundColor);
    document.body.style.backgroundColor = backgroundColor;

    // Add/Remove dark mode
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [user?.backgroundColor]);

  // update culoare fundal
  const updateBackgroundColor = async (color: string) => {
    if (!user?.id) return false;

    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          backgroundColor: color,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Actualizare utilizatorul în context
        updateUser({ backgroundColor: color });

        // Noua culoare si dark mode
        const isDark = isColorDark(color);
        document.documentElement.style.setProperty("--bg-color", color);
        document.body.style.backgroundColor = color;

        // Add/Remove dark mode
        if (isDark) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }

        return true;
      }
    } catch (error) {
      console.error("Eroare la actualizarea culorii:", error);
    }

    return false;
  };

  const currentColor = user?.backgroundColor || "#f9fafb";
  const isDarkMode = isColorDark(currentColor);

  return {
    currentColor,
    isDarkMode,
    updateBackgroundColor,
  };
}
