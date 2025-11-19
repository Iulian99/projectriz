"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import ActivityFormModal from "@/components/ActivityFormModal";
import { CreateActivityRequest } from "@/lib/types";

// Activity Object Interface
interface Activity {
  id: number;
  activity: string;
  work: string;
  status: string;
  date: string;
  userId: number;
  timeSpent?: number;
  createdAt: string;
  updatedAt: string;
  baseAct?: string;
  attributes?: string;
  observations?: string;
  itDetails?: string;
  utilization?: string;
  urgency?: string;
  activityType?: string;
  entryReference?: string;
  exitReference?: string;
  mainActivities?: number;
  relatedActivities?: number;
  nonProductiveActivities?: number;
}

// Daily Report Client Props Interface
interface DailyReportClientProps {
  year: string;
  month: string;
  day: string;
}

// Status : Completat, În lucru, default
const STATUS_STYLES: Record<string, { badge: string; dot: string }> = {
  Completat: {
    badge: "border-emerald-100 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-400",
  },
  "În lucru": {
    badge: "border-amber-100 bg-amber-50 text-amber-700",
    dot: "bg-amber-400",
  },
  default: {
    badge: "border-slate-200 bg-slate-50 text-slate-600",
    dot: "bg-slate-400",
  },
};

// Format minutes into hours and minutes string
const formatMinutes = (minutes: number) => {
  if (!minutes) {
    return "0 min";
  }
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) {
    return `${mins} min`;
  }
  if (mins === 0) {
    return `${hrs} h`;
  }
  return `${hrs} h ${mins} min`;
};

// Parse comma-separated attributes string into an array
const parseAttributes = (value?: string): string[] => {
  if (!value) {
    return [];
  }
  return value
    .split(",")
    .map((attribute) => attribute.trim())
    .filter(Boolean);
};

