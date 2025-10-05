"use client";
import React, { useState } from "react";

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState("contact");
  const [contactForm, setContactForm] = useState({
    subject: "",
    category: "",
    priority: "",
    message: "",
  });

  const faqItems = [
    {
      question: "Cum pot să creez un raport nou?",
      answer:
        'Pentru a crea un raport nou, navighează la secțiunea "Completare Raport", selectează template-ul dorit și completează informațiile necesare. Apoi apasă "Trimite Raport".',
    },
    {
      question: "Cum pot să editez un raport trimis?",
      answer:
        "Rapoartele trimise nu pot fi editate direct. Contactează administratorul sistemului pentru modificări sau creează o versiune actualizată a raportului.",
    },
    {
      question: "Ce tipuri de fișiere pot atașa la rapoarte?",
      answer:
        "Poți atașa fișiere în formatele: PNG, JPG, JPEG, PDF, DOCX, XLSX. Dimensiunea maximă permisă este de 10MB per fișier.",
    },
    {
      question: "Cum pot să urmăresc statusul rapoartelor mele?",
      answer:
        "În secțiunea Dashboard poți vedea toate rapoartele tale cu statusurile lor actuale: În Progres, În Așteptare, Aprobat sau Respins.",
    },
    {
      question: "Cum pot să schimb parola contului?",
      answer:
        'Pentru a schimba parola, accesează profilul tău din navbar (click pe inițiale), apoi selectează "Setări" și urmează instrucțiunile pentru schimbarea parolei.',
    },
    {
      question: "Cât timp durează procesarea unui raport?",
      answer:
        "Timpul de procesare variază în funcție de tipul și complexitatea raportului. De obicei, rapoartele sunt procesate în 24-48 de ore lucrătoare.",
    },
    {
      question: "Pot să primesc notificări pentru rapoartele mele?",
      answer:
        "Da, sistemul trimite notificări automate prin email și în aplicație pentru actualizări importante ale rapoartelor tale.",
    },
    {
      question: "Ce fac dacă întâmpin probleme tehnice?",
      answer:
        'Pentru probleme tehnice, folosește formularul de contact de mai jos cu categoria "Problemă Tehnică" sau contactează direct echipa de suport la support@projectriz.com.',
    },
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Contact form submitted:", contactForm);
    alert("Mesajul a fost trimis! Vei primi un răspuns în maxim 24 de ore.");
    setContactForm({ subject: "", category: "", priority: "", message: "" });
  };

  const handleInputChange = (field: string, value: string) => {
    setContactForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 flex items-center justify-center">
      <div className="w-full max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-4 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Centrul de Suport
          </h1>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex justify-center space-x-8">
            <button
              onClick={() => setActiveTab("contact")}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "contact"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Contact Suport
            </button>
            <button
              onClick={() => setActiveTab("faq")}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "faq"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Întrebări Frecvente
            </button>
          </nav>
        </div>

        {/* Contact Tab */}
        {activeTab === "contact" && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Trimite un mesaj
                </h2>

                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subiect *
                      </label>
                      <input
                        type="text"
                        required
                        value={contactForm.subject}
                        onChange={(e) =>
                          handleInputChange("subject", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Descrie pe scurt problema"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Categoria *
                      </label>
                      <select
                        required
                        value={contactForm.category}
                        onChange={(e) =>
                          handleInputChange("category", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="">Selectează categoria</option>
                        <option value="technical">Problemă Tehnică</option>
                        <option value="account">Cont și Acces</option>
                        <option value="reports">
                          Rapoarte și Template-uri
                        </option>
                        <option value="billing">Facturare</option>
                        <option value="feature">Cerere Funcționalitate</option>
                        <option value="other">Altele</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prioritate *
                    </label>
                    <select
                      required
                      value={contactForm.priority}
                      onChange={(e) =>
                        handleInputChange("priority", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">Selectează prioritatea</option>
                      <option value="low">Mică - Răspuns în 3-5 zile</option>
                      <option value="medium">
                        Medie - Răspuns în 1-2 zile
                      </option>
                      <option value="high">Mare - Răspuns în 24 ore</option>
                      <option value="urgent">Urgentă - Răspuns în 4 ore</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mesaj *
                    </label>
                    <textarea
                      required
                      rows={6}
                      value={contactForm.message}
                      onChange={(e) =>
                        handleInputChange("message", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Contact Direct
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <svg
                        className="w-5 h-5 text-blue-600"
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
                      <p className="font-medium text-gray-900">Email</p>
                      <p className="text-sm text-gray-600">
                        support@projectriz.com
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <svg
                        className="w-5 h-5 text-green-600"
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
                      <p className="font-medium text-gray-900">Telefon</p>
                      <p className="text-sm text-gray-600">+40 31 123 4567</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <svg
                        className="w-5 h-5 text-purple-600"
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
                      <p className="font-medium text-gray-900">Chat Live</p>
                      <p className="text-sm text-gray-600">24/7 disponibil</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Luni - Vineri:</span>
                    <span className="text-gray-900">09:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sâmbătă:</span>
                    <span className="text-gray-900">10:00 - 14:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duminică:</span>
                    <span className="text-gray-900">Închis</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Chat-ul live</strong> este disponibil 24/7 pentru
                    urgențe.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FAQ Tab */}
        {activeTab === "faq" && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Întrebări Frecvente
              </h2>

              <div className="space-y-4">
                {faqItems.map((item, index) => (
                  <details
                    key={index}
                    className="group border border-gray-200 rounded-lg"
                  >
                    <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                      <span className="font-medium text-gray-900">
                        {item.question}
                      </span>
                      <svg
                        className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </summary>
                    <div className="px-4 pb-4">
                      <p className="text-gray-600">{item.answer}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
