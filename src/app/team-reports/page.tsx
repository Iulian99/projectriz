"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface TeamMember {
  id: number;
  name: string;
  position: string;
  identifier: number;
  department: string;
  email: string;
  backgroundColor: string;
}

interface Activity {
  id: number;
  date: string;
  activity: string;
  work: string;
  baseAct: string;
  status: string;
  mainActivities: number;
  relatedActivities: number;
  nonProductiveActivities: number;
  timeSpent: number;
}

interface MemberStats {
  totalActivities: number;
  totalMinutes: number;
  completedActivities: number;
  inProgressActivities: number;
}

export default function TeamReportsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<number | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [memberStats, setMemberStats] = useState<Map<number, MemberStats>>(
    new Map()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    fetchTeamMembers();
  }, [user, authLoading, router]);

  const fetchTeamMembers = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/team-members?userId=${user.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Eroare la încărcarea echipei");
      }

      setTeamMembers(data.members || []);

      // Încarcă statisticile pentru fiecare membru
      const statsMap = new Map<number, MemberStats>();
      for (const member of data.members || []) {
        const stats = await fetchMemberStats(member.id);
        if (stats) {
          statsMap.set(member.id, stats);
        }
      }
      setMemberStats(statsMap);
    } catch (err: any) {
      console.error("Error fetching team members:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMemberStats = async (
    memberId: number
  ): Promise<MemberStats | null> => {
    try {
      const response = await fetch(
        `/api/data?userId=${memberId}&startDate=${dateRange.start}&endDate=${dateRange.end}`
      );
      if (!response.ok) return null;

      const data = await response.json();
      const activities = data.data || [];

      // Calculate total minutes from the three fields
      const totalMinutes = activities.reduce((sum: number, act: any) => {
        const main = parseInt(act.mainActivities) || 0;
        const related = parseInt(act.relatedActivities) || 0;
        const nonProd = parseInt(act.nonProductiveActivities) || 0;
        return sum + main + related + nonProd;
      }, 0);

      return {
        totalActivities: activities.length,
        totalMinutes: totalMinutes,
        completedActivities: activities.filter(
          (act: any) =>
            act.status === "Completat" || act.activityType === "INDIVIDUALA"
        ).length,
        inProgressActivities: activities.filter(
          (act: any) => act.status === "În curs"
        ).length,
      };
    } catch (error) {
      console.error(`Error fetching stats for member ${memberId}:`, error);
      return null;
    }
  };

  const fetchMemberActivities = async (memberId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/data?userId=${memberId}&startDate=${dateRange.start}&endDate=${dateRange.end}`
      );
      if (!response.ok) {
        throw new Error("Eroare la încărcarea activităților");
      }

      const data = await response.json();

      // Mapează datele din format raport la format Activity
      const mappedActivities = (data.data || []).map((item: any) => ({
        id: item.id,
        date: item.date,
        activity: item.activity,
        work: item.work,
        baseAct: item.baseAct || "",
        status:
          item.activityType === "INDIVIDUALA"
            ? "Completat"
            : item.status || "Completat",
        mainActivities: parseInt(item.mainActivities) || 0,
        relatedActivities: parseInt(item.relatedActivities) || 0,
        nonProductiveActivities: parseInt(item.nonProductiveActivities) || 0,
        timeSpent: parseInt(item.timeSpent) || 0,
      }));

      setActivities(mappedActivities);
    } catch (err: any) {
      console.error("Error fetching activities:", err);
      setError(err.message);
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMemberSelect = (memberId: number) => {
    setSelectedMember(memberId);
    fetchMemberActivities(memberId);
  };

  const formatMinutes = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getPositionBadge = (position: string) => {
    if (position === "consilier") {
      return "bg-pink-100 text-pink-700 border-pink-200";
    }
    return "bg-purple-100 text-purple-700 border-purple-200";
  };

  const getPositionLabel = (position: string) => {
    if (position === "consilier") return "Consilier";
    if (position === "expert") return "Expert";
    return position;
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Se încarcă...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 pt-20">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-700">
              Manager
            </span>
            <h1 className="text-4xl font-bold text-slate-900">
              Rapoarte Echipă
            </h1>
          </div>
          <p className="text-slate-600 mt-2">
            Monitorizează activitatea și progresul membrilor echipei tale
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Filtru perioadă */}
        <div className="mb-6 rounded-3xl border border-slate-200/60 bg-white p-6 shadow-xl">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Data început
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Data sfârșit
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <button
              onClick={fetchTeamMembers}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl hover:from-blue-700 hover:to-sky-700"
            >
              Actualizează
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Lista membri echipă */}
          <div className="lg:col-span-1">
            <div className="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-xl">
              <h2 className="mb-4 text-lg font-bold text-slate-900">
                Membrii Echipei ({teamMembers.length})
              </h2>

              {teamMembers.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-6 text-center">
                  <p className="text-sm text-slate-600">
                    Nu există membri în echipa ta
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {teamMembers.map((member) => {
                    const stats = memberStats.get(member.id);
                    const isSelected = selectedMember === member.id;

                    return (
                      <button
                        key={member.id}
                        onClick={() => handleMemberSelect(member.id)}
                        className={`w-full rounded-2xl border-2 p-4 text-left transition-all ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 shadow-lg"
                            : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-slate-700 shadow-sm"
                            style={{
                              backgroundColor:
                                member.backgroundColor || "#e2e8f0",
                            }}
                          >
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 truncate">
                              {member.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${getPositionBadge(
                                  member.position
                                )}`}
                              >
                                {getPositionLabel(member.position)}
                              </span>
                            </div>
                            {stats && (
                              <div className="mt-2 text-xs text-slate-600">
                                <div className="flex justify-between">
                                  <span>Activități:</span>
                                  <span className="font-semibold">
                                    {stats.totalActivities}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Total minute:</span>
                                  <span className="font-semibold">
                                    {stats.totalMinutes}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Detalii activități membru selectat */}
          <div className="lg:col-span-2">
            {!selectedMember ? (
              <div className="rounded-3xl border border-slate-200/60 bg-white p-8 shadow-xl text-center">
                <svg
                  className="mx-auto h-16 w-16 text-slate-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <p className="mt-4 text-lg font-medium text-slate-600">
                  Selectează un membru din echipă
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Vei vedea aici toate activitățile și statisticile
                </p>
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-xl">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      {teamMembers.find((m) => m.id === selectedMember)?.name}
                    </h2>
                    <p className="text-sm text-slate-600 mt-1">
                      Perioada:{" "}
                      {new Date(dateRange.start).toLocaleDateString("ro-RO")} -{" "}
                      {new Date(dateRange.end).toLocaleDateString("ro-RO")}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                    {activities.length} activități
                  </span>
                </div>

                {/* Statistici */}
                {memberStats.get(selectedMember) && (
                  <div className="mb-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-600">
                        Total minute
                      </p>
                      <p className="mt-1 text-3xl font-bold text-slate-900">
                        {memberStats.get(selectedMember)?.totalMinutes || 0}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatMinutes(
                          memberStats.get(selectedMember)?.totalMinutes || 0
                        )}
                      </p>
                    </div>
                    <div className="rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-600">
                        Completate
                      </p>
                      <p className="mt-1 text-3xl font-bold text-green-600">
                        {memberStats.get(selectedMember)?.completedActivities ||
                          0}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        din{" "}
                        {memberStats.get(selectedMember)?.totalActivities || 0}{" "}
                        activități
                      </p>
                    </div>
                  </div>
                )}

                {/* Lista activități */}
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {activities.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center">
                      <p className="text-sm text-slate-600">
                        Nu există activități în perioada selectată
                      </p>
                    </div>
                  ) : (
                    activities.map((activity) => {
                      const totalMinutes =
                        (activity.mainActivities || 0) +
                        (activity.relatedActivities || 0) +
                        (activity.nonProductiveActivities || 0);

                      return (
                        <div
                          key={activity.id}
                          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-semibold text-slate-500">
                                  {new Date(activity.date).toLocaleDateString(
                                    "ro-RO"
                                  )}
                                </span>
                                <span
                                  className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${
                                    activity.status === "Completat"
                                      ? "bg-green-100 text-green-700 border-green-200"
                                      : "bg-yellow-100 text-yellow-700 border-yellow-200"
                                  }`}
                                >
                                  {activity.status}
                                </span>
                              </div>
                              <p className="font-semibold text-slate-900">
                                {activity.activity}
                              </p>
                              <p className="mt-1 text-sm text-slate-600">
                                {activity.work}
                              </p>
                              {activity.baseAct && (
                                <p className="mt-1 text-xs text-slate-500">
                                  Act: {activity.baseAct}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-slate-900">
                                {totalMinutes}
                              </p>
                              <p className="text-xs text-slate-500">minute</p>
                            </div>
                          </div>

                          {/* Breakdown minute */}
                          <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3">
                            <div>
                              <p className="text-xs text-slate-600">
                                Principale
                              </p>
                              <p className="text-sm font-semibold text-slate-900">
                                {activity.mainActivities || 0}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-600">Conexe</p>
                              <p className="text-sm font-semibold text-slate-900">
                                {activity.relatedActivities || 0}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-600">
                                Neproductive
                              </p>
                              <p className="text-sm font-semibold text-slate-900">
                                {activity.nonProductiveActivities || 0}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
