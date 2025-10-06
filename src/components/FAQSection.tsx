"use client";
import React from "react";

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

interface FAQSectionProps {
  onQuestionClicked?: (question: string) => void;
}

const FAQSection: React.FC<FAQSectionProps> = ({ onQuestionClicked }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 text-center">
          Întrebări Frecvente
        </h2>

        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <details
              key={index}
              className="group border border-gray-200 dark:border-gray-600 rounded-lg"
            >
              <summary
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                onClick={() => onQuestionClicked?.(item.question)}
              >
                <span className="font-medium text-gray-900 dark:text-white">
                  {item.question}
                </span>
                <svg
                  className="w-5 h-5 text-gray-500 dark:text-gray-400 group-open:rotate-180 transition-transform"
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
                <p className="text-gray-600 dark:text-gray-300">
                  {item.answer}
                </p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQSection;
