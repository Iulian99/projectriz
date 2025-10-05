"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { CreateActivityRequest } from "@/lib/types";
import ActivityFormModal from "@/components/ActivityFormModal";

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
}

interface DailyReportClientProps {
  year: string;
  month: string;
  day: string;
}

export default function DailyReportClient({
  year,
  month,
  day,
}: DailyReportClientProps) {
  console.log("🎯 DailyReportClient mounted for date:", year, month, day);
  console.log("📅 Target date will be calculated...");

  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const targetDate = new Date(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day)
  );
  const isToday = new Date().toDateString() === targetDate.toDateString();

  // Fetch activities for the specific date
  useEffect(() => {
    const fetchActivities = async () => {
      if (!user) {
        console.log("❌ No user found in fetchActivities");
        return;
      }

      try {
        setLoading(true);
        const url = `/api/activities?userId=${
          user.id
        }&date=${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

        console.log(`🔍 Fetching activities from: ${url}`);
        console.log(
          `👤 User ID: ${user.id}, Date: ${year}-${month.padStart(
            2,
            "0"
          )}-${day.padStart(2, "0")}`
        );

        const response = await fetch(url);
        const data = await response.json();

        console.log("📊 API Response:", data);
        console.log("📈 Activities count:", data.data?.length || 0);

        if (data.success) {
          setActivities(data.data || []);
          console.log("✅ Activities set in state:", data.data?.length || 0);
        } else {
          console.error("❌ Eroare la încărcarea activităților:", data.error);
        }
      } catch (error) {
        console.error("❌ Eroare la fetch activități:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [user, year, month, day]);

  const handleSubmitActivity = async (activityData: CreateActivityRequest) => {
    if (!user) {
      throw new Error("Utilizatorul nu este autentificat");
    }

    console.log(
      "📅 Data din formular (inputDate):",
      activityData.inputDate.toISOString()
    );
    console.log("📅 Data paginii (targetDate):", targetDate.toISOString());
    console.log(
      "🎯 Se va salva pentru data paginii:",
      targetDate.toISOString()
    );

    const requestBody = {
      activity: activityData.activityName,
      work: activityData.workName,
      userId: user.id,
      date: targetDate.toISOString(), // Folosim targetDate din pagină în loc de inputDate din formular
      status: "Completat",
      timeSpent: activityData.metrics.timeSpent,
      baseAct: activityData.baseAct,
      attributes: activityData.attributes.join(", "),
      complexity: activityData.metrics.complexity,
      observations: activityData.observations,
    };

    try {
      const response = await fetch("/api/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (result.success) {
        console.log("✅ Activitate salvată cu succes:", result.data);

        // Refresh activities
        const refreshUrl = `/api/activities?userId=${
          user.id
        }&date=${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
        console.log("🔄 Refresh activități din:", refreshUrl);

        const refreshResponse = await fetch(refreshUrl);
        const refreshData = await refreshResponse.json();

        console.log("📊 Date refresh primite:", refreshData);
        console.log(
          "📈 Refresh activities count:",
          refreshData.data?.length || 0
        );

        if (refreshData.success) {
          setActivities(refreshData.data || []);
          console.log(
            "✅ Activities state actualizat cu:",
            refreshData.data?.length,
            "activități"
          );
          console.log("📄 Activities în state:", refreshData.data);
        } else {
          console.error("❌ Eroare la refresh activități:", refreshData.error);
        }

        setIsModalOpen(false);
        setEditingActivity(null);
      } else {
        throw new Error(result.error || "Eroare la salvarea activității");
      }
    } catch (error) {
      console.error("Eroare la salvarea activității:", error);
      throw error;
    }
  };

  const handleDeleteActivity = async (activityId: number) => {
    if (!confirm("Ești sigur că vrei să ștergi această activitate?")) {
      return;
    }

    try {
      const response = await fetch(`/api/activities/delete?id=${activityId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (result.success) {
        // Remove activity from state
        setActivities(
          activities.filter((activity) => activity.id !== activityId)
        );
      } else {
        throw new Error(result.error || "Eroare la ștergerea activității");
      }
    } catch (error) {
      console.error("Eroare la ștergerea activității:", error);
      alert("Eroare la ștergerea activității");
    }
  };

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Se încarcă activitățile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {/* Titlu centrat */}
            <div className="flex-1"></div>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Raport zilnic - {day.padStart(2, "0")}/{month.padStart(2, "0")}/
                {year}
              </h1>
              <p className="text-gray-600">
                {isToday
                  ? "Astăzi"
                  : targetDate.toLocaleDateString("ro-RO", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
              </p>
            </div>

            {/* Buton adaugă activitate în dreapta */}
            <div className="flex-1 flex justify-end">
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
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
                Adaugă activitate nouă
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 bg-blue-50 rounded-lg">
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <span className="text-xs font-medium text-blue-600">
                {activities.length > 0 ? "Completat" : "Fără activități"}
              </span>
            </div>
            <p className="text-xl font-bold text-gray-900 mb-1">
              {activities.length}
            </p>
            <p className="text-xs text-gray-600">Activități înregistrate</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 bg-green-50 rounded-lg">
                <svg
                  className="w-4 h-4 text-green-600"
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
              <span className="text-xs font-medium text-green-600">
                Completat
              </span>
            </div>
            <p className="text-xl font-bold text-gray-900 mb-1">
              {activities.reduce(
                (total, activity) => total + (activity.timeSpent || 0),
                0
              )}{" "}
              min
            </p>
            <p className="text-xs text-gray-600">Timp total lucrat</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 bg-purple-50 rounded-lg">
                <svg
                  className="w-4 h-4 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <span className="text-xs font-medium text-purple-600">
                {(() => {
                  const totalMinutes = activities.reduce(
                    (total, activity) => total + (activity.timeSpent || 0),
                    0
                  );
                  const targetMinutes = 480; // 8 ore = 480 minute
                  const percentage = Math.min(
                    Math.round((totalMinutes / targetMinutes) * 100),
                    100
                  );

                  if (percentage >= 90) return "Excelent";
                  if (percentage >= 70) return "Foarte bun";
                  if (percentage >= 50) return "Bun";
                  if (percentage >= 25) return "În progres";
                  return "Început";
                })()}
              </span>
            </div>
            <p className="text-xl font-bold text-gray-900 mb-1">
              {(() => {
                const totalMinutes = activities.reduce(
                  (total, activity) => total + (activity.timeSpent || 0),
                  0
                );
                const targetMinutes = 480; // 8 ore = 480 minute
                return Math.min(
                  Math.round((totalMinutes / targetMinutes) * 100),
                  100
                );
              })()}
              %
            </p>
            <p className="text-xs text-gray-600">
              Progres zilă (
              {activities.reduce(
                (total, activity) => total + (activity.timeSpent || 0),
                0
              )}
              /480 min)
            </p>
          </div>
        </div>

        {/* Progress Bar for 8-hour workday */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">
              Progres zi lucrătoare (8 ore)
            </h3>
            <span className="text-sm text-gray-600">
              {Math.floor(
                activities.reduce(
                  (total, activity) => total + (activity.timeSpent || 0),
                  0
                ) / 60
              )}
              h{" "}
              {activities.reduce(
                (total, activity) => total + (activity.timeSpent || 0),
                0
              ) % 60}
              m / 8h
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${Math.min(
                  (activities.reduce(
                    (total, activity) => total + (activity.timeSpent || 0),
                    0
                  ) /
                    480) *
                    100,
                  100
                )}%`,
              }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>0h</span>
            <span>2h</span>
            <span>4h</span>
            <span>6h</span>
            <span>8h</span>
          </div>
        </div>

        {/* Activities List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Activități din {day}/{month}/{year}
            </h3>
          </div>

          {/* Debug activities list before rendering */}
          {(() => {
            console.log(
              "🎯 Rendering activities list. Current activities:",
              activities
            );
            console.log("📊 Activities length:", activities.length);
            return null;
          })()}

          {activities.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <svg
                className="w-12 h-12 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nicio activitate înregistrată
              </h3>
              <p className="text-gray-600 mb-4">
                Începe prin a adăuga prima activitate pentru această zi.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                Adaugă prima activitate
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {activities.map((activity) => (
                <div key={activity.id} className="px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {activity.activity}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {activity.work}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>
                          Creat:{" "}
                          {new Date(activity.createdAt).toLocaleDateString(
                            "ro-RO"
                          )}
                        </span>
                        {activity.timeSpent && (
                          <span>Durată: {activity.timeSpent} minute</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        {activity.status}
                      </span>
                      <button
                        onClick={() => handleEditActivity(activity)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Editează activitatea"
                      >
                        <svg
                          className="w-4 h-4"
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
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Șterge activitatea"
                      >
                        <svg
                          className="w-4 h-4"
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
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Form Modal */}
        <ActivityFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingActivity(null);
          }}
          onSubmit={handleSubmitActivity}
          date={targetDate}
          editMode={!!editingActivity}
          initialActivity={
            editingActivity
              ? {
                  activityName: editingActivity.activity,
                  attributes: [],
                  baseAct: "",
                  workName: editingActivity.work,
                  inputDate: new Date(editingActivity.date),
                  outputDate: new Date(editingActivity.date),
                  metrics: {
                    quantity: 1,
                    complexity: "medium",
                    timeSpent: editingActivity.timeSpent || 0,
                  },
                  urgency: false,
                  itUsage: {
                    systemsUsed: [],
                    softwareUsed: [],
                  },
                  activityType: "routine",
                  observations: "",
                }
              : undefined
          }
        />
      </div>
    </div>
  );
}
