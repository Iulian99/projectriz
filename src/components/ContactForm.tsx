"use client";
import React, { useState } from "react";

interface ContactFormProps {
  onMessageSent?: () => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ onMessageSent }) => {
  const [contactForm, setContactForm] = useState({
    subject: "",
    category: "",
    priority: "",
    message: "",
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Contact form submitted:", contactForm);
    alert("Mesajul a fost trimis! Vei primi un răspuns în maxim 24 de ore.");
    setContactForm({ subject: "", category: "", priority: "", message: "" });
    onMessageSent?.();
  };

  const handleInputChange = (field: string, value: string) => {
    setContactForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Contact Form */}
      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 text-center">
            Trimite un mesaj
          </h2>

          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subiect *
                </label>
                <input
                  type="text"
                  required
                  value={contactForm.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:text-white"
                  placeholder="Descrie pe scurt problema"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categoria *
                </label>
                <select
                  required
                  value={contactForm.category}
                  onChange={(e) =>
                    handleInputChange("category", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Selectează categoria</option>
                  <option value="technical">Problemă Tehnică</option>
                  <option value="account">Cont și Acces</option>
                  <option value="reports">Rapoarte și Template-uri</option>
                  <option value="billing">Facturare</option>
                  <option value="feature">Cerere Funcționalitate</option>
                  <option value="other">Altele</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prioritate *
              </label>
              <select
                required
                value={contactForm.priority}
                onChange={(e) => handleInputChange("priority", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:text-white"
              >
                <option value="">Selectează prioritatea</option>
                <option value="low">Mică - Răspuns în 3-5 zile</option>
                <option value="medium">Medie - Răspuns în 1-2 zile</option>
                <option value="high">Mare - Răspuns în 24 ore</option>
                <option value="urgent">Urgentă - Răspuns în 4 ore</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mesaj *
              </label>
              <textarea
                required
                rows={6}
                value={contactForm.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:text-white"
                placeholder="Descrie în detaliu problema sau întrebarea ta..."
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Trimite Mesaj
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-6">
        {/* Quick Contact */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Contact Direct
          </h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <svg
                  className="w-5 h-5 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Email
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  support@projectriz.com
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <svg
                  className="w-5 h-5 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Telefon
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  +40 31 123 4567
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <svg
                  className="w-5 h-5 text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Chat Live
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  24/7 disponibil
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Business Hours */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Luni - Vineri:
              </span>
              <span className="text-gray-900 dark:text-white">
                09:00 - 18:00
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Sâmbătă:</span>
              <span className="text-gray-900 dark:text-white">
                10:00 - 14:00
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Duminică:
              </span>
              <span className="text-gray-900 dark:text-white">Închis</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-400">
              <strong>Chat-ul live</strong> este disponibil 24/7 pentru urgențe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
