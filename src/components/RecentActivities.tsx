"use client";
import React from "react";

interface Activity {
  id: number;
  date: string;
  displayDate?: string;
  employee: string;
  activity: string;
  work: string;
  status: string;
  timeSpent?: number;
}

interface RecentActivitiesProps {
  activities: Activity[];
  loading: boolean;
  onRefresh?: () => void;
}

export default function RecentActivities({
  activities,
  loading,
  onRefresh,
}: RecentActivitiesProps) {
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
    <div className="lg:col-span-2">
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Activități Recente
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={onRefresh || (() => window.location.reload())}
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
          ) : activities.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-gray-500">Nu există activități înregistrate</p>
            </div>
          ) : (
            activities.map((activity) => (
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
  );
}
