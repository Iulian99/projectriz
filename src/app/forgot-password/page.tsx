"use client";

import { useState } from "react";
import {
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-purple-200 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-blue-600">
            {emailSent ? "Email Trimis!" : "Resetare Parolă"}
          </h1>
          <p className="text-gray-600">
            {emailSent
              ? "Verifică-ți email-ul pentru instrucțiuni"
              : "Vei primi pe mail un link de resetare parolă"}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {!emailSent ? (
            <>
              {/* Mesaje de eroare/succes */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-green-700 text-sm">{success}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Identifier Input */}
                <div>
                  <label
                    htmlFor="identifier"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    UID sau Adresa de Email
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="identifier"
                      type="text"
                      required
                      value={formData.identifier}
                      onChange={(e) => handleInputChange(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Introdu UID-ul sau email-ul"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !formData.identifier}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center group"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      Trimite Link de Resetare
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Success State */
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Email trimis cu succes!
                </h3>
                <p className="text-gray-600 text-sm">
                  Am trimis instrucțiuni de resetare parolă pentru: <br />
                  <span className="font-medium text-gray-900">
                    {formData.identifier}
                  </span>
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  <strong>Verifică-ți email-ul</strong> și urmează
                  instrucțiunile pentru a-ți reseta parola. Link-ul va expira în{" "}
                  <strong>1 oră</strong>.
                </p>
              </div>

              <button
                onClick={handleBackToLogin}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center group"
              >
                <ArrowLeft className="mr-2 w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                Încearcă din nou
              </button>
            </div>
          )}

          {/* Back to Login Link */}
          {!emailSent && (
            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center group"
              >
                <ArrowLeft className="mr-1 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Înapoi la Login
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          {emailSent ? (
            <p>
              Nu ai primit email-ul?{" "}
              <button
                onClick={handleBackToLogin}
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Încearcă din nou
              </button>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