export default function DailyReportClient({
  year,
  month,
  day,
}: DailyReportClientProps) {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]); // list activities
  const [loading, setLoading] = useState(true); //boolean loading
  const [error, setError] = useState<string | null>(null); // error message
  const [isModalOpen, setIsModalOpen] = useState(false); // visibility activity model
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null); // activity being edited

  // Data curenta
  const targetDate = useMemo(
    () =>
      new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10)),
    [year, month, day]
  );

  // Data curenta UTC
  const targetDateUtc = useMemo(
    () =>
      new Date(
        Date.UTC(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10))
      ),
    [year, month, day]
  );
  // Data ISO
  const isoDate = useMemo(
    () => `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`,
    [year, month, day]
  );
  const now = useMemo(() => new Date(), []);
  // Verificare daca este ziua curenta
  const isToday = useMemo(
    () => now.toDateString() === targetDate.toDateString(),
    [now, targetDate]
  );

  useEffect(() => {
    // Fetch activities for the user and date
    const fetchActivities = async () => {
      if (!user) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `/api/data?userId=${user.id}&date=${isoDate}`
        );
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Eroare la încărcarea activităților");
        }

        setActivities(data.data || []);
      } catch (err) {
        console.error("Eroare la fetch activități:", err);
        setError("Nu am putut încărca activitățile pentru această zi.");
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [user, isoDate]);

  // Totalul minutelor din activități
  const totalMinutes = useMemo(
    () =>
      activities.reduce((total, activity) => {
        const main = activity.mainActivities ?? 0;
        const related = activity.relatedActivities ?? 0;
        const nonProd = activity.nonProductiveActivities ?? 0;
        return total + main + related + nonProd;
      }, 0),
    [activities]
  );

  // Detalii despre activitati
  const activityBreakdown = useMemo(
    () => ({
      main: activities.reduce((sum, a) => sum + (a.mainActivities ?? 0), 0),
      related: activities.reduce(
        (sum, a) => sum + (a.relatedActivities ?? 0),
        0
      ),
      nonProd: activities.reduce(
        (sum, a) => sum + (a.nonProductiveActivities ?? 0),
        0
      ),
    }),
    [activities]
  );
  // Procentul per zi
  const completionPercent = useMemo(() => {
    const percent = (totalMinutes / 510) * 100;
    return Math.min(Math.round(percent), 100);
  }, [totalMinutes]);

  // Starea productivitatii
  const productivityMood = useMemo(() => {
    if (!totalMinutes) {
      return "Începe ziua";
    }
    if (completionPercent >= 90) {
      return "Zi completă";
    }
    if (completionPercent >= 60) {
      return "În ritm bun";
    }
    if (completionPercent >= 30) {
      return "Încă în lucru";
    }
    return "Primii pași";
  }, [completionPercent, totalMinutes]);

  const quickStats = useMemo(
    () => [
      {
        label: "Activități logate",
        value: activities.length.toString(),
        helper:
          activities.length === 0
            ? "Adaugă prima activitate de astăzi"
            : `${activities.length} elemente · ${activityBreakdown.main}min principale, ${activityBreakdown.related}min conexe, ${activityBreakdown.nonProd}min neproductive`,
        accent: "from-sky-400/10 to-sky-200/40 text-sky-900",
      },
      {
        label: "Timp lucrat",
        value: formatMinutes(totalMinutes),
        helper: totalMinutes
          ? `Total: ${totalMinutes} minute (${Math.round(totalMinutes / 60)}h)`
          : "0 minute",
        accent: "from-violet-400/10 to-violet-200/40 text-violet-900",
      },
      {
        label: "Progres zilnic",
        value: `${completionPercent}%`,
        helper: `Ținta: 510 min (8.5h) · ${productivityMood}`,
        accent: "from-emerald-400/10 to-emerald-200/40 text-emerald-900",
      },
    ],
    [
      activities.length,
      completionPercent,
      productivityMood,
      totalMinutes,
      activityBreakdown,
    ]
  );

  const handleSubmitActivity = async (activityData: CreateActivityRequest) => {
    if (!user) {
      throw new Error("Utilizatorul nu este autentificat");
    }

    // UserId utilizator logat
    const targetUserId = user.id;
    // Total unitati timp
    const totalUnits =
      activityData.mainActivities +
      activityData.relatedActivities +
      activityData.nonProductiveActivities;

    // Pregatire request body - cerere HTTP post/put server
    const requestBody = {
      activity: activityData.activityName,
      work: activityData.workName,
      userId: targetUserId,
      date: targetDateUtc.toISOString(),
      status: "Completat",
      timeSpent: totalUnits || undefined,
      baseAct: activityData.baseAct,
      attributes: activityData.attributes.join(", "),
      urgency: activityData.urgency,
      itSystems: activityData.usesIT ? activityData.itProgramName : "",
      itSoftware: activityData.usesIT ? activityData.itProgramName : "",
      activityType: activityData.activityType,
      observations: activityData.observations,
      entryReference: activityData.entryReference,
      exitReference: activityData.exitReference,
      mainActivities: activityData.mainActivities,
      relatedActivities: activityData.relatedActivities,
      nonProductiveActivities: activityData.nonProductiveActivities,
    };

    // Endpoint si metoda HTTP
    const endpoint = editingActivity
      ? `/api/data?id=${editingActivity.id}`
      : "/api/data";

    // Metoda HTTP
    const method = editingActivity ? "PUT" : "POST";

    try {
      // cerere HTTP post/put server
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Eroare la salvarea activității");
      }

      const refreshResponse = await fetch(
        `/api/data?userId=${user.id}&date=${isoDate}`
      );
      const refreshData = await refreshResponse.json();

      if (!refreshData.success) {
        throw new Error(refreshData.error || "Eroare la actualizarea listei");
      }

      setActivities(refreshData.data || []);
      setIsModalOpen(false);
      setEditingActivity(null);
    } catch (err) {
      console.error("Eroare la salvarea activității:", err);
      throw err;
    }
  };
  // Stergere activitate
  const handleDeleteActivity = async (activityId: number) => {
    if (!confirm("Ești sigur că vrei să ștergi această activitate?")) {
      return;
    }

    try {
      const response = await fetch(`/api/data/delete?id=${activityId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Eroare la ștergerea activității");
      }

      setActivities((prev) =>
        prev.filter((activity) => activity.id !== activityId)
      );
    } catch (err) {
      console.error("Eroare la ștergerea activității:", err);
      alert("Eroare la ștergerea activității");
    }
  };

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setIsModalOpen(true);
  };

  // Initial payload pentru editare activitate
  const initialActivityPayload: CreateActivityRequest | undefined =
    useMemo(() => {
      if (!editingActivity) {
        return undefined;
      }

      return {
        activityName: editingActivity.activity,
        attributes: parseAttributes(editingActivity.attributes),
        baseAct: editingActivity.baseAct || "",
        workName: editingActivity.work,
        inputDate: new Date(editingActivity.date),
        outputDate: new Date(editingActivity.date),
        entryReference: editingActivity.entryReference || "",
        exitReference: editingActivity.exitReference || "",
        mainActivities: editingActivity.mainActivities ?? 0,
        relatedActivities: editingActivity.relatedActivities ?? 0,
        nonProductiveActivities: editingActivity.nonProductiveActivities ?? 0,
        urgency: editingActivity.urgency === "DA",
        usesIT: editingActivity.utilization === "DA",
        itProgramName: editingActivity.itDetails || "",
        activityType:
          editingActivity.activityType === "COLECTIVA"
            ? "COLECTIVA"
            : "INDIVIDUALA",
        observations: editingActivity.observations || "",
      };
    }, [editingActivity]);

  // Afisare loading pana la incarcare date - just loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 pt-24 flex items-center justify-center">
        <div className="rounded-3xl border border-white bg-white/70 px-8 py-10 text-center shadow-xl backdrop-blur">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-slate-200 border-t-blue-500" />
          <p className="text-sm font-medium text-slate-600">
            Pregătim raportul zilei...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#f6f7fb] pt-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-10 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-100 opacity-40 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-violet-100 opacity-40 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-16">
        <section className="relative overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-br from-white to-slate-50 px-8 py-10 shadow-2xl">
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 mb-3">
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
                  Raport zilnic
                </p>
              </div>
              <h1
                className="text-4xl font-bold text-slate-900 mb-3"
                suppressHydrationWarning
              >
                {day.padStart(2, "0")}.{month.padStart(2, "0")}.{year}
              </h1>
              <p
                className="text-lg text-slate-600 font-medium"
                suppressHydrationWarning
              >
                {isToday
                  ? "📅 Astăzi"
                  : targetDate.toLocaleDateString("ro-RO", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
              </p>
            </div>
            <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
              <div className="rounded-2xl border-2 border-slate-100 bg-gradient-to-br from-slate-50 to-white px-6 py-4 text-center shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Ritmul zilei
                </p>
                <p className="text-xl font-bold text-slate-900">
                  {productivityMood}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4 text-base font-bold text-white shadow-xl shadow-blue-600/30 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-600/40 active:translate-y-0"
              >
                <svg
                  className="mr-2 h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v12m6-6H6"
                  />
                </svg>
                Adaugă activitate
              </button>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-3">
          {quickStats.map((stat) => (
            <div
              key={stat.label}
              className={`group rounded-3xl border-2 border-white/80 bg-gradient-to-br ${stat.accent} p-6 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1`}
            >
              <p className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                {stat.label}
              </p>
              <p className="text-3xl font-bold text-slate-900 mb-2">
                {stat.value}
              </p>
              <p className="text-sm text-slate-700 font-medium">
                {stat.helper}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border-2 border-white/80 bg-gradient-to-br from-white via-blue-50/30 to-white p-8 shadow-xl">
              <div className="flex items-start justify-between gap-6 mb-6">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 mb-3">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-xs font-bold text-blue-700">
                      PROGRES
                    </span>
                  </div>
                  <p className="text-4xl font-bold text-slate-900 mb-2">
                    {completionPercent}%
                  </p>
                  <p className="text-sm text-slate-600 font-medium">
                    {totalMinutes} / 510 minute ·{" "}
                    <span className="text-blue-600 font-semibold">
                      Rămase: {510 - totalMinutes} min
                    </span>
                  </p>
                </div>
                <div className="text-right bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Totaluri (minute)
                  </p>
                  <div className="text-xs text-slate-700 space-y-1 mb-3">
                    <p>
                      <span className="font-semibold">Principale:</span>{" "}
                      {activityBreakdown.main}
                    </p>
                    <p>
                      <span className="font-semibold">Conexe:</span>{" "}
                      {activityBreakdown.related}
                    </p>
                    <p>
                      <span className="font-semibold">Neproductive:</span>{" "}
                      {activityBreakdown.nonProd}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-200">
                    <p className="text-2xl font-bold text-slate-900">
                      {totalMinutes}
                    </p>
                    <p className="text-xs text-slate-500">Total general</p>
                  </div>
                </div>
              </div>
              <div className="relative h-4 rounded-full bg-slate-100 overflow-hidden shadow-inner">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-500 via-blue-600 to-sky-500 transition-all duration-500 shadow-lg"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-white/80 bg-white p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Activități de azi
                  </p>
                  <h2
                    className="text-2xl font-semibold text-slate-900"
                    suppressHydrationWarning
                  >
                    {targetDate.toLocaleDateString("ro-RO", {
                      weekday: "long",
                    })}{" "}
                    ({activities.length})
                  </h2>
                </div>
                {activities.length > 0 && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {activities.length} înregistrări · {totalMinutes} min
                  </span>
                )}
              </div>

              {error && (
                <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}

              {activities.length === 0 && !error && (
                <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center">
                  <p className="text-base font-medium text-slate-600">
                    Încă nu există activități pentru această dată.
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Folosește butonul „Adaugă activitate” pentru a documenta
                    progresul.
                  </p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="mt-6 inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400"
                  >
                    Adaugă prima activitate
                  </button>
                </div>
              )}

              <div className="mt-6 space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {activities.map((activity) => {
                  const statusStyle =
                    STATUS_STYLES[activity.status] || STATUS_STYLES.default;
                  const attributeList = parseAttributes(activity.attributes);
                  const metrics = [
                    {
                      label: "Activități principale",
                      value: activity.mainActivities ?? 0,
                    },
                    {
                      label: "Activități conexe",
                      value: activity.relatedActivities ?? 0,
                    },
                    {
                      label: "Activități neproductive",
                      value: activity.nonProductiveActivities ?? 0,
                    },
                  ];

                  return (
                    <div
                      key={activity.id}
                      className="group rounded-2xl border border-slate-200/60 bg-white p-6 shadow-xl shadow-slate-200/50 transition-all hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-slate-300/60"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${statusStyle.dot} shadow-sm`}
                            />
                            <p className="text-sm font-bold uppercase tracking-wide text-slate-600">
                              {activity.work}
                            </p>
                          </div>
                          <p className="mt-2 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
                            {activity.activity}
                          </p>
                          {activity.timeSpent ? (
                            <p className="mt-1 text-sm text-slate-500">
                              Durată: {formatMinutes(activity.timeSpent)}
                            </p>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyle.badge}`}
                          >
                            {activity.status}
                          </span>
                          <button
                            onClick={() => handleEditActivity(activity)}
                            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-400 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md"
                            title="Editează activitatea"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteActivity(activity.id)}
                            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-400 shadow-sm transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 hover:shadow-md"
                            title="Șterge activitatea"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Act de bază
                          </p>
                          <p className="mt-1 text-sm text-slate-900">
                            {activity.baseAct || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Referință intrare / ieșire
                          </p>
                          <p className="mt-1 text-sm text-slate-900">
                            {activity.entryReference || "-"} /{" "}
                            {activity.exitReference || "-"}
                          </p>
                        </div>
                        {metrics.map((metric) => (
                          <div key={`${activity.id}-${metric.label}`}>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                              {metric.label}
                            </p>
                            <p className="mt-1 text-sm text-slate-900">
                              {metric.value}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-5 rounded-2xl bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 p-5 border border-slate-100">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500 flex items-center gap-2">
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                            />
                          </svg>
                          Atribuții selectate
                        </p>
                        {attributeList.length ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {attributeList.map((attribute) => (
                              <span
                                key={`${activity.id}-${attribute}`}
                                className="rounded-full border border-blue-200/60 bg-gradient-to-r from-white to-blue-50/40 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm"
                              >
                                {attribute}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-2 text-sm text-slate-500">
                            Nu există atribute selectate
                          </p>
                        )}
                      </div>

                      <div className="mt-4 grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Observații / Detalii IT
                          </p>
                          <p className="mt-1 text-sm text-slate-900">
                            {activity.itDetails || activity.observations || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Urgență / Tip
                          </p>
                          <p className="mt-1 text-sm text-slate-900">
                            {activity.urgency === "DA" ? "Urgent" : "Standard"}{" "}
                            · {activity.activityType || "Nespecificat"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Removed quick summary/date cards at user request to keep layout focused on activity list */}
        </section>
      </div>

      <ActivityFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingActivity(null);
        }}
        onSubmit={handleSubmitActivity}
        date={targetDate}
        editMode={!!editingActivity}
        initialActivity={initialActivityPayload}
      />
    </div>
  );
}
