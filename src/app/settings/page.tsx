"use client";
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import AppearanceSettings from "../../components/AppearanceSettings";
import PasswordChange from "../../components/PasswordChange";

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"appearance" | "password">(
    "appearance"
  );

  if (!user) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          {/* Header Setări */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">
                Setări
              </h1>
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveTab("appearance")}
                  className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "appearance"
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  Aspect
                </button>
                <button
                  onClick={() => setActiveTab("password")}
                  className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "password"
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  Schimbă Parola
                </button>
              </div>
            </div>
          </div>

          {/* ActiveTab -> appearance / password*/}
          <div>
            {activeTab === "appearance" && <AppearanceSettings />}
            {activeTab === "password" && <PasswordChange />}
          </div>
        </div>
      </div>
    </div>
  );
}
