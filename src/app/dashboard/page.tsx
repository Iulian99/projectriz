"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import Link from "next/link";

interface Activity {
  id: number;
  date: string; // Format ISO (YYYY-MM-DD)
  displayDate?: string; // Format românesc pentru afișare
  employee: string;
  activity: string;
  work: string;
  status: string;
  timeSpent?: number; // Orele lucrate pentru această activitate
}

interface DashboardStats {
  completedDays: number;
  totalWorkingDays: number;
  hoursWorkedToday: number;
  totalMonthlyHours: number;
  monthlyWorkedHours: number;
  monthlyProgress: number;
}

interface DailyChartData {
  day: number;
  date: string;
  activitiesCount: number;
  hoursWorked: number;
  isWorkingDay: boolean;
}

// Funcție pentru calculul zilelor lucrătoare într-o lună (excluzând weekendurile)
function getWorkingDaysInMonth(year: number, month: number): number {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let workingDays = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    // 0 = Duminică, 6 = Sâmbătă
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
  }

  return workingDays;
}

// Funcție pentru calculul orelor totale pe lună (vineri 6h, restul 8h)
function getTotalMonthlyHours(year: number, month: number): number {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let totalHours = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();

    // Doar zilele lucrătoare
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Vineri (5) = 6 ore, restul = 8 ore
      totalHours += dayOfWeek === 5 ? 6 : 8;
    }
  }

  return totalHours;
}

// Funcție pentru calculul orelor lucrate într-o lună
function getMonthlyWorkedHours(
  activities: Activity[],
  year: number,
  month: number
): number {
  console.log("Calculez orele lucrate pentru:", {
    year,
    month,
    monthName: new Date(year, month).toLocaleDateString("ro-RO", {
      month: "long",
      year: "numeric",
    }),
  });
  console.log("Activități primite:", activities.length);

  let totalHours = 0;

  activities.forEach((activity, index) => {
    console.log(`Activitate ${index + 1}:`, activity);

    // Încearcă să parseze data în mai multe moduri
    let activityDate: Date;

    // Dacă data este deja în format ISO (YYYY-MM-DD)
    if (activity.date.includes("-") && activity.date.length === 10) {
      activityDate = new Date(activity.date + "T00:00:00.000Z");
    }
    // Dacă data este în format românesc (DD.MM.YYYY)
    else if (activity.date.includes(".")) {
      const parts = activity.date.split(".");
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const monthPart = parseInt(parts[1]) - 1; // Luna în JavaScript e 0-indexed
        const yearPart = parseInt(parts[2]);
        activityDate = new Date(yearPart, monthPart, day);
      } else {
        activityDate = new Date(activity.date);
      }
    }
    // Altfel, încearcă parsing normal
    else {
      activityDate = new Date(activity.date);
    }

    console.log(
      `Data parsată: ${activity.date} -> ${activityDate.toISOString()}`
    );
    console.log(
      `Anul: ${activityDate.getFullYear()}, Luna: ${activityDate.getMonth()}`
    );

    if (
      activityDate.getFullYear() === year &&
      activityDate.getMonth() === month
    ) {
      let timeSpent = activity.timeSpent || 0;

      // Validare: timeSpent nu poate fi mai mare de 24 ore într-o zi
      if (timeSpent > 24) {
        console.warn(
          `⚠️ Valoare timeSpent suspectă: ${timeSpent}h pentru activitatea "${activity.activity}". Se limitează la 24h.`
        );
        timeSpent = 24;
      }

      // Validare: timeSpent nu poate fi negativă
      if (timeSpent < 0) {
        console.warn(
          `⚠️ Valoare timeSpent negativă: ${timeSpent}h pentru activitatea "${activity.activity}". Se setează la 0h.`
        );
        timeSpent = 0;
      }

      console.log("✅ Adaug orele:", timeSpent);
      totalHours += timeSpent;
    } else {
      console.log("❌ Nu se potrivește cu luna/anul curent");
    }
  });

  console.log("Total ore lucrate în lună:", totalHours);
  return totalHours;
}

