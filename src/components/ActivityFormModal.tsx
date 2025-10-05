"use client";
import React, { useState } from "react";
import { CreateActivityRequest } from "@/lib/types";

interface ActivityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateActivityRequest) => Promise<void>;
  date: Date;
  editMode?: boolean;
  initialActivity?: CreateActivityRequest;
}

export default function ActivityFormModal({
  isOpen,
  onClose,
  onSubmit,
  date,
  editMode = false,
  initialActivity,
}: ActivityFormModalProps) {
  const [formData, setFormData] = useState<CreateActivityRequest>(
    initialActivity || {
      activityName: "",
      attributes: ["Analiza"], // Default attribute to avoid validation error
      baseAct: "ROF Trezorerie", // Default base act
      workName: "",
      inputDate: date,
      outputDate: date,
      metrics: {
        quantity: 1,
        complexity: "medium",
        timeSpent: 60, // Default 1 hour to avoid validation error
      },
      urgency: false,
      itUsage: {
        systemsUsed: [],
        softwareUsed: [],
      },
      activityType: "routine",
      observations: "",
    }
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Available options
  const availableActivities = [
    "ROF 11.1.1 - Analizeaza, proiecteaza, programeaza, testeaza, implementeaza aplicatii specifice trezoreriei statului",
    "ROF 11.1.2 - Realizeaza si intretine componenta de servicii informatice pentru trezoreria statului",
    "ROF 11.1.3 - Actualizeaza aplicatiile dezvoltate cu modificarile legislative/procedurale",
    "ROF 11.5.1 - Evalueaza cerintele, analizeaza, proiecteaza pentru TREZOR",
  ];

  const availableAttributes = [
    "Analiza",
    "Programare",
    "Testare",
    "Implementare",
    "Mentenanta",
    "Documentare",
    "Evaluare",
  ];

  const validateForm = () => {
    if (!formData.activityName) return "Selectează o activitate din listă";
    if (formData.attributes.length === 0)
      return "Selectează cel puțin un atribut (ține apăsat Ctrl pentru selecții multiple)";
    if (!formData.baseAct.trim()) return "Completează câmpul 'Act de bază'";
    if (!formData.workName.trim())
      return "Completează câmpul 'Denumire lucrare'";
    if (formData.metrics.timeSpent <= 0)
      return "Timpul petrecut trebuie să fie mai mare de 0 minute";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (initialActivity && editMode) {
      const updatedFormData = {
        ...initialActivity,
        metrics: {
          ...initialActivity.metrics,
          timeSpent:
            initialActivity.metrics.timeSpent !== undefined
              ? initialActivity.metrics.timeSpent
              : 0,
        },
      };
      setFormData(updatedFormData);
    }
  }, [initialActivity, editMode, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
        {/* Header cu gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {editMode ? "Editează activitate" : "Adaugă activitate nouă"}
                </h2>
                <p className="text-blue-100 text-sm">
                  {editMode
                    ? "Modifică detaliile activității"
                    : "Completează toate câmpurile pentru a adăuga o activitate"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center space-x-2">
              <svg
                className="w-5 h-5 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Secțiunea 1: Informații generale */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-blue-100 p-2 rounded-lg">
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Informații generale
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Activitate (conform ROF){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.activityName}
                    onChange={(e) =>
                      setFormData({ ...formData, activityName: e.target.value })
                    }
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
                    required
                  >
                    <option value="">Selectează activitatea</option>
                    {availableActivities.map((activity) => (
                      <option key={activity} value={activity}>
                        {activity}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Denumire lucrare <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.workName}
                    onChange={(e) =>
                      setFormData({ ...formData, workName: e.target.value })
                    }
                    placeholder="Ex: Dezvoltare modul contabilitate"
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Act de bază <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.baseAct}
                    onChange={(e) =>
                      setFormData({ ...formData, baseAct: e.target.value })
                    }
                    placeholder="Ex: Lege 12/2021"
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Atribute <span className="text-red-500">*</span>
                  </label>
                  <select
                    multiple
                    value={formData.attributes}
                    onChange={(e) => {
                      const values = Array.from(
                        e.target.selectedOptions,
                        (option) => option.value
                      );
                      setFormData({ ...formData, attributes: values });
                    }}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
                    required
                    size={4}
                  >
                    {availableAttributes.map((attribute) => (
                      <option key={attribute} value={attribute}>
                        {attribute}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-blue-600 mt-1 font-medium">
                    💡 Ține apăsat Ctrl și click pentru selecții multiple
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Selectate: {formData.attributes.join(", ") || "Niciuna"}
                  </p>
                </div>
              </div>
            </div>

            {/* Secțiunea 2: Metrici și durată */}
            <div className="bg-green-50 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-green-100 p-2 rounded-lg">
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Metrici și durată
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cantitate <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.metrics.quantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        metrics: {
                          ...formData.metrics,
                          quantity: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Complexitate <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.metrics.complexity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        metrics: {
                          ...formData.metrics,
                          complexity: e.target.value as
                            | "low"
                            | "medium"
                            | "high",
                        },
                      })
                    }
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
                    required
                  >
                    <option value="low">Scăzută</option>
                    <option value="medium">Medie</option>
                    <option value="high">Ridicată</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timp petrecut (minute){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.metrics.timeSpent}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        metrics: {
                          ...formData.metrics,
                          timeSpent: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    placeholder="Ex: 60 (1 oră)"
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.metrics.timeSpent > 0 &&
                      `≈ ${Math.floor(formData.metrics.timeSpent / 60)}h ${
                        formData.metrics.timeSpent % 60
                      }m`}
                  </p>
                </div>
              </div>
            </div>

            {/* Secțiunea 3: Perioada */}
            <div className="bg-purple-50 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-purple-100 p-2 rounded-lg">
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
                      d="M8 7V3a4 4 0 118 0v4m-4 6V9a2 2 0 00-4 0v2"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Perioada
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data început <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.inputDate.toISOString().split("T")[0]}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        inputDate: new Date(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data sfârșit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.outputDate.toISOString().split("T")[0]}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        outputDate: new Date(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Secțiunea 4: Observații */}
            <div className="bg-orange-50 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <svg
                    className="w-5 h-5 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Observații
                </h3>
              </div>

              <textarea
                value={formData.observations}
                onChange={(e) =>
                  setFormData({ ...formData, observations: e.target.value })
                }
                rows={4}
                placeholder="Adaugă observații sau detalii suplimentare despre activitate..."
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Butoane de acțiune */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Anulează
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-sm hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Se salvează...</span>
                  </div>
                ) : (
                  <span>{editMode ? "Actualizează" : "Salvează"}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
