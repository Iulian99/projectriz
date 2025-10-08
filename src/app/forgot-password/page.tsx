
"use client";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    if (!user || !password) {
      setMessage("Completează user și parolă nouă");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setMessage("Parola trebuie să aibă cel puțin 6 caractere");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch("/api/user-management/direct-reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: user, password }),
      });
      const data = await response.json();
      if (data.success) {
        setMessage("Parola a fost schimbată cu succes!");
      } else {
        setMessage(data.error || "Eroare la resetare");
      }
    } catch (err) {
      setMessage("Eroare de conexiune");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-blue-600 text-center">Resetare rapidă parolă</h1>
        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="text"
            placeholder="User (identifier)"
            value={user}
            onChange={e => setUser(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Parolă nouă"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !user || !password}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md"
          >
            {loading ? "Se resetează..." : "Resetează parolă"}
          </button>
          {message && (
            <div className="mt-2 text-sm text-center text-red-600">{message}</div>
          )}
        </form>
      </div>
    </div>
  );
}