// Funcție pentru calculul zilelor completate dintr-un array de activități
function getCompletedDaysFromActivities(
  activities: Activity[],
  year: number,
  month: number
): number {
  console.log("Calculez zilele completate pentru:", {
    year,
    month,
    monthName: new Date(year, month).toLocaleDateString("ro-RO", {
      month: "long",
      year: "numeric",
    }),
  });
  console.log("Activități primite:", activities.length);

  const completedDates = new Set<string>();

  activities.forEach((activity, index) => {
    console.log(`Activitate ${index + 1}:`, activity);

    // Încearcă să parseze data în mai multe moduri
    let activityDate: Date;

    // Dacă data este deja în format ISO (YYYY-MM-DD)
    if (activity.date.includes("-") && activity.date.length === 10) {
      activityDate = new Date(activity.date + "T00:00:00.000Z");
    }
    // Dacă data este în format românesc (DD.MM.YYYY)
    else if (activity.date.includes(".")) {
      const parts = activity.date.split(".");
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const monthPart = parseInt(parts[1]) - 1; // Luna în JavaScript e 0-indexed
        const yearPart = parseInt(parts[2]);
        activityDate = new Date(yearPart, monthPart, day);
      } else {
        activityDate = new Date(activity.date);
      }
    }
    // Altfel, încearcă parsing normal
    else {
      activityDate = new Date(activity.date);
    }

    console.log(
      `Data parsată: ${activity.date} -> ${activityDate.toISOString()}`
    );
    console.log(
      `Anul: ${activityDate.getFullYear()}, Luna: ${activityDate.getMonth()}`
    );

    if (
      activityDate.getFullYear() === year &&
      activityDate.getMonth() === month
    ) {
      const dateStr = activityDate.toISOString().split("T")[0];
      console.log("✅ Adaug ziua:", dateStr);
      completedDates.add(dateStr);
    } else {
      console.log("❌ Nu se potrivește cu luna/anul curent");
    }
  });

  console.log("Zile completate găsite:", Array.from(completedDates));
  return completedDates.size;
}

