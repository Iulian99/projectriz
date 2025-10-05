"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useAuth, useRole } from "../contexts/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";

interface TeamMember {
  id: number;
  name: string;
  identifier: string;
  position: string;
  department: string;
}

interface ActivitySummary {
  id: number;
  userId: number;
  userName: string;
  date: string;
  activity: string;
  work: string;
  status: string;
  timeSpent: number;
  formattedDuration: string;
}

interface MemberStats {
  userId: number;
  totalActivities: number;
  monthlyActivities: number;
  totalHours: number;
  monthlyHours: number;
  completionRate: number;
  progressPercentage: number;
}

export default function TeamReportsPage() {
  const { user } = useAuth();
  const { isManager, isAdmin } = useRole();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<number | null>(null);
  const [activities, setActivities] = useState<ActivitySummary[]>([]);
  const [allActivities, setAllActivities] = useState<ActivitySummary[]>([]);
  const [memberStats, setMemberStats] = useState<Map<number, MemberStats>>(
    new Map()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(1)).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });
  const [exportingMember, setExportingMember] = useState<number | null>(null);

  const calculateMemberStats = useCallback(
    (activities: ActivitySummary[]): MemberStats => {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const monthlyActivities = activities.filter((activity) => {
        const activityDate = new Date(activity.date);
        return (
          activityDate.getMonth() === currentMonth &&
          activityDate.getFullYear() === currentYear
        );
      });

      const completedActivities = activities.filter(
        (activity) => activity.status === "Completat"
      );

      const totalHours =
        activities.reduce(
          (sum, activity) => sum + (activity.timeSpent || 0),
          0
        ) / 60;
      const monthlyHours =
        monthlyActivities.reduce(
          (sum, activity) => sum + (activity.timeSpent || 0),
          0
        ) / 60;

      const completionRate =
        activities.length > 0
          ? (completedActivities.length / activities.length) * 100
          : 0;
      const monthlyTarget = 160;
      const progressPercentage = Math.min(
        (monthlyHours / monthlyTarget) * 100,
        100
      );

      return {
        userId: activities[0]?.userId || 0,
        totalActivities: activities.length,
        monthlyActivities: monthlyActivities.length,
        totalHours: totalHours,
        monthlyHours: monthlyHours,
        completionRate: Math.round(completionRate),
        progressPercentage: Math.round(progressPercentage),
      };
    },
    []
  );

  const handleExportExcel = async (memberId: number, memberName: string) => {
    setExportingMember(memberId);
    try {
      const response = await fetch(
        `/api/reports/excel?userId=${memberId}&startDate=${dateRange.start}&endDate=${dateRange.end}`
      );

      if (!response.ok) {
        throw new Error("Failed to generate Excel report");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;

      const startDate = new Date(dateRange.start).toLocaleDateString("ro-RO");
      const endDate = new Date(dateRange.end).toLocaleDateString("ro-RO");
      const fileName = `Raport_${memberName.replace(
        /\s+/g,
        "_"
      )}_${startDate}-${endDate}.xlsx`;

      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting Excel:", error);
      alert("Eroare la generarea raportului Excel. Încercați din nou.");
    } finally {
      setExportingMember(null);
    }
  };

  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!isManager && !isAdmin) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/users/subordinates?managerId=${user?.id}`
        );
        if (!response.ok) throw new Error("Failed to fetch team members");

        const data = await response.json();
        const members = data.users || [];
        setTeamMembers(members);

        const statsMap = new Map<number, MemberStats>();

        for (const member of members) {
          try {
            const activitiesResponse = await fetch(
              `/api/activities?userId=${member.id}`
            );
            if (activitiesResponse.ok) {
              const activitiesData = await activitiesResponse.json();
              const memberActivities = activitiesData.data || [];

              if (memberActivities.length > 0) {
                const stats = calculateMemberStats(memberActivities);
                statsMap.set(member.id, stats);
              }
            }
          } catch (error) {
            console.error(
              `Error fetching activities for member ${member.id}:`,
              error
            );
          }
        }

        setMemberStats(statsMap);
      } catch (error) {
        console.error("Error fetching team members:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamMembers();
  }, [user?.id, isManager, isAdmin, calculateMemberStats]);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!selectedMember) return;

      setIsLoading(true);
      try {
        const periodResponse = await fetch(
          `/api/activities?userId=${selectedMember}&startDate=${dateRange.start}&endDate=${dateRange.end}`
        );

        const allResponse = await fetch(
          `/api/activities?userId=${selectedMember}`
        );

        if (!periodResponse.ok || !allResponse.ok) {
          throw new Error("Failed to fetch activities");
        }

        const periodData = await periodResponse.json();
        const allData = await allResponse.json();

        const processActivities = (data: ActivitySummary[]) =>
          data.map((activity: ActivitySummary) => {
            const hours = Math.floor(activity.timeSpent / 60);
            const mins = activity.timeSpent % 60;
            const formattedDuration = `${hours
              .toString()
              .padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;

            return {
              ...activity,
              formattedDuration,
            };
          });

        setActivities(processActivities(periodData.data || []));
        setAllActivities(processActivities(allData.data || []));

        if (allData.data && allData.data.length > 0) {
          const stats = calculateMemberStats(allData.data);
          setMemberStats((prev) => new Map(prev.set(selectedMember, stats)));
        }
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [selectedMember, dateRange, calculateMemberStats]);

  if (!isManager && !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24">
        <div className="container mx-auto px-6 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            Nu aveți permisiunea de a accesa această pagină. Doar managerii pot
            vedea rapoartele echipei.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24">
      <div className="container mx-auto px-6 py-4">
        <div className="mb-6">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Rapoartele Echipei
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <div className="flex flex-col">
              <label className="block text-sm text-gray-600 mb-1">De la:</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
                className="border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-sm text-gray-600 mb-1">
                Până la:
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
                className="border-gray-300 rounded-md shadow-sm"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Membri Echipă
              </h2>
              <div className="mb-6">
                {teamMembers.length > 0 ? (
                  <div className="space-y-2">
                    {teamMembers.map((member) => {
                      const stats = memberStats.get(member.id);
                      return (
                        <div
                          key={member.id}
                          className={`border rounded-lg p-3 ${
                            selectedMember === member.id
                              ? "bg-blue-50 border-blue-200"
                              : "bg-white border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => setSelectedMember(member.id)}
                              className="flex-1 text-left"
                            >
                              <div className="font-medium text-gray-900">
                                {member.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {member.position || "Fără poziție"}
                              </div>
                              <div className="text-xs text-gray-400">
                                {member.department}
                              </div>
                              {stats && (
                                <div className="mt-2 space-y-1">
                                  <div className="text-xs text-blue-600">
                                    Luna curentă: {stats.monthlyActivities}{" "}
                                    activități ({Math.round(stats.monthlyHours)}
                                    h)
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    Total: {stats.totalActivities} activități (
                                    {Math.round(stats.totalHours)}h)
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <div className="text-xs text-green-600 font-medium">
                                      Progres: {stats.progressPercentage}%
                                    </div>
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                        style={{
                                          width: `${Math.min(
                                            stats.progressPercentage,
                                            100
                                          )}%`,
                                        }}
                                      ></div>
                                    </div>
                                  </div>
                                  <div className="text-xs text-purple-600">
                                    Completare: {stats.completionRate}%
                                  </div>
                                </div>
                              )}
                            </button>
                            <button
                              onClick={() =>
                                handleExportExcel(member.id, member.name)
                              }
                              disabled={exportingMember === member.id}
                              className="ml-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300 disabled:cursor-not-allowed"
                              title={`Export Excel pentru ${member.name}`}
                            >
                              {exportingMember === member.id ? (
                                <span className="flex items-center">
                                  <svg
                                    className="animate-spin -ml-1 mr-1 h-3 w-3 text-white"
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
                                  Export...
                                </span>
                              ) : (
                                <span className="flex items-center">
                                  <svg
                                    className="-ml-1 mr-1 h-3 w-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                  </svg>
                                  Excel
                                </span>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">
                    Nu există membri în echipa dumneavoastră.
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-3">
              {selectedMember ? (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6 border-b">
                      <h2 className="text-xl font-bold">
                        {teamMembers.find((m) => m.id === selectedMember)
                          ?.name || "Membru selectat"}
                      </h2>
                      <p className="text-gray-600">
                        Activități în perioada:{" "}
                        {new Date(dateRange.start).toLocaleDateString("ro-RO")}{" "}
                        - {new Date(dateRange.end).toLocaleDateString("ro-RO")}
                      </p>

                      {memberStats.get(selectedMember) && (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="text-sm font-medium text-blue-900">
                              Luna Curentă
                            </div>
                            <div className="text-lg font-bold text-blue-700">
                              {
                                memberStats.get(selectedMember)
                                  ?.monthlyActivities
                              }{" "}
                              activități
                            </div>
                            <div className="text-sm text-blue-600">
                              {Math.round(
                                memberStats.get(selectedMember)?.monthlyHours ||
                                  0
                              )}{" "}
                              ore
                            </div>
                          </div>
                          <div className="bg-green-50 p-3 rounded-lg">
                            <div className="text-sm font-medium text-green-900">
                              Total Activități
                            </div>
                            <div className="text-lg font-bold text-green-700">
                              {memberStats.get(selectedMember)?.totalActivities}
                            </div>
                            <div className="text-sm text-green-600">
                              {Math.round(
                                memberStats.get(selectedMember)?.totalHours || 0
                              )}{" "}
                              ore totale
                            </div>
                          </div>
                          <div className="bg-purple-50 p-3 rounded-lg">
                            <div className="text-sm font-medium text-purple-900">
                              Progres Lunar
                            </div>
                            <div className="text-lg font-bold text-purple-700">
                              {
                                memberStats.get(selectedMember)
                                  ?.progressPercentage
                              }
                              %
                            </div>
                            <div className="text-sm text-purple-600">
                              din 160h obiectiv
                            </div>
                          </div>
                          <div className="bg-orange-50 p-3 rounded-lg">
                            <div className="text-sm font-medium text-orange-900">
                              Rata Completare
                            </div>
                            <div className="text-lg font-bold text-orange-700">
                              {memberStats.get(selectedMember)?.completionRate}%
                            </div>
                            <div className="text-sm text-orange-600">
                              activități finalizate
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-4 border-b bg-gray-50">
                      <h3 className="text-lg font-medium text-gray-900">
                        Activități în Perioada Selectată ({activities.length})
                      </h3>
                    </div>
                    <div className="p-6 text-center text-gray-500">
                      Implementarea tabelului cu activități va fi adăugată în
                      pasul următor.
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-4 border-b bg-gray-50">
                      <h3 className="text-lg font-medium text-gray-900">
                        Toate Activitățile ({allActivities.length})
                      </h3>
                    </div>
                    <div className="p-6 text-center text-gray-500">
                      Implementarea tabelului cu toate activitățile va fi
                      adăugată în pasul următor.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                  Selectați un membru al echipei pentru a vizualiza activitățile
                  acestuia.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
