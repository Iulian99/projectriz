// checked
"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import DashboardStatsCards from "@/components/DashboardStats";
import MonthlyProgressChart from "@/components/MonthlyProgressChart";
import RecentActivities from "@/components/RecentActivities";
import EmployeeInfo from "@/components/EmployeeInfo";
import DashboardHeader from "@/components/DashboardHeader";
import {
  getMonthlyWorkedHours,
  getCompletedDaysFromActivities,
  getWorkingDaysInMonth,
  getTotalMonthlyHours,
  validateTimeSpent,
  parseActivityDate,
} from "@/lib/dashboard-utils";

interface Activity {
  id: number;
  date: string; // Format ISO (YYYY-MM-DD)
  displayDate?: string;
  employee: string;
  activity: string;
  work: string;
  status: string;
  timeSpent?: number; // Orele lucrate
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
      const activityDate = parseActivityDate(activity.date);
      return activityDate.toISOString().split("T")[0] === dateStr;
    });

    // Calculează orele totale pentru această zi cu validare
    const hoursWorked = dayActivities.reduce((total, activity) => {
      const validatedTime = validateTimeSpent(activity.timeSpent, 24);
      return total + validatedTime;
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
        const response = await fetch(`/api/data?userId=${user.id}`);
        const data = await response.json();

        if (data.success) {
          setRecentActivities(data.data);

          // Statisticile pentru luna curentă
          const now = new Date();
          const currentYear = now.getFullYear();
          const currentMonth = now.getMonth();

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

          // Orele lucrate azi
          const today = new Date().toISOString().split("T")[0];
          const todayActivities = data.data.filter((activity: Activity) => {
            const activityDate = parseActivityDate(activity.date);
            return activityDate.toISOString().split("T")[0] === today;
          });

          const hoursWorkedToday = todayActivities.reduce(
            (total: number, activity: Activity) => {
              const validatedTime = validateTimeSpent(activity.timeSpent, 8);
              return total + validatedTime;
            },
            0
          );

          // Progresul lunar bazat pe ore
          const monthlyProgress =
            totalMonthlyHours > 0
              ? Math.round((monthlyWorkedHours / totalMonthlyHours) * 100)
              : 0;

          // Setare DashboardStats
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

  return (
    <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24">
      <div className="max-w-7xl mx-auto px-6 py-2">
        {/* Header */}
        <DashboardHeader />

        {/* Stats Cards */}
        <DashboardStatsCards stats={dashboardStats} />

        {/* Monthly Progress Chart */}
        <MonthlyProgressChart monthlyChartData={monthlyChartData} />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Activities */}
          <RecentActivities
            activities={recentActivities}
            loading={loading}
            onRefresh={() => window.location.reload()}
          />

          {/* Employee Info */}
          <EmployeeInfo user={user} />
        </div>
      </div>
    </div>
  );
}
