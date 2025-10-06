"use client";
import React, { useState } from "react";
import ContactForm from "../../components/ContactForm";
import FAQSection from "../../components/FAQSection";

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState("contact");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 sm:pt-24 flex items-center justify-center">
      <div className="w-full max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-4 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Centrul de Suport
          </h1>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex justify-center space-x-8">
            <button
              onClick={() => setActiveTab("contact")}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "contact"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              Contact Suport
            </button>
            <button
              onClick={() => setActiveTab("faq")}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "faq"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              Întrebări Frecvente
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "contact" && <ContactForm />}
          {activeTab === "faq" && <FAQSection />}
        </div>
      </div>
    </div>
  );
}
