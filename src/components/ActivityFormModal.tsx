"use client";

import React, { useCallback, useEffect, useId, useMemo, useState } from "react";
import { CreateActivityRequest } from "@/lib/types";
import { useAuth } from "@/app/contexts/AuthContext";

interface ActivityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateActivityRequest) => Promise<void>;
  date: Date;
  editMode?: boolean;
  initialActivity?: CreateActivityRequest;
}

const createDefaultActivityFormData = (date: Date): CreateActivityRequest => ({
  activityName: "",
  attributes: [],
  baseAct: "",
  workName: "",
  inputDate: date,
  outputDate: date,
  entryReference: "",
  exitReference: "",
  mainActivities: 0,
  relatedActivities: 0,
  nonProductiveActivities: 0,
  urgency: false,
  usesIT: false,
  itProgramName: "",
  activityType: "INDIVIDUALA",
  observations: "",
});

// Activity options will be loaded dynamically from API based on user's service
const activityOptions: string[] = [];


interface BaseActOption {
  id: string;
  code: string;
  name: string;
}

type NumericField = keyof Pick<
  CreateActivityRequest,
  "mainActivities" | "relatedActivities" | "nonProductiveActivities"
>;

export default function ActivityFormModal({
  isOpen,
  onClose,
  onSubmit,
  date,
  editMode = false,
  initialActivity,
}: ActivityFormModalProps) {
  const { user } = useAuth();

  const initializeFormData = useCallback(
    (source?: CreateActivityRequest): CreateActivityRequest => {
      const base = createDefaultActivityFormData(date);
      if (!source) {
        return base;
      }

      return {
        ...base,
        ...source,
        attributes:
          source.attributes && source.attributes.length > 0
            ? source.attributes
            : [],
      };
    },
    [date]
  );

  const [formData, setFormData] = useState<CreateActivityRequest>(
    initializeFormData(initialActivity)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [baseActOptions, setBaseActOptions] = useState<BaseActOption[]>([]);
  const [baseActLoading, setBaseActLoading] = useState(false);
  const [baseActError, setBaseActError] = useState<string | null>(null);
  const [rofOptions, setRofOptions] = useState<string[]>([]);
  const [rofLoading, setRofLoading] = useState(false);
  const [rofError, setRofError] = useState<string | null>(null);
  const [attributeOptions, setAttributeOptions] = useState<string[]>([]);
  const [attributesLoading, setAttributesLoading] = useState(false);
  const [attributesError, setAttributesError] = useState<string | null>(null);
  const [workOptions, setWorkOptions] = useState<string[]>([]);
  const [workLoading, setWorkLoading] = useState(false);
  const [workError, setWorkError] = useState<string | null>(null);

  const employeeLabel = useMemo(() => {
    if (!user) {
      return "Utilizator neautentificat";
    }

    const parts = [
      user.name || "Utilizator",
      user.identifier ? `[${user.identifier}]` : null,
      user.department || null,
      user.role || null,
    ].filter(Boolean);

    return parts.join(" ");
  }, [user]);

  const formattedDate = useMemo(() => date.toLocaleDateString("ro-RO"), [date]);

  const totalActivities = useMemo(
    () =>
      formData.mainActivities +
      formData.relatedActivities +
      formData.nonProductiveActivities,
    [
      formData.mainActivities,
      formData.relatedActivities,
      formData.nonProductiveActivities,
    ]
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let cancelled = false;

    async function fetchBaseActs() {
      setBaseActLoading(true);
      setBaseActError(null);
      try {
        const response = await fetch("/api/nomenclatoare/act-baza");
        if (!response.ok) {
          throw new Error("Nu am putut încărca actele de bază");
        }
        const acts = await response.json();
        if (!cancelled) {
          const formattedActs = Array.isArray(acts)
            ? acts.map((act) => ({
                id: String(act.value),
                code: String(act.value),
                name: act.label,
              }))
            : [];
          setBaseActOptions(formattedActs);
        }
      } catch (error) {
        console.error("Failed to load base acts", error);
        if (!cancelled) {
          setBaseActError(
            "Nu am putut încărca lista actelor de bază. Poți completa manual."
          );
        }
      } finally {
        if (!cancelled) {
          setBaseActLoading(false);
        }
      }
    }

    async function fetchRofActivities() {
      if (!user?.id) {
        console.warn("User ID not available for ROF fetch");
        return;
      }

      setRofLoading(true);
      setRofError(null);
      try {
        const response = await fetch(
          `/api/nomenclatoare/rof?userId=${user.id}`
        );
        if (!response.ok) {
          throw new Error("Nu am putut încărca activitățile ROF");
        }
        const payload = await response.json();
        if (!cancelled) {
          const activities = Array.isArray(payload?.data)
            ? payload.data.map((item: { label: string }) => item.label)
            : [];
          setRofOptions(activities);
          console.log(`✅ Încărcate ${activities.length} activități ROF`);
        }
      } catch (error) {
        console.error("Failed to load ROF activities", error);
        if (!cancelled) {
          setRofError(
            "Nu am putut încărca lista activităților ROF. Poți completa manual."
          );
        }
      } finally {
        if (!cancelled) {
          setRofLoading(false);
        }
      }
    }

    fetchBaseActs();
    fetchRofActivities();

    // Fetch attributes based on user's service and function type
    async function fetchAttributes() {
      if (!user?.id) {
        return;
      }

      setAttributesLoading(true);
      setAttributesError(null);
      try {
        const response = await fetch(
          `/api/nomenclatoare/atributii?userId=${user.id}`
        );
        if (!response.ok) {
          throw new Error("Nu am putut încărca atribuțiile");
        }
        const atributii = await response.json();
        if (!cancelled) {
          const attrList = Array.isArray(atributii)
            ? atributii.map((a) => a.value || a.label)
            : [];
          setAttributeOptions(attrList);
          console.log(`✅ Încărcate ${attrList.length} atribuții`);
        }
      } catch (error) {
        console.error("Failed to load attributes", error);
        if (!cancelled) {
          setAttributesError("Nu am putut încărca atribuțiile.");
          // Fallback la lista goală
          setAttributeOptions([]);
        }
      } finally {
        if (!cancelled) {
          setAttributesLoading(false);
        }
      }
    }

    fetchAttributes();

    // Fetch lucrari based on user's service
    async function fetchLucrari() {
      if (!user?.id) {
        return;
      }

      setWorkLoading(true);
      setWorkError(null);
      try {
        const response = await fetch(
          `/api/nomenclatoare/lucrari?userId=${user.id}`
        );
        if (!response.ok) {
          throw new Error("Nu am putut încărca lucrările");
        }
        const lucrari = await response.json();
        if (!cancelled) {
          const workList = Array.isArray(lucrari)
            ? lucrari.map((l) => l.value || l.label)
            : [];
          setWorkOptions(workList);
          console.log(`✅ Încărcate ${workList.length} lucrări`);
        }
      } catch (error) {
        console.error("Failed to load lucrari", error);
        if (!cancelled) {
          setWorkError("Nu am putut încărca lucrările.");
          setWorkOptions([]);
        }
      } finally {
        if (!cancelled) {
          setWorkLoading(false);
        }
      }
    }

    fetchLucrari();

    return () => {
      cancelled = true;
    };
  }, [isOpen, user?.id]);

  const validateForm = useCallback(() => {
    if (!formData.activityName) {
      return "Selectează o activitate din listă";
    }

    if (formData.attributes.length === 0) {
      return "Selectează o atribuție din listă";
    }

    if (!formData.baseAct.trim()) {
      return "Completează câmpul 'Act de bază'";
    }

    if (!formData.workName.trim()) {
      return "Completează câmpul 'Denumire lucrare'";
    }

    if (totalActivities <= 0) {
      return "Introduce cel puțin o valoare pentru activități";
    }

    // Not required anymore - IT field can be filled independently
    // if (formData.usesIT && !formData.itProgramName.trim()) {
    //   return "Completează denumirea programelor IT";
    // }

    return null;
  }, [formData, totalActivities]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setFormData(initializeFormData(initialActivity));
    setError(null);
  }, [initializeFormData, initialActivity, isOpen]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
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
      } catch (submissionError) {
        setError(
          submissionError instanceof Error
            ? submissionError.message
            : "A apărut o eroare la salvare"
        );
      } finally {
        setLoading(false);
      }
    },
    [formData, onClose, onSubmit, validateForm]
  );

  const handleNumericChange = useCallback(
    (field: NumericField, value: string) => {
      const numericValue = Number(value);
      setFormData((previous) => ({
        ...previous,
        [field]: Number.isNaN(numericValue) ? 0 : Math.max(numericValue, 0),
      }));
    },
    []
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      <div className="min-h-screen flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
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
              <div className="flex-1 text-center">
                <h2 className="text-2xl font-bold">
                  {editMode ? "Editează activitatea" : "Adaugă activitate"}
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                  Completează câmpurile conform formularului standard
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

        <div className="flex-1 p-6 pb-10">
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
            <div className="space-y-6">
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6 space-y-6">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Creare înregistrare
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formattedDate}
                      </p>
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      {employeeLabel}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <p className="text-xs font-semibold text-blue-600 tracking-wide uppercase mb-2">
                        Pasul 1 • Identificare activitate
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Activitate (ROF){" "}
                            <span className="text-red-500">*</span>
                          </label>
                          {rofLoading ? (
                            <div className="w-full rounded-lg border-gray-300 shadow-sm bg-gray-50 px-3 py-2 text-sm text-gray-500 flex items-center">
                              <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500"
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
                              Se încarcă activitățile...
                            </div>
                          ) : (
                            <>
                              <select
                                value={formData.activityName}
                                onChange={(event) =>
                                  setFormData((previous) => ({
                                    ...previous,
                                    activityName: event.target.value,
                                  }))
                                }
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white max-h-64 overflow-y-auto"
                                required
                                disabled={rofLoading}
                                title={
                                  formData.activityName ||
                                  "Selectează o activitate ROF"
                                }
                              >
                                <option value="">
                                  {rofOptions.length === 0
                                    ? "Nu sunt activități disponibile"
                                    : "Selectează activitatea"}
                                </option>
                                {rofOptions.map((activity) => {
                                  // Extract ROF code and shorten description
                                  const rofMatch = activity.match(
                                    /^(ROF\s+[\d.]+[a-z)]*)/i
                                  );
                                  const rofCode = rofMatch ? rofMatch[1] : "";

                                  // Get description after ROF code
                                  let description = activity.replace(
                                    /^ROF\s+[\d.]+[a-z)]*\s*/i,
                                    ""
                                  );

                                  // Shorten description if too long
                                  if (description.length > 80) {
                                    description =
                                      description.substring(0, 77) + "...";
                                  }

                                  const displayText = rofCode
                                    ? `${rofCode} • ${description}`
                                    : activity;

                                  return (
                                    <option
                                      key={activity}
                                      value={activity}
                                      title={activity}
                                      className="py-2"
                                    >
                                      {displayText}
                                    </option>
                                  );
                                })}
                              </select>
                              {formData.activityName && (
                                <div className="mt-2 rounded-lg bg-blue-50 border border-blue-200 p-3">
                                  <p className="text-xs font-semibold text-blue-700 mb-1">
                                    Activitate selectată:
                                  </p>
                                  <p className="text-xs text-blue-900 leading-relaxed">
                                    {formData.activityName}
                                  </p>
                                </div>
                              )}
                            </>
                          )}
                          {rofError && (
                            <p className="mt-1 text-xs text-amber-600">
                              {rofError}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Atribuție <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formData.attributes[0] || ""}
                            onChange={(event) =>
                              setFormData((previous) => ({
                                ...previous,
                                attributes: event.target.value
                                  ? [event.target.value]
                                  : [],
                              }))
                            }
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white max-h-64 overflow-y-auto"
                            required
                            disabled={attributesLoading}
                            title={
                              formData.attributes[0] || "Selectează o atribuție"
                            }
                          >
                            <option value="">
                              {attributesLoading
                                ? "Se încarcă atribuțiile..."
                                : attributeOptions.length === 0
                                ? "Nu sunt atribuții disponibile"
                                : "Selectează atribuția"}
                            </option>
                            {attributeOptions.map((attribute) => {
                              // Extract number prefix if exists
                              const numberMatch = attribute.match(/^(\d+)\./);
                              const prefix = numberMatch
                                ? numberMatch[1] + ". "
                                : "";

                              // Get text after number
                              let text = attribute.replace(/^\d+\.\s*/, "");

                              // Shorten if too long
                              if (text.length > 70) {
                                text = text.substring(0, 67) + "...";
                              }

                              const displayText = prefix + text;

                              return (
                                <option
                                  key={attribute}
                                  value={attribute}
                                  title={attribute}
                                  className="py-2"
                                >
                                  {displayText}
                                </option>
                              );
                            })}
                          </select>
                          {formData.attributes[0] && (
                            <div className="mt-2 rounded-lg bg-green-50 border border-green-200 p-3">
                              <p className="text-xs font-semibold text-green-700 mb-1">
                                Atribuție selectată:
                              </p>
                              <p className="text-xs text-green-900 leading-relaxed">
                                {formData.attributes[0]}
                              </p>
                            </div>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {attributesLoading
                              ? "Se încarcă din nom_atributii..."
                              : `${attributeOptions.length} atribuții pentru serviciul tău`}
                          </p>
                          {attributesError && (
                            <p className="text-xs text-red-600 mt-1">
                              {attributesError}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Act de bază <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formData.baseAct}
                            onChange={(event) =>
                              setFormData((previous) => ({
                                ...previous,
                                baseAct: event.target.value,
                              }))
                            }
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white max-h-64 overflow-y-auto"
                            required
                            disabled={baseActLoading}
                            title={
                              formData.baseAct || "Selectează un act de bază"
                            }
                          >
                            <option value="">
                              {baseActLoading
                                ? "Se încarcă actele..."
                                : "Selectează actul de bază"}
                            </option>
                            {baseActOptions.map((option) => {
                              // Shorten long act names
                              let displayName = option.name;
                              if (displayName.length > 60) {
                                displayName =
                                  displayName.substring(0, 57) + "...";
                              }

                              return (
                                <option
                                  key={option.id}
                                  value={option.name}
                                  title={option.name}
                                  className="py-2"
                                >
                                  {displayName}
                                </option>
                              );
                            })}
                          </select>
                          {formData.baseAct && (
                            <div className="mt-2 rounded-lg bg-purple-50 border border-purple-200 p-3">
                              <p className="text-xs font-semibold text-purple-700 mb-1">
                                Act de bază selectat:
                              </p>
                              <p className="text-xs text-purple-900 leading-relaxed">
                                {formData.baseAct}
                              </p>
                            </div>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {baseActLoading
                              ? "Se încarcă actele din nom_act_baza..."
                              : `${baseActOptions.length} acte disponibile`}
                          </p>
                          {baseActError && (
                            <p className="text-xs text-red-600 mt-1">
                              {baseActError}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Denumire lucrare{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formData.workName}
                            onChange={(event) =>
                              setFormData((previous) => ({
                                ...previous,
                                workName: event.target.value,
                              }))
                            }
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white max-h-64 overflow-y-auto"
                            disabled={workLoading}
                            required
                            size={1}
                            title={formData.workName || "Selectează o lucrare"}
                          >
                            <option value="">
                              {workLoading
                                ? "Se încarcă lucrări..."
                                : `Selectează lucrarea (${workOptions.length})`}
                            </option>
                            {workOptions.map((work) => {
                              // Shorten long work names
                              let displayName = work;
                              if (displayName.length > 50) {
                                displayName =
                                  displayName.substring(0, 47) + "...";
                              }

                              return (
                                <option
                                  key={work}
                                  value={work}
                                  title={work}
                                  className="py-2"
                                >
                                  {displayName}
                                </option>
                              );
                            })}
                          </select>
                          {formData.workName && (
                            <div className="mt-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
                              <p className="text-xs font-semibold text-amber-700 mb-1">
                                Lucrare selectată:
                              </p>
                              <p className="text-xs text-amber-900 leading-relaxed">
                                {formData.workName}
                              </p>
                            </div>
                          )}
                          {workError && (
                            <p className="text-xs text-red-600 mt-1">
                              {workError}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-blue-600 tracking-wide uppercase mb-2">
                        Pasul 2 • Documentare flux
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Număr și dată intrare
                          </label>
                          <input
                            type="text"
                            value={formData.entryReference}
                            onChange={(event) =>
                              setFormData((previous) => ({
                                ...previous,
                                entryReference: event.target.value,
                              }))
                            }
                            placeholder="Ex: 123/14.11.2025"
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Număr și dată ieșire
                          </label>
                          <input
                            type="text"
                            value={formData.exitReference}
                            onChange={(event) =>
                              setFormData((previous) => ({
                                ...previous,
                                exitReference: event.target.value,
                              }))
                            }
                            placeholder="Ex: 456/14.11.2025"
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
                  <div>
                    <p className="text-xs font-semibold text-blue-600 tracking-wide uppercase mb-2">
                      Pasul 3 • Volum activitate
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Activități principale{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.mainActivities}
                          onChange={(event) =>
                            handleNumericChange(
                              "mainActivities",
                              event.target.value
                            )
                          }
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Activități conexe{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.relatedActivities}
                          onChange={(event) =>
                            handleNumericChange(
                              "relatedActivities",
                              event.target.value
                            )
                          }
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Activități neproductive{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.nonProductiveActivities}
                          onChange={(event) =>
                            handleNumericChange(
                              "nonProductiveActivities",
                              event.target.value
                            )
                          }
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    {/* Hint pentru minute rămase */}
                    <div className="mt-4 rounded-lg bg-blue-50 border border-blue-100 p-4">
                      <div className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-blue-900 mb-1">
                            Total activitate curentă: {totalActivities} minute
                          </p>
                          <p className="text-xs text-blue-700">
                            <span className="font-medium">
                              Minute disponibile în zi: 510 minute (8.5h)
                            </span>
                            {totalActivities > 0 && (
                              <span className="ml-1">
                                · Rămase: {Math.max(0, 510 - totalActivities)}{" "}
                                min
                                {totalActivities > 510 && (
                                  <span className="text-red-600 font-semibold">
                                    {" "}
                                    (⚠️ Depășește limita!)
                                  </span>
                                )}
                              </span>
                            )}
                          </p>
                          {totalActivities > 0 && (
                            <div className="mt-2 h-2 rounded-full bg-blue-100 overflow-hidden">
                              <div
                                className={`h-full transition-all ${
                                  totalActivities > 510
                                    ? "bg-red-500"
                                    : totalActivities > 400
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                                }`}
                                style={{
                                  width: `${Math.min(
                                    (totalActivities / 510) * 100,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-blue-600 tracking-wide uppercase mb-2">
                      Pasul 4 • Caracteristici lucrare
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="border border-gray-100 rounded-lg p-4">
                        <p className="text-sm font-semibold text-gray-700 mb-3">
                          Urgență lucrare
                        </p>
                        <div className="flex items-center gap-4">
                          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                            <input
                              type="radio"
                              name="urgency"
                              value="DA"
                              checked={formData.urgency === true}
                              onChange={() =>
                                setFormData((previous) => ({
                                  ...previous,
                                  urgency: true,
                                }))
                              }
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            DA
                          </label>
                          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                            <input
                              type="radio"
                              name="urgency"
                              value="NU"
                              checked={formData.urgency === false}
                              onChange={() =>
                                setFormData((previous) => ({
                                  ...previous,
                                  urgency: false,
                                }))
                              }
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            NU
                          </label>
                        </div>
                      </div>

                      <div className="border border-gray-100 rounded-lg p-4">
                        <p className="text-sm font-semibold text-gray-700 mb-3">
                          Utilizare programe IT
                        </p>
                        <div className="flex items-center gap-4">
                          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                            <input
                              type="radio"
                              name="usesIT"
                              value="DA"
                              checked={formData.usesIT === true}
                              onChange={() =>
                                setFormData((previous) => ({
                                  ...previous,
                                  usesIT: true,
                                }))
                              }
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            DA
                          </label>
                          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                            <input
                              type="radio"
                              name="usesIT"
                              value="NU"
                              checked={formData.usesIT === false}
                              onChange={() =>
                                setFormData((previous) => ({
                                  ...previous,
                                  usesIT: false,
                                  itProgramName: "",
                                }))
                              }
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            NU
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Denumire programe IT
                        </label>
                        <input
                          type="text"
                          value={formData.itProgramName}
                          onChange={(event) =>
                            setFormData((previous) => ({
                              ...previous,
                              itProgramName: event.target.value,
                            }))
                          }
                          placeholder="Ex: SACPC, SEAP, Forexebug"
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Introdu tehnologiile/programele folosite (separate
                          prin virgulă)
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tip activitate
                        </label>
                        <div className="flex items-center gap-4">
                          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                            <input
                              type="radio"
                              name="activityType"
                              value="INDIVIDUALA"
                              checked={formData.activityType === "INDIVIDUALA"}
                              onChange={() =>
                                setFormData((previous) => ({
                                  ...previous,
                                  activityType: "INDIVIDUALA",
                                }))
                              }
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            INDIVIDUALĂ
                          </label>
                          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                            <input
                              type="radio"
                              name="activityType"
                              value="COLECTIVA"
                              checked={formData.activityType === "COLECTIVA"}
                              onChange={() =>
                                setFormData((previous) => ({
                                  ...previous,
                                  activityType: "COLECTIVA",
                                }))
                              }
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            COLECTIVĂ
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Observații
                    </label>
                    <textarea
                      value={formData.observations || ""}
                      onChange={(event) =>
                        setFormData((previous) => ({
                          ...previous,
                          observations: event.target.value,
                        }))
                      }
                      rows={3}
                      maxLength={500}
                      placeholder="Notează observațiile relevante (max. 500 caractere)"
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {(formData.observations?.length || 0).toString()} / 500
                      caractere
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Anulează
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60"
              >
                {loading
                  ? "Se salvează..."
                  : editMode
                  ? "Salvează modificările"
                  : "Adaugă activitate"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
