"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import ProfileUI from "@/components/ProfileUI";

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

  return (
    <ProfileUI
      isLoading={isLoading}
      profile={profile}
      isEditing={isEditing}
      isSaving={isSaving}
      error={error}
      success={success}
      setIsEditing={setIsEditing}
      setProfile={setProfile}
      handleSubmit={handleSubmit}
      formatDate={formatDate}
      fetchProfile={fetchProfile}
      setError={setError}
      setSuccess={setSuccess}
    />
  );
}
