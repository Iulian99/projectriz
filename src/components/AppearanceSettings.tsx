"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../app/contexts/AuthContext";
import { useBackgroundColor } from "../app/contexts/BackgroundColorContext";

interface ColorOption {
  name: string;
  value: string;
  gradient?: string;
}

const predefinedColors: ColorOption[] = [
  { name: "Gri Deschis", value: "#f9fafb", gradient: "bg-gray-50" },
  { name: "Albastru Deschis", value: "#eff6ff", gradient: "bg-blue-50" },
  { name: "Verde Deschis", value: "#f0fdf4", gradient: "bg-green-50" },
  { name: "Violet Deschis", value: "#faf5ff", gradient: "bg-purple-50" },
  { name: "Galben Deschis", value: "#fefce8", gradient: "bg-yellow-50" },
  { name: "Portocaliu Deschis", value: "#fff7ed", gradient: "bg-orange-50" },
  { name: "Indigo Deschis", value: "#eef2ff", gradient: "bg-indigo-50" },
  { name: "Turcoaz Deschis", value: "#f0fdfa", gradient: "bg-teal-50" },
  { name: "Roșu Deschis", value: "#fef2f2", gradient: "bg-red-50" },
];

const darkModeColors: ColorOption[] = [
  { name: "Negru Clasic", value: "#111827", gradient: "bg-gray-900" },
  { name: "Albastru Întunecat", value: "#1e293b", gradient: "bg-slate-800" },
  { name: "Verde Întunecat", value: "#14532d", gradient: "bg-green-900" },
  { name: "Violet Întunecat", value: "#581c87", gradient: "bg-purple-900" },
  { name: "Indigo Întunecat", value: "#312e81", gradient: "bg-indigo-900" },
  { name: "Gri Cărbune", value: "#374151", gradient: "bg-gray-700" },
  { name: "Bleumarin", value: "#1e40af", gradient: "bg-blue-800" },
  { name: "Maro Întunecat", value: "#451a03", gradient: "bg-amber-900" },
  { name: "Roșu Întunecat", value: "#7f1d1d", gradient: "bg-red-900" },
  { name: "Emerald Întunecat", value: "#064e3b", gradient: "bg-emerald-900" },
];

interface AppearanceSettingsProps {
  onSettingsChanged?: () => void;
}

const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({
  onSettingsChanged,
}) => {
  const { user } = useAuth();
  const { currentColor, isDarkMode, updateBackgroundColor } =
    useBackgroundColor();
  const [selectedColor, setSelectedColor] = useState("#f9fafb");
  const [customColor, setCustomColor] = useState("#f9fafb");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Culoarea utilizatorului la montarea componentei
  const fetchUserSettings = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/settings?userId=${user.id}`);
      const data = await response.json();

      if (data.success && data.settings?.backgroundColor) {
        setSelectedColor(data.settings.backgroundColor);
        setCustomColor(data.settings.backgroundColor);
      }
    } catch (error) {
      console.error("Eroare la încărcarea setărilor:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchUserSettings();
  }, [fetchUserSettings]);

  // Sincronizează culoarea selectată cu culoarea curentă din hook
  useEffect(() => {
    setSelectedColor(currentColor);
    setCustomColor(currentColor);
  }, [currentColor]);

  const saveColorPreference = async (color: string) => {
    if (!user?.id) return;

    try {
      setIsSaving(true);
      const success = await updateBackgroundColor(color);

      if (success) {
        setMessage("Culoarea a fost salvată cu succes!");
        setTimeout(() => setMessage(""), 3000);
        onSettingsChanged?.();
      } else {
        setMessage("Eroare la salvarea culorii");
      }
    } catch (error) {
      console.error("Eroare la salvarea culorii:", error);
      setMessage("Eroare de conexiune");
    } finally {
      setIsSaving(false);
    }
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setCustomColor(color);
    saveColorPreference(color);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    setSelectedColor(color);
    saveColorPreference(color);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Mesaj de feedback pentru culoare */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-md ${
            message.includes("succes")
              ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700"
              : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700"
          }`}
        >
          {message}
        </div>
      )}

      {/* Toggle Dark/Light Mode */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Mod de Afișare
        </h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              // Schimbă automat la o culoare deschisă
              handleColorSelect("#f9fafb");
            }}
            className={`px-4 py-2 rounded-lg border ${
              !isDarkMode
                ? "bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-600 text-blue-700 dark:text-blue-300"
                : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
            }`}
          >
            🌞 Mod Luminos
          </button>
          <button
            onClick={() => {
              // Schimbă automat la o culoare întunecată
              handleColorSelect("#111827");
            }}
            className={`px-4 py-2 rounded-lg border ${
              isDarkMode
                ? "bg-gray-800 dark:bg-gray-700 border-gray-600 dark:border-gray-500 text-white dark:text-gray-200"
                : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
            }`}
          >
            🌙 Mod Întunecat
          </button>
        </div>
      </div>

      {/* Secțiunea de personalizare culoare fundal */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Personalizarea Fundalului
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Alege o culoare pentru fundalul aplicației. Această setare va fi
          salvată doar pentru contul tău.
        </p>

        {/* Previzualizare culoare curentă */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Culoarea curentă
          </label>
          <div
            className="w-full h-16 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center"
            style={{ backgroundColor: selectedColor }}
          >
            <span className="text-white font-medium drop-shadow-lg">
              {selectedColor}
            </span>
          </div>
        </div>

        {/* Culori predefinite - Luminos */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            🌞 Culori Luminoase
          </label>
          <div className="grid grid-cols-5 gap-3">
            {predefinedColors.map((color) => (
              <button
                key={color.value}
                onClick={() => handleColorSelect(color.value)}
                disabled={isSaving}
                className={`
                  relative w-full h-12 rounded-lg border-2 transition-all duration-200 hover:scale-105
                  ${
                    selectedColor === color.value
                      ? "border-blue-500 ring-2 ring-blue-200"
                      : "border-gray-300 hover:border-gray-400"
                  }
                `}
                style={{ backgroundColor: color.value }}
                title={color.name}
              >
                {selectedColor === color.value && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Culori predefinite - Întunecat */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            🌙 Culori Întunecate
          </label>
          <div className="grid grid-cols-5 gap-3">
            {darkModeColors.map((color) => (
              <button
                key={color.value}
                onClick={() => handleColorSelect(color.value)}
                disabled={isSaving}
                className={`
                  relative w-full h-12 rounded-lg border-2 transition-all duration-200 hover:scale-105
                  ${
                    selectedColor === color.value
                      ? "border-yellow-400 ring-2 ring-yellow-200"
                      : "border-gray-600 hover:border-gray-500"
                  }
                `}
                style={{ backgroundColor: color.value }}
                title={color.name}
              >
                {selectedColor === color.value && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Selector culoare personalizată */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Culoare Personalizată
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="color"
              value={customColor}
              onChange={handleCustomColorChange}
              disabled={isSaving}
              className="w-16 h-12 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer disabled:cursor-not-allowed"
            />
            <div className="flex-1">
              <input
                type="text"
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value);
                  if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                    setSelectedColor(e.target.value);
                    saveColorPreference(e.target.value);
                  }
                }}
                disabled={isSaving}
                placeholder="#ffffff"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Poți introduce manual un cod de culoare (ex: #ff6b6b) sau folosi
            selectorul de culori
          </p>
        </div>

        {/* Buton reset și status */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => handleColorSelect("#f9fafb")}
            disabled={isSaving}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Resetează la implicit
          </button>

          {isSaving && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Se salvează...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppearanceSettings;
