"use client";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("error");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    // Validări
    if (!identifier || !password || !confirmPassword || !resetCode) {
      setMessage("Toate câmpurile sunt obligatorii");
      setMessageType("error");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Parolele nu se potrivesc");
      setMessageType("error");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setMessage("Parola trebuie să aibă cel puțin 6 caractere");
      setMessageType("error");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "/api/user-management/direct-reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier: identifier,
            password: password,
            uniqueCode: resetCode,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage(data.message || "Parola a fost schimbată cu succes!");
        setMessageType("success");
        // Resetează formularul după succes
        setTimeout(() => {
          setIdentifier("");
          setPassword("");
          setConfirmPassword("");
          setResetCode("");
        }, 2000);
      } else {
        setMessage(data.error || "Eroare la resetarea parolei");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Eroare la resetarea parolei:", error);
      setMessage("Eroare de conexiune. Te rugăm să încerci din nou.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Resetare Parolă
          </h1>
          <p className="text-gray-600 text-sm">
            Introdu codul unic pentru a-ți reseta parola
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleReset} className="space-y-4">
          {/* Cod Utilizator */}
          <div>
            <label
              htmlFor="identifier"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Cod Utilizator
            </label>
            <input
              id="identifier"
              type="text"
              placeholder="ex: 18123781"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={loading}
              required
            />
          </div>

          {/* Cod Unic de Resetare */}
          <div>
            <label
              htmlFor="resetCode"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Cod Unic de Resetare
            </label>
            <input
              id="resetCode"
              type="text"
              placeholder="Cod unic (123456)"
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={loading}
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Contactează administratorul pentru a obține codul
            </p>
          </div>

          {/* Parolă Nouă */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Parolă Nouă
            </label>
            <input
              id="password"
              type="password"
              placeholder="Minimum 6 caractere"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={loading}
              required
              minLength={6}
            />
          </div>

          {/* Confirmă Parola */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirmă Parola
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Reintroduceți parola"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={loading}
              required
              minLength={6}
            />
          </div>

          {/* Message */}
          {message && (
            <div
              className={`p-4 rounded-lg text-sm ${
                messageType === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={
              loading ||
              !identifier ||
              !password ||
              !confirmPassword ||
              !resetCode
            }
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Se resetează...
              </span>
            ) : (
              "Resetează Parola"
            )}
          </button>

          {/* Back to Login */}
          <div className="text-center mt-6">
            <Link
              href="/login"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              ← Înapoi la autentificare
            </Link>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>ℹ️ Notă:</strong> Codul unic de resetare este necesar pentru
            securitatea si resetarea parolei. Dacă nu știi codul, contactează
            administratorul sistemului.
          </p>
        </div>
      </div>
    </div>
  );
}
