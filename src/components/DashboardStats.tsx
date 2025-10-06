"use client";
import React from "react";

interface DashboardStats {
  completedDays: number;
  totalWorkingDays: number;
  hoursWorkedToday: number;
  totalMonthlyHours: number;
  monthlyWorkedHours: number;
  monthlyProgress: number;
}

interface StatCard {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
}

interface DashboardStatsProps {
  stats: DashboardStats;
}

export default function DashboardStatsCards({ stats }: DashboardStatsProps) {
  const statsCards: StatCard[] = [
    {
      title: "Zile Completate",
      value: `${stats.completedDays}`,
      change: `din ${stats.totalWorkingDays} zile`,
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
      value: `${stats.totalWorkingDays}`,
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
      value: `${stats.hoursWorkedToday}h`,
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
      value: `${stats.monthlyProgress}%`,
      change: `${stats.monthlyWorkedHours}h/${stats.totalMonthlyHours}h`,
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statsCards.map((stat, index) => (
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
            <p className="text-xl font-bold text-gray-900 mb-1">{stat.value}</p>
            <p className="text-xs text-gray-600">{stat.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
