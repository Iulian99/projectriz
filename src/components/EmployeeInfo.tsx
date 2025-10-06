"use client";
import React from "react";

interface User {
  id: number;
  name: string;
  email: string;
  identifier: string;
  department?: string;
  role: string;
}

interface EmployeeInfoProps {
  user: User | null;
}

export default function EmployeeInfo({ user }: EmployeeInfoProps) {
  // Formatarea datei curente
  const getCurrentDate = () => {
    return new Date().toLocaleDateString("ro-RO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (!user) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-3">
            Informații Angajat
          </h3>
          <div className="px-6 py-8 text-center">
            <p className="text-gray-500">Nu sunt disponibile informații</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-3">
          Informații Angajat
        </h3>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-700">Nume</p>
            <p className="text-sm text-gray-600">{user.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Cod</p>
            <p className="text-sm text-gray-600">{user.identifier}</p>
          </div>
          {user.department && (
            <div>
              <p className="text-sm font-medium text-gray-700">Departament</p>
              <p className="text-sm text-gray-600">{user.department}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-700">Email</p>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Rol</p>
            <p className="text-sm text-gray-600 capitalize">
              {user.role.toLowerCase()}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Data Curentă</p>
            <p className="text-sm text-gray-600">{getCurrentDate()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
