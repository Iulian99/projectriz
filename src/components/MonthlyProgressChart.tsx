"use client";
import React from "react";

interface DailyChartData {
  day: number;
  date: string;
  activitiesCount: number;
  hoursWorked: number;
  isWorkingDay: boolean;
}

interface MonthlyProgressChartProps {
  monthlyChartData: DailyChartData[];
}

export default function MonthlyProgressChart({
  monthlyChartData,
}: MonthlyProgressChartProps) {
  return (
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
                      const y = 208 - (dayData.hoursWorked / maxHours) * 180;
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
                        const y = 208 - (dayData.hoursWorked / maxHours) * 180;

                        return (
                          <circle
                            key={index}
                            cx={x}
                            cy={y}
                            r="5"
                            fill={dayData.isWorkingDay ? "#10b981" : "#9ca3af"}
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
                        dayData.isWorkingDay ? "text-gray-700" : "text-gray-400"
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
                ) / monthlyChartData.filter((day) => day.isWorkingDay).length ||
                0
              ).toFixed(1)}
              h
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
