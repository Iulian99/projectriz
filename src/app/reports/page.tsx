"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

interface CalendarData {
  completedDays: number[];
  inProgressDays: number[];
  dayActivities: { [key: string]: DayActivity[] };
  statistics: {
    totalActivities: number;
    completedDays: number;
    inProgressDays: number;
    workingDays: number;
    completionRate: number;
    daysInMonth: number;
  };
}

interface DayActivity {
  id: number;
  date: Date;
  status: string;
  activity: string;
  work: string;
}

export default function ReportsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [reportStatus, setReportStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Încărcare date calendar din API
  const loadCalendarData = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      console.log("Loading calendar data for:", {
        userId: user.id,
        year,
        month,
      });

      const response = await fetch(
        `/api/reports/calendar?userId=${user.id}&year=${year}&month=${month}`
      );

      if (response.ok) {
        const result = await response.json();
        console.log("Calendar data received:", result);
        setCalendarData(result.data);
      } else {
        console.error("Eroare la încărcarea datelor de calendar");
      }
    } catch (error) {
      console.error("Eroare la conectarea la API:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, currentDate]);

  // Încarcă datele când se schimbă luna sau utilizatorul
  useEffect(() => {
    loadCalendarData();
  }, [loadCalendarData]);

  // Calculează datele pentru calendar
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const completedDays = calendarData?.completedDays || [];
  const inProgressDays = calendarData?.inProgressDays || [];

  const firstDayOfWeek = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  // Convertește la format european (Luni = 0, Duminică = 6)
  const firstDayEuropean = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  // Helper functions for Romanian holidays
  function getRomanianHolidays(year: number) {
    return [
      { date: new Date(year, 0, 1), name: "Anul Nou" },
      { date: new Date(year, 0, 2), name: "Anul Nou" },
      { date: new Date(year, 0, 6), name: "Boboteaza" },
      { date: new Date(year, 0, 7), name: "Sfântul Ioan Botezătorul" },
      { date: new Date(year, 0, 24), name: "Ziua Unirii Principatelor Române" },
      { date: new Date(year, 4, 1), name: "Ziua Muncii" },
      { date: new Date(year, 5, 1), name: "Ziua Copilului" },
      { date: new Date(year, 7, 15), name: "Adormirea Maicii Domnului" },
      { date: new Date(year, 10, 30), name: "Sfântul Andrei" },
      { date: new Date(year, 11, 1), name: "Ziua Națională a României" },
      { date: new Date(year, 11, 25), name: "Crăciunul" },
      { date: new Date(year, 11, 26), name: "A doua zi de Crăciun" },
    ];
  }

  function isNationalHoliday(date: Date) {
    const holidays = getRomanianHolidays(date.getFullYear());
    return holidays.some((h) => h.date.toDateString() === date.toDateString());
  }

  function getHolidayName(date: Date) {
    const holidays = getRomanianHolidays(date.getFullYear());
    const found = holidays.find(
      (h) => h.date.toDateString() === date.toDateString()
    );
    return found ? found.name : "";
  }

  // Calendar generation function
  function generateCalendarDays() {
    const days = [];
    const today = new Date();
    const isCurrentMonth =
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear();

    // Empty days at the beginning of the month
    for (let i = 0; i < firstDayEuropean; i++) {
      days.push(
        <div
          key={"empty-" + i}
          className="calendar-day empty h-16 w-full bg-gray-100 border border-gray-200 rounded-lg"
        ></div>
      );
    }

    // Month days
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = isCurrentMonth && day === today.getDate();

      // Calculează ziua săptămânii corect
      const fullDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const dayOfWeek = fullDate.getDay(); // 0=Duminică, 1=Luni, ..., 6=Sâmbătă
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Duminică sau Sâmbătă

      const isHoliday = isNationalHoliday(fullDate);
      const holidayName = getHolidayName(fullDate);
      const isNonWorkingDay = isWeekend || isHoliday;

      // Verifică dacă ziua este completată sau în progres
      const isCompleted = completedDays.includes(day);
      const isInProgress = inProgressDays.includes(day);
      const dayActivities = calendarData?.dayActivities?.[day.toString()] || [];
      const hasActivities = dayActivities.length > 0;

      // Determină stilurile pentru diferite stări
      let dayStyles =
        "calendar-day h-16 w-full flex flex-col items-center justify-center text-sm font-semibold transition-all duration-300 relative overflow-hidden border border-transparent group rounded-lg";

      if (isHoliday) {
        dayStyles +=
          " bg-gradient-to-br from-red-50 to-rose-50 text-red-700 border-red-200 hover:shadow-lg";
      } else if (isWeekend) {
        dayStyles +=
          " bg-gradient-to-br from-gray-200 to-slate-200 text-gray-500 border-gray-400 cursor-not-allowed";
      } else if (isCompleted) {
        dayStyles +=
          " bg-gradient-to-br from-green-50 to-emerald-50 text-green-700 border-green-200 hover:shadow-xl hover:scale-105 shadow-md";
      } else if (isInProgress) {
        dayStyles +=
          " bg-gradient-to-br from-yellow-50 to-amber-50 text-amber-700 border-yellow-200 hover:shadow-xl hover:scale-105 shadow-md";
      } else if (hasActivities) {
        dayStyles +=
          " bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-700 border-blue-200 hover:shadow-xl hover:scale-105 shadow-md";
      } else {
        dayStyles +=
          " bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300 hover:shadow-lg hover:scale-105";
      }

      if (isToday) {
        dayStyles += " ring-2 ring-blue-400 ring-offset-2 shadow-lg";
      }

      if (!isNonWorkingDay) {
        dayStyles += " cursor-pointer";
      } else {
        dayStyles += " cursor-not-allowed opacity-75";
      }

      // Tooltip pentru activități
      let tooltip = "";
      if (isHoliday) {
        tooltip = holidayName;
      } else if (isWeekend) {
        const weekendDay = dayOfWeek === 0 ? "Duminică" : "Sâmbătă";
        tooltip = `${weekendDay} - Zi liberă`;
      } else {
        tooltip = "Zi lucrătoare";
      }

      if (dayActivities.length > 0) {
        tooltip += ` • ${dayActivities.length} activită${
          dayActivities.length === 1 ? "te" : "ți"
        }`;
      }

      days.push(
        <button
          key={day}
          onClick={() => {
            if (!isNonWorkingDay) {
              router.push(
                "/reports/daily/" +
                  currentDate.getFullYear() +
                  "/" +
                  String(currentDate.getMonth() + 1).padStart(2, "0") +
                  "/" +
                  String(day).padStart(2, "0")
              );
            }
          }}
          className={dayStyles}
          disabled={isNonWorkingDay}
          title={tooltip}
          type="button"
        >
          <span className="text-base font-bold mb-1">{day}</span>

          {/* Numele sărbătorii pentru zilele de sărbătoare */}
          {isHoliday && holidayName && (
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-full px-1">
              <span className="text-xs text-red-700 font-medium text-center block leading-tight truncate">
                {holidayName}
              </span>
            </div>
          )}

          {/* Indicator pentru activități */}
          {hasActivities && !isNonWorkingDay && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
              <div
                className={`w-2 h-2 rounded-full shadow-sm ${
                  isCompleted
                    ? "bg-green-500"
                    : isInProgress
                    ? "bg-amber-500"
                    : "bg-blue-500"
                }`}
              ></div>
            </div>
          )}

          {/* Numărul de activități pentru zilele cu multe activități */}
          {dayActivities.length > 1 && (
            <span className="absolute top-2 right-2 text-xs bg-white/90 backdrop-blur-sm rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-sm border border-gray-200">
              {dayActivities.length}
            </span>
          )}

          {/* Indicator pentru ziua curentă */}
          {isToday && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          )}
        </button>
      );
    }
    return days;
  }

  // Navigation functions
  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  // Excel report generation function
  const handleGenerateExcelReport = async () => {
    try {
      setIsGeneratingReport(true);
      const month =
        currentDate.getFullYear() +
        "-" +
        String(currentDate.getMonth() + 1).padStart(2, "0");
      const reportUrl =
        "/api/reports/excel?userId=" + (user?.id || "") + "&month=" + month;
      window.open(reportUrl, "_blank");
      setReportStatus({
        success: true,
        message:
          "Raportul pentru " +
          currentDate.toLocaleDateString("ro-RO", {
            month: "long",
            year: "numeric",
          }) +
          " a fost generat cu succes.",
      });
    } catch (error) {
      console.error("Eroare la generarea raportului Excel:", error);
      setReportStatus({
        success: false,
        message:
          "A apărut o eroare la generarea raportului. Vă rugăm să încercați din nou.",
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="border-b border-gray-200 mb-8">
          <div className="bg-white px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-gray-900">
                Calendar Activități
              </h1>
              <button
                onClick={handleGenerateExcelReport}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 disabled:opacity-50 rounded-md transition-colors"
                disabled={isGeneratingReport}
              >
                {isGeneratingReport ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generează...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
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
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span>Export Excel</span>
                  </div>
                )}
              </button>
            </div>
            {reportStatus && (
              <div
                className={`mt-4 p-4 border shadow-sm ${
                  reportStatus.success
                    ? "bg-green-50 text-green-800 border-green-200"
                    : "bg-red-50 text-red-800 border-red-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  {reportStatus.success ? (
                    <svg
                      className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0"
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
                  )}
                  <span className="text-sm font-medium">
                    {reportStatus.message}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-6">
          {/* Calendar Section - Main Content */}
          <div className="flex-1 space-y-4">
            {/* Month Navigation */}
            <div className="bg-white border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 hover:bg-gray-50"
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
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  <span>Anterior</span>
                </button>

                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {currentDate.toLocaleDateString("ro-RO", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h2>
                </div>

                <button
                  onClick={() => navigateMonth(1)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 hover:bg-gray-50"
                >
                  <span>Următorul</span>
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
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white border border-gray-200 p-6">
              {isLoading && (
                <div className="flex justify-center py-8">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
                    <span className="text-gray-600">Se încarcă...</span>
                  </div>
                </div>
              )}

              {!isLoading && (
                <div className="grid grid-cols-7 gap-3">
                  {/* Day Headers */}
                  {[
                    "Luni",
                    "Marți",
                    "Miercuri",
                    "Joi",
                    "Vineri",
                    "Sâmbătă",
                    "Duminică",
                  ].map((day, index) => (
                    <div
                      key={index}
                      className="text-center font-semibold text-gray-500 py-4 text-sm uppercase tracking-wide"
                    >
                      {day.slice(0, 3)}
                    </div>
                  ))}
                  {generateCalendarDays()}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Statistics and Controls */}
          <div className="w-80 space-y-4">
            {/* Statistics */}
            {calendarData && (
              <div className="bg-white border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Statistici
                </h3>

                {/* Progress Circle */}
                {/* Progress Circle simplificat */}
                <div className="flex justify-center mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {calendarData.statistics.completionRate}%
                    </div>
                    <div className="text-sm text-gray-600">Completat</div>
                  </div>
                </div>

                {/* Stats simplificate */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">
                      Zile Completate
                    </span>
                    <span className="font-semibold text-gray-900">
                      {calendarData.statistics.completedDays}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">În Progres</span>
                    <span className="font-semibold text-gray-900">
                      {calendarData.statistics.inProgressDays}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">
                      Total Activități
                    </span>
                    <span className="font-semibold text-gray-900">
                      {calendarData.statistics.totalActivities}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">
                      Zile Lucrătoare
                    </span>
                    <span className="font-semibold text-gray-900">
                      {calendarData.statistics.workingDays}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="bg-white border border-gray-200 p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Legendă</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500"></div>
                  <span className="text-gray-700">Completat</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500"></div>
                  <span className="text-gray-700">În progres</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500"></div>
                  <span className="text-gray-700">Cu activități</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-100"></div>
                  <span className="text-gray-700">Fără activități</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-300"></div>
                  <span className="text-gray-700">Sărbătoare</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-400"></div>
                  <span className="text-gray-700">Weekend</span>
                </div>
              </div>
            </div>

            {/* Romanian Holidays */}
            <div className="bg-white border border-gray-200 p-4">
              <h4 className="font-semibold text-gray-900 mb-3">
                Sărbători Naționale
              </h4>
              <div className="space-y-2 text-sm max-h-48 overflow-y-auto">
                {getRomanianHolidays(currentDate.getFullYear()).map(
                  (holiday, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded"
                    >
                      <div className="w-3 h-3 bg-red-300 rounded-full mt-1 flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-xs">
                          {holiday.name}
                        </div>
                        <div className="text-gray-600 text-xs">
                          {holiday.date.toLocaleDateString("ro-RO", {
                            day: "numeric",
                            month: "long",
                          })}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
