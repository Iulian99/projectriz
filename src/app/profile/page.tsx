"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";

interface UserProfile {
  id: number;
  identifier: string;
  name: string;
  role: string;
  department: string | null;
  email: string;
  badge: string | null;
  position: string | null;
  employeeCode: string | null;
  unit: string | null;
  phone: string | null;
  address: string | null;
  birthDate: string | null;
  hireDate: string | null;
  status: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load profile data
  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/profile?userId=${user.id}`);
      const data = await response.json();

      if (data.success) {
        setProfile(data.user);
      } else {
        setError(data.error || "Eroare la încărcarea profilului");
      }
    } catch (error) {
      console.error("Eroare la încărcarea profilului:", error);
      setError("Eroare de conexiune");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: profile.id,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          address: profile.address,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setProfile(data.user);
        setSuccess("Profilul a fost actualizat cu succes!");
        setIsEditing(false);
      } else {
        setError(data.error || "Eroare la salvarea profilului");
      }
    } catch (error) {
      console.error("Eroare la salvarea profilului:", error);
      setError("Eroare de conexiune");
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Nu este specificată";
    return new Date(dateString).toLocaleDateString("ro-RO");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Se încarcă profilul...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Profilul nu a putut fi încărcat</p>
          {error && <p className="text-sm text-gray-600 mt-2">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Profil Utilizator</h1>
          </div>

          {/* Mesaje de eroare/succes */}
          {error && (
            <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mx-6 mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          <div className="p-6">
            {/* Informații profil */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Coloana stânga - Avatar și informații principale */}
              <div className="md:col-span-1">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-16 h-16 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    {profile.name}
                  </h2>
                  <p className="text-gray-500 mb-4">
                    {profile.position || "Poziție nespecificată"}
                  </p>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                    >
                      Editează Profil
                    </button>
                  )}
                </div>
              </div>

              {/* Coloana dreapta - Detalii */}
              <div className="md:col-span-2">
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-2 gap-6">
                    {/* Număr Marcă */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Număr Marcă
                      </label>
                      <p className="text-gray-900">
                        {profile.badge || "Nu este specificat"}
                      </p>
                    </div>

                    {/* Cod Angajat */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cod Angajat
                      </label>
                      <p className="text-gray-900">
                        {profile.employeeCode || "Nu este specificat"}
                      </p>
                    </div>

                    {/* Nume Complet */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nume Complet
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profile.name || ""}
                          onChange={(e) =>
                            setProfile({ ...profile, name: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">{profile.name}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={profile.email || ""}
                          onChange={(e) =>
                            setProfile({ ...profile, email: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">{profile.email}</p>
                      )}
                    </div>

                    {/* Poziție */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Poziție
                      </label>
                      <p className="text-gray-900">
                        {profile.position || "Nu este specificată"}
                      </p>
                    </div>

                    {/* Departament */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Departament
                      </label>
                      <p className="text-gray-900">
                        {profile.department || "Nu este specificat"}
                      </p>
                    </div>

                    {/* Unitate */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unitate
                      </label>
                      <p className="text-gray-900">
                        {profile.unit || "Nu este specificată"}
                      </p>
                    </div>

                    {/* Rol */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rol
                      </label>
                      <p className="text-gray-900 capitalize">{profile.role}</p>
                    </div>

                    {/* Telefon */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefon
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={profile.phone || ""}
                          onChange={(e) =>
                            setProfile({ ...profile, phone: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">
                          {profile.phone || "Nu este specificat"}
                        </p>
                      )}
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <p className="text-gray-900">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            profile.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {profile.status === "active" ? "Activ" : "Inactiv"}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Adresă */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adresă
                    </label>
                    {isEditing ? (
                      <textarea
                        value={profile.address || ""}
                        onChange={(e) =>
                          setProfile({ ...profile, address: e.target.value })
                        }
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {profile.address || "Nu este specificată"}
                      </p>
                    )}
                  </div>

                  {/* Date importante */}
                  <div className="mt-6 grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data nașterii
                      </label>
                      <p className="text-gray-900">
                        {formatDate(profile.birthDate)}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data angajării
                      </label>
                      <p className="text-gray-900">
                        {formatDate(profile.hireDate)}
                      </p>
                    </div>
                  </div>

                  {/* Butoane */}
                  {isEditing && (
                    <div className="mt-8 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setError("");
                          setSuccess("");
                          fetchProfile(); // Reload original data
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        disabled={isSaving}
                      >
                        Anulează
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-blue-400 disabled:cursor-not-allowed"
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Se salvează...
                          </div>
                        ) : (
                          "Salvează Modificările"
                        )}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
