// checked
"use client";

import { useState } from "react";
import ForgotPasswordUI from "@/components/ForgotPasswordUI";

interface ForgotPasswordFormData {
  identifier: string;
}

interface ForgotPasswordResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [emailSent, setEmailSent] = useState(false);

  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    identifier: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/user-management/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data: ForgotPasswordResponse = await response.json();

      if (data.success) {
        setSuccess(data.message || "Email de resetare trimis cu succes!");
        setEmailSent(true);
      } else {
        setError(data.error || "Eroare la trimiterea email-ului");
      }
    } catch (error) {
      console.error("Eroare la forgot password:", error);
      setError("Eroare de conexiune. Încearcă din nou.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    setFormData({ identifier: value });
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleBackToLogin = () => {
    setEmailSent(false);
    setError("");
    setSuccess("");
    setFormData({ identifier: "" });
  };

  return (
    <ForgotPasswordUI
      isLoading={isLoading}
      error={error}
      success={success}
      emailSent={emailSent}
      formData={formData}
      handleSubmit={handleSubmit}
      handleInputChange={handleInputChange}
      handleBackToLogin={handleBackToLogin}
    />
  );
}
