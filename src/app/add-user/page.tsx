"use client";
import { useState } from "react";

export default function AddUserPage() {
  const [form, setForm] = useState({
    codUtilizator: "",
    denumireUtilizator: "",
    email: "",
    password: "",
    codFunctie: "",
    codServ: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch("/api/user-management/add-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setLoading(false);
      if (!data.success) {
        setError(data.error || "Eroare la adăugare utilizator!");
        return;
      }
      setSuccess("Utilizator adăugat cu succes!");
      setForm({
        codUtilizator: "",
        denumireUtilizator: "",
        email: "",
        password: "",
        codFunctie: "",
        codServ: "",
      });
    } catch {
      setLoading(false);
      setError("Eroare la adăugare utilizator!");
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Adaugă Utilizator Nou</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="codUtilizator"
          value={form.codUtilizator}
          onChange={handleChange}
          required
          placeholder="Cod Utilizator"
          className="w-full border p-2 rounded"
        />
        <input
          name="denumireUtilizator"
          value={form.denumireUtilizator}
          onChange={handleChange}
          required
          placeholder="Nume Utilizator"
          className="w-full border p-2 rounded"
        />
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          placeholder="Email"
          className="w-full border p-2 rounded"
        />
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
          placeholder="Parolă"
          className="w-full border p-2 rounded"
        />
        <input
          name="codFunctie"
          value={form.codFunctie}
          onChange={handleChange}
          required
          placeholder="Cod Funcție (ex: ADMIN)"
          className="w-full border p-2 rounded"
        />
        <input
          name="codServ"
          value={form.codServ}
          onChange={handleChange}
          required
          placeholder="Cod Serviciu (ex: IT)"
          className="w-full border p-2 rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          {loading ? "Se adaugă..." : "Adaugă Utilizator"}
        </button>
      </form>
      {error && <div className="mt-4 text-center text-red-600">{error}</div>}
      {success && (
        <div className="mt-4 text-center text-green-600">{success}</div>
      )}
    </div>
  );
}
