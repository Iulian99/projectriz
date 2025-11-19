"use client";

import { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  User,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Briefcase,
  Building2,
} from "lucide-react";
import LoginWaterBubbles from "@/components/WaterBubbles";
import LoginDynamicTitle from "@/components/DynamicTitle";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface RegisterFormData {
  codUtilizator: string;
  denumireUtilizator: string;
  email: string;
  password: string;
  confirmPassword: string;
  codFunctie: string;
  codServ: string;
  numarMatricol: string;
}

interface Functie {
  cod_functie: string;
  denumire_functie: string;
  tip_functie: string;
}

interface Serviciu {
  cod_serv: string;
  denumire_serv: string;
  cod_dir: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [functii, setFunctii] = useState<Functie[]>([]);
  const [servicii, setServicii] = useState<Serviciu[]>([]);
  const [loadingNomenclators, setLoadingNomenclators] = useState(true);
  const [loadingRole, setLoadingRole] = useState(true); // State to track role verification

  const [formData, setFormData] = useState<RegisterFormData>({
    codUtilizator: "",
    denumireUtilizator: "",
    email: "",
    password: "",
    confirmPassword: "",
    codFunctie: "",
    codServ: "",
    numarMatricol: "",
  });

  // Încarcă nomenclatoarele la montarea componentei
  useEffect(() => {
    async function loadNomenclatoare() {
      try {
        const response = await fetch("/api/nomenclatoare/register");
        const data = await response.json();

        if (data.success) {
          const allowedFunctii = ["expert", "sef", "consilier", "director"];
          const allowedServicii = ["sape", "sacpca", "saabtssf", "sat", "dir"];

          setFunctii(
            data.functii.filter((functie: Functie) =>
              allowedFunctii.includes(functie.cod_functie)
            )
          );
          setServicii(
            data.servicii.filter((serviciu: Serviciu) =>
              allowedServicii.includes(serviciu.cod_serv)
            )
          );
        } else {
          console.warn("Nomenclatoare incomplete sau indisponibile.");
        }
      } catch (error) {
        console.error("Eroare la încărcarea nomenclatoarelor:", error);
      } finally {
        setLoadingNomenclators(false);
      }
    }

    loadNomenclatoare();
  }, []);

  // Verifică rolul utilizatorului la montare
  useEffect(() => {
    async function checkUserRole() {
      try {
        const response = await fetch("/api/auth/session");
        const data = await response.json();

        if (!data.success || !["sef", "director"].includes(data.role)) {
          router.push("/unauthorized");
        }
      } catch (error) {
        console.error("Eroare la verificarea rolului utilizatorului:", error);
        router.push("/unauthorized");
      } finally {
        setLoadingRole(false); // Role verification complete
      }
    }

    checkUserRole();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/user-management/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          codUtilizator: formData.codUtilizator,
          denumireUtilizator: formData.denumireUtilizator,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          codFunctie: formData.codFunctie,
          codServ: formData.codServ,
          numarMatricol: formData.numarMatricol,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(
          data.message || "Cont creat cu succes! Redirecționare către login..."
        );

        // Redirect către login după 2 secunde
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(data.error || "Eroare la crearea contului");
      }
    } catch (error) {
      console.error("Eroare la înregistrare:", error);
      setError("Eroare de conexiune. Încearcă din nou.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (error) setError("");
    if (success) setSuccess("");
  };

  if (loadingNomenclators) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Se încarcă...</p>
        </div>
      </div>
    );
  }

  if (loadingRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Se verifică rolul utilizatorului...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-300 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
      </div>

      {/* Mock Data Banner */}
      {/* {usingMockData && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-lg w-full px-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 shadow-md flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-amber-800 font-medium">Date de test</p>
              <p className="text-xs text-amber-700 mt-1">
                Folosim date mock pentru dezvoltare. Pentru date reale,
                configurează Supabase.
              </p>
            </div>
          </div>
        </div>
      )} */}

      {/* Water Bubbles Component */}
      <LoginWaterBubbles />

      <div className="relative w-full max-w-2xl">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <LoginDynamicTitle />
          <p className="text-gray-600">Creează un cont nou</p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
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

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Grid pentru câmpuri */}
            <div className="space-y-5">
              {/* Cod Utilizator */}
              <div>
                <label
                  htmlFor="codUtilizator"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Cod utilizator <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="codUtilizator"
                    type="text"
                    required
                    value={formData.codUtilizator}
                    onChange={(e) =>
                      handleInputChange("codUtilizator", e.target.value)
                    }
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Ex: 12345678"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Nume complet */}
              <div>
                <label
                  htmlFor="denumireUtilizator"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nume complet <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="denumireUtilizator"
                    type="text"
                    required
                    value={formData.denumireUtilizator}
                    onChange={(e) =>
                      handleInputChange("denumireUtilizator", e.target.value)
                    }
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Prenume Nume"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="email@dtits.ro"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Funcție */}
              <div>
                <label
                  htmlFor="codFunctie"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Funcție <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                  <select
                    id="codFunctie"
                    required
                    value={formData.codFunctie}
                    onChange={(e) =>
                      handleInputChange("codFunctie", e.target.value)
                    }
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
                    disabled={isLoading}
                  >
                    <option value="">
                      {functii.length === 0
                        ? "Nu există funcții disponibile"
                        : "Selectează funcția"}
                    </option>
                    {functii.map((functie) => (
                      <option
                        key={functie.cod_functie}
                        value={functie.cod_functie}
                      >
                        {functie.denumire_functie}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Serviciu */}
              <div>
                <label
                  htmlFor="codServ"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Serviciu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                  <select
                    id="codServ"
                    required
                    value={formData.codServ}
                    onChange={(e) =>
                      handleInputChange("codServ", e.target.value)
                    }
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
                    disabled={isLoading}
                  >
                    <option value="">
                      {servicii.length === 0
                        ? "Nu există servicii disponibile"
                        : "Selectează serviciul"}
                    </option>
                    {servicii.map((serviciu) => (
                      <option key={serviciu.cod_serv} value={serviciu.cod_serv}>
                        {serviciu.denumire_serv}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Parolă */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Parola <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Min. 6 caractere"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirmare parolă */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Confirmă parola <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Repetă parola"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center group mt-6"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Creează cont
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Link către login */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Ai deja un cont?{" "}
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Autentifică-te
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