// Funcție pentru generarea datelor pentru diagrama progresului lunar
function generateMonthlyChartData(
  activities: Activity[],
  year: number,
  month: number
): DailyChartData[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const chartData: DailyChartData[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    const isWorkingDay = dayOfWeek !== 0 && dayOfWeek !== 6; // Nu weekend
    const dateStr = date.toISOString().split("T")[0];

    // Filtrează activitățile pentru această zi
    const dayActivities = activities.filter((activity) => {
      const activityDate = new Date(activity.date + "T00:00:00.000Z");
      return activityDate.toISOString().split("T")[0] === dateStr;
    });

    // Calculează orele totale pentru această zi cu validare
    const hoursWorked = dayActivities.reduce((total, activity) => {
      let timeSpent = activity.timeSpent || 0;

      // Validare: timeSpent nu poate fi mai mare de 24 ore într-o zi
      if (timeSpent > 24) {
        timeSpent = 24;
      }

      // Validare: timeSpent nu poate fi negativă
      if (timeSpent < 0) {
        timeSpent = 0;
      }

      return total + timeSpent;
    }, 0);

    chartData.push({
      day,
      date: dateStr,
      activitiesCount: dayActivities.length,
      hoursWorked,
      isWorkingDay,
    });
  }

  return chartData;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    completedDays: 0,
    totalWorkingDays: 0,
    hoursWorkedToday: 0,
    totalMonthlyHours: 0,
    monthlyWorkedHours: 0,
    monthlyProgress: 0,
  });
  const [monthlyChartData, setMonthlyChartData] = useState<DailyChartData[]>(
    []
  );

  // Fetch activitățile utilizatorului și calculez statisticile
  useEffect(() => {
    const fetchActivities = async () => {
      if (!user) return;

      try {
        console.log("🔍 Utilizator curent:", user);
        console.log("🔍 Fetch pentru userId:", user.id);

        const response = await fetch(`/api/activities?userId=${user.id}`);
        const data = await response.json();

        if (data.success) {
          console.log("📊 Date primite de la API:", data.data);
          console.log("📊 Numărul de activități returnate:", data.data.length);

          // Verifică câte activități aparțin utilizatorului curent
          const userActivities = data.data.filter((activity: Activity) =>
            activity.employee.includes(user.name || user.identifier || "")
          );
          console.log(
            "👤 Activități care aparțin utilizatorului curent:",
            userActivities.length
          );

          setRecentActivities(data.data);

          // Calculez statisticile pentru luna curentă
          const now = new Date();
          const currentYear = now.getFullYear();
          const currentMonth = now.getMonth();

          console.log("Calculez pentru anul și luna:", {
            currentYear,
            currentMonth,
          });

          const totalWorkingDays = getWorkingDaysInMonth(
            currentYear,
            currentMonth
          );
          const totalMonthlyHours = getTotalMonthlyHours(
            currentYear,
            currentMonth
          );
          const monthlyWorkedHours = getMonthlyWorkedHours(
            data.data,
            currentYear,
            currentMonth
          );
          const completedDays = getCompletedDaysFromActivities(
            data.data,
            currentYear,
            currentMonth
          );

          // Calculez orele lucrate azi
          const today = new Date().toISOString().split("T")[0];
          const todayActivities = data.data.filter((activity: Activity) => {
            const activityDate = new Date(activity.date)
              .toISOString()
              .split("T")[0];
            return activityDate === today;
          });

          console.log("Activități pentru astăzi:", todayActivities);

          // Calculez orele reale pe baza câmpului timeSpent din activități cu validare
          const hoursWorkedToday = todayActivities.reduce(
            (total: number, activity: Activity) => {
              let timeSpent = activity.timeSpent || 0;

              // Validare: timeSpent nu poate fi mai mare de 24 ore într-o zi
              if (timeSpent > 24) {
                console.warn(
                  `⚠️ Valoare timeSpent suspectă detectată: ${timeSpent}h pentru activitatea "${activity.activity}". Se limitează la 24h.`
                );
                timeSpent = 24;
              }

              // Validare: timeSpent nu poate fi negativă
              if (timeSpent < 0) {
                console.warn(
                  `⚠️ Valoare timeSpent negativă detectată: ${timeSpent}h pentru activitatea "${activity.activity}". Se setează la 0h.`
                );
                timeSpent = 0;
              }

              console.log(
                `Activitate: ${activity.activity}, Timp: ${timeSpent}h`
              );
              return total + timeSpent;
            },
            0
          );

          console.log("Total ore lucrate astăzi:", hoursWorkedToday);

          // Calculez progresul lunar bazat pe ore
          const monthlyProgress =
            totalMonthlyHours > 0
              ? Math.round((monthlyWorkedHours / totalMonthlyHours) * 100)
              : 0;

          setDashboardStats({
            completedDays,
            totalWorkingDays,
            hoursWorkedToday,
            totalMonthlyHours,
            monthlyWorkedHours,
            monthlyProgress,
          });

          // Generez datele pentru diagrama progresului lunar
          const chartData = generateMonthlyChartData(
            data.data,
            currentYear,
            currentMonth
          );
          setMonthlyChartData(chartData);
          console.log("Date diagramă generate:", chartData);
        } else {
          console.error("Eroare la încărcarea activităților:", data.error);
        }
      } catch (error) {
        console.error("Eroare la fetch activități:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [user]);

  const stats = [
    {
      title: "Zile Completate",
      value: `${dashboardStats.completedDays}`,
      change: `din ${dashboardStats.totalWorkingDays} zile`,
      icon: (
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
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      title: "Total Zile Luna",
      value: `${dashboardStats.totalWorkingDays}`,
      change: "zile lucrătoare",
      icon: (
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
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      title: "Ore Lucrate Azi",
      value: `${dashboardStats.hoursWorkedToday}h`,
      change: `din ${new Date().getDay() === 5 ? "6h" : "8h"} programate`,
      icon: (
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
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      title: "Progres Luna",
      value: `${dashboardStats.monthlyProgress}%`,
      change: `${dashboardStats.monthlyWorkedHours}h/${dashboardStats.totalMonthlyHours}h`,
      icon: (
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
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          />
        </svg>
      ),
    },
  ];

  // Opțiuni pentru formulare (momentan neutilizate, pot fi folosite în viitor)
  /*
  const rofOptions = [
    "ROF 11.1.1 Analizeaza, proiecteaza, programeaza, testeaza, implementeaza aplicatii specifice trezoreriei statului",
    "ROF 11.1.2 Realizeaza si intretine componenta de servicii informatice pentru trezoreria statului",
    "ROF 11.1.3 Actualizeaza aplicatiile dezvoltate cu modificarile legislative/procedurale",
    "ROF 11.1.4 Evalueaza necesarul de servicii de analiza, dezvoltare, testare",
    "ROF 11.1.5 Decide documentat daca noile servicii informatice se vor desfasura cu resurse proprii",
    "ROF 11.2.1 Adopta si respecta standardele, procedurile si metodologiile",
    "ROF 11.2.2 Asigura incadrarea activitatilor in liniile strategice",
    "ROF 11.5.1 Evalueaza cerintele, analizeaza, proiecteaza pentru TREZOR",
    "ROF 11.5.2 Extinde si optimizeaza aplicatiile informatice dezvoltate",
  ];

  const attributeOptions = [
    "1. Participa ca personal proiectant la dezvoltarea aplicatiilor informatice",
    "2. Participa si urmareste realizarea documentatiilor de specialitate",
    "3. Colaboreaza cu serviciile din cadrul directiei",
    "4. Desfasoara activitati pentru programe finantate din fonduri europene",
    "5. Desfasoara activitati de analiza pentru definirea specificatiilor",
    "15. Actualizeaza aplicatiile dezvoltate cu modificarile legislative",
    "19. Acorda asistenta tehnica pentru tratarea incidentelor",
    "23. Asigura interfete cu alte sisteme informatice MF",
  ];

  const workOptions = [
    "Trezor",
    "Trezor - asistenta tehnica",
    "Trezor - Baze de date",
    "Trezor - Virtual",
    "ForexeNomen",
    "ForexeSNM",
    "CAB",
    "CAB - asistenta tehnica",
    "eTrezor",
    "Mentenanta sistem informatic Forexebug",
    "Cursuri",
    "Participare in comisii de evaluare/receptie",
    "Studiu / consultare documentatii IT",
    "Alte activitati (repaus, masa, necesitati fiziologice, etc.)",
  ];
  */

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completat":
        return "bg-green-100 text-green-800";
      case "In Progres":
        return "bg-blue-100 text-blue-800";
      case "In Asteptare":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24">
      <div className="max-w-7xl mx-auto px-6 py-2">
        {/* Header */}
        <div className="mb-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Dashboard Activități
          </h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-1.5 bg-blue-50 rounded-md">
                  <div className="text-blue-600 text-sm">{stat.icon}</div>
                </div>
                {stat.change && (
                  <span className="text-sm font-medium text-green-600">
                    {stat.change}
                  </span>
                )}
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-600">{stat.title}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Monthly Progress Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">
              Ore Lucrate Lunar -{" "}
              {new Date().toLocaleDateString("ro-RO", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-1 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Ore lucrate pe zi</span>
              </div>
            </div>
          </div>

          <div className="relative">
            {/* Chart Container */}
            <div className="overflow-x-auto">
              <div
                className="relative h-64 pb-8"
                style={{ minWidth: `${monthlyChartData.length * 40}px` }}
              >
                {/* SVG Line Chart pentru orele lucrate */}
                <svg
                  className="absolute inset-0 w-full h-52"
                  viewBox={`0 0 ${monthlyChartData.length * 40} 208`}
                  preserveAspectRatio="none"
                >
                  {/* Grid lines pentru o mai bună vizualizare */}
                  <defs>
                    <pattern
                      id="grid"
                      width="40"
                      height="52"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 40 0 L 0 0 0 52"
                        fill="none"
                        stroke="#f3f4f6"
                        strokeWidth="1"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  {/* Axa Y cu markere pentru ore */}
                  {(() => {
                    const maxHours = Math.max(
                      ...monthlyChartData.map((d) => d.hoursWorked),
                      8 // Minimum 8 ore pentru scală
                    );
                    const steps = 4;
                    return Array.from({ length: steps + 1 }, (_, i) => {
                      const hours = (maxHours / steps) * i;
                      const y = 208 - (i / steps) * 180;
                      return (
                        <g key={i}>
                          <line
                            x1="0"
                            y1={y}
                            x2="100%"
                            y2={y}
                            stroke="#e5e7eb"
                            strokeWidth="1"
                            strokeDasharray="2,2"
                          />
                          <text
                            x="5"
                            y={y - 5}
                            fill="#6b7280"
                            fontSize="10"
                            fontFamily="Arial"
                          >
                            {hours.toFixed(1)}h
                          </text>
                        </g>
                      );
                    });
                  })()}

                  {/* Line Chart pentru ore lucrate */}
                  {monthlyChartData.length > 1 &&
                    (() => {
                      const maxHours = Math.max(
                        ...monthlyChartData.map((d) => d.hoursWorked),
                        8
                      );

                      const linePoints = monthlyChartData
                        .map((dayData, index) => {
                          const x = index * 40 + 20; // Center of each day
                          const y =
                            208 - (dayData.hoursWorked / maxHours) * 180;
                          return `${x},${y}`;
                        })
                        .join(" ");

                      return (
                        <>
                          {/* Shadow/gradient pentru linie */}
                          <defs>
                            <linearGradient
                              id="lineGradient"
                              x1="0%"
                              y1="0%"
                              x2="0%"
                              y2="100%"
                            >
                              <stop
                                offset="0%"
                                stopColor="#10b981"
                                stopOpacity="0.3"
                              />
                              <stop
                                offset="100%"
                                stopColor="#10b981"
                                stopOpacity="0.05"
                              />
                            </linearGradient>
                          </defs>

                          {/* Area sub linie */}
                          <polygon
                            fill="url(#lineGradient)"
                            points={`0,208 ${linePoints} ${
                              monthlyChartData.length * 40
                            },208`}
                          />

                          {/* Linia principală */}
                          <polyline
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={linePoints}
                            className="drop-shadow-sm"
                          />

                          {/* Data points */}
                          {monthlyChartData.map((dayData, index) => {
                            const x = index * 40 + 20;
                            const y =
                              208 - (dayData.hoursWorked / maxHours) * 180;

                            return (
                              <circle
                                key={index}
                                cx={x}
                                cy={y}
                                r="5"
                                fill={
                                  dayData.isWorkingDay ? "#10b981" : "#9ca3af"
                                }
                                stroke="#fff"
                                strokeWidth="2"
                                className="cursor-pointer hover:r-7 transition-all filter drop-shadow-sm"
                              />
                            );
                          })}
                        </>
                      );
                    })()}
                </svg>

                {/* Labels pentru zile */}
                <div className="flex items-end h-52">
                  {monthlyChartData.map((dayData, index) => {
                    return (
                      <div
                        key={index}
                        className="flex flex-col items-center group relative"
                        style={{ width: "40px" }}
                      >
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 shadow-lg">
                          <div className="font-medium">Ziua {dayData.day}</div>
                          <div className="text-green-300">
                            {dayData.hoursWorked.toFixed(1)} ore lucrate
                          </div>
                          <div className="text-blue-300">
                            {dayData.activitiesCount} activități
                          </div>
                        </div>

                        {/* Invisible hover area */}
                        <div className="w-full h-52 absolute top-0"></div>

                        {/* Day Label */}
                        <div
                          className={`mt-2 text-xs font-medium ${
                            dayData.isWorkingDay
                              ? "text-gray-700"
                              : "text-gray-400"
                          }`}
                        >
                          {dayData.day}
                        </div>

                        {/* Weekend Indicator */}
                        {!dayData.isWorkingDay && (
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(dayData.date).getDay() === 0 ? "D" : "S"}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Chart Summary */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-gray-600">Total activități</div>
                <div className="text-lg font-semibold text-gray-900">
                  {monthlyChartData.reduce(
                    (sum, day) => sum + day.activitiesCount,
                    0
                  )}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-gray-600">Total ore</div>
                <div className="text-lg font-semibold text-gray-900">
                  {monthlyChartData
                    .reduce((sum, day) => sum + day.hoursWorked, 0)
                    .toFixed(1)}
                  h
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-gray-600">Medie zilnică</div>
                <div className="text-lg font-semibold text-gray-900">
                  {(
                    monthlyChartData.reduce(
                      (sum, day) => sum + day.hoursWorked,
                      0
                    ) /
                      monthlyChartData.filter((day) => day.isWorkingDay)
                        .length || 0
                  ).toFixed(1)}
                  h
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Activities */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Activități Recente
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => window.location.reload()}
                      className="text-sm text-gray-600 hover:text-gray-800 font-medium px-2 py-1 rounded hover:bg-gray-100"
                      title="Actualizează datele"
                    >
                      🔄 Refresh
                    </button>
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      Vezi toate
                    </button>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {loading ? (
                  <div className="px-6 py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">
                      Se încarcă activitățile...
                    </p>
                  </div>
                ) : recentActivities.length === 0 ? (
                  <div className="px-6 py-8 text-center">
                    <p className="text-gray-500">
                      Nu există activități înregistrate
                    </p>
                  </div>
                ) : (
                  recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium text-gray-900">
                              {activity.activity}
                            </h3>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                activity.status
                              )}`}
                            >
                              {activity.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            {activity.work}
                          </p>
                          <p className="text-xs text-gray-500">
                            {activity.date} - {activity.employee}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">
                Acțiuni Rapide
              </h3>
              <div className="space-y-3">
                <Link href="/reports/activity/new">
                  <button className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
                    Înregistrare Nouă
                  </button>
                </Link>
                <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
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
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V9a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2z"
                    />
                  </svg>
                  Vezi ROF Complet
                </button>
                <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
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
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                  Raport Activități
                </button>
              </div>
            </div>

            {/* Employee Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">
                Informații Angajat
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Nume</p>
                  <p className="text-sm text-gray-600">Neaga Iulian Costin</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Cod</p>
                  <p className="text-sm text-gray-600">
                    [18123781 7848 executie]
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Departament
                  </p>
                  <p className="text-sm text-gray-600">SACPCA</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Data Curentă
                  </p>
                  <p className="text-sm text-gray-600">02.10.2025</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
