"use client";

import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullscreen?: boolean;
}

export default function LoadingSpinner({
  size = "md",
  text = "Se încarcă...",
  fullscreen = true,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  if (!fullscreen) {
    return (
      <div className="flex items-center justify-center space-x-2">
        <Loader2
          className={`${sizeClasses[size]} animate-spin text-blue-600`}
        />
        {text && (
          <span
            className={`${textSizeClasses[size]} text-gray-600 font-medium`}
          >
            {text}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        {/* Logo */}
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl mb-6 animate-pulse">
          <span className="text-white font-bold text-2xl">R</span>
        </div>

        {/* Loading Animation */}
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>

        {/* Loading Text */}
        <p className="text-lg font-medium text-gray-700 mb-2">{text}</p>
        <p className="text-sm text-gray-500">Vă rugăm să așteptați...</p>

        {/* Progress Bar */}
        <div className="mt-6 w-64 mx-auto bg-gray-200 rounded-full h-2">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
