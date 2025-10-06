"use client";
import React, { useState } from "react";
import { useAuth } from "../app/contexts/AuthContext";

interface PasswordChangeProps {
  onPasswordChanged?: () => void;
}

const PasswordChange: React.FC<PasswordChangeProps> = ({
  onPasswordChanged,
}) => {
  const { user } = useAuth();
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordMessage, setPasswordMessage] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) return;

    // Validări
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage("Parolele nu coincid");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage("Parola nouă trebuie să aibă cel puțin 6 caractere");
      return;
    }

    try {
      setIsChangingPassword(true);
      const response = await fetch("/api/user-management/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPasswordMessage("Parola a fost schimbată cu succes!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setTimeout(() => setPasswordMessage(""), 3000);
        onPasswordChanged?.();
      } else {
        setPasswordMessage("Eroare: " + data.error);
      }
    } catch (error) {
      console.error("Eroare la schimbarea parolei:", error);
      setPasswordMessage("Eroare de conexiune");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-md mx-auto">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6 text-center">
          Schimbare Parolă
        </h2>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Parola Curentă
            </label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  currentPassword: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Parola Nouă
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirmă Parola Nouă
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  confirmPassword: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isChangingPassword}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            {isChangingPassword ? "Se schimbă..." : "Schimbă Parola"}
          </button>

          {passwordMessage && (
            <div
              className={`mt-4 p-3 rounded-md text-sm ${
                passwordMessage.includes("succes")
                  ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400"
                  : "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400"
              }`}
            >
              {passwordMessage}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default PasswordChange;
