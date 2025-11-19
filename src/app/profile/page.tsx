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
  const { user } = useAuth(); // get logged in user
  const [isEditing, setIsEditing] = useState(false); // edit mode
  const [profile, setProfile] = useState<UserProfile | null>(null); // user profile data
  const [isLoading, setIsLoading] = useState(true); // loading state
  const [isSaving, setIsSaving] = useState(false); // saving state
  const [error, setError] = useState(""); // error message
  const [success, setSuccess] = useState(""); // success message
  const [canEdit, setCanEdit] = useState(true); // edit permission

  // Load profile data
  const fetchProfile = useCallback(async () => {
    if (!user?.id && !user?.identifier) return;

    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (user?.id) params.append("userId", String(user.id));
      if (user?.identifier) params.append("identifier", user.identifier);
      const response = await fetch(`/api/profile?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setProfile(data.user);
        setCanEdit(data.canEdit !== false);
      } else {
        setError(data.error || "Eroare la încărcarea profilului");
        setCanEdit(false);
      }
    } catch (error) {
      console.error("Eroare la încărcarea profilului:", error);
      setError("Eroare de conexiune");
      setCanEdit(false);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.identifier]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (!canEdit) {
      setError("Profilul este doar în citire pentru acest cont.");
      return;
    }

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
          identifier: profile.identifier,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          address: profile.address,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setProfile(data.user);
        setCanEdit(data.canEdit !== false);
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
      canEdit={canEdit}
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
