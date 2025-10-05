"use client";
import React, { useState } from "react";

const RizLogo: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <style jsx global>{`
        @keyframes waterFlow {
          0%,
          100% {
            border-radius: 60% 40% 50% 70%;
            transform: rotate(0deg) scale(1);
          }
          25% {
            border-radius: 50% 70% 40% 60%;
            transform: rotate(1deg) scale(1.02);
          }
          50% {
            border-radius: 70% 50% 60% 40%;
            transform: rotate(0deg) scale(1);
          }
          75% {
            border-radius: 40% 60% 70% 50%;
            transform: rotate(-1deg) scale(1.02);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-3px);
          }
        }

        @keyframes wave {
          0% {
            transform: translateX(-100%) skewX(-12deg);
          }
          100% {
            transform: translateX(200%) skewX(-12deg);
          }
        }
      `}</style>

      <div
        className="relative inline-flex items-center cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Container principal */}
        <div
          className="relative w-12 h-12 mr-3"
          style={{
            animation: !isHovered ? "float 3s ease-in-out infinite" : "none",
          }}
        >
          {/* Pătratul principal - rămâne mereu vizibil */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-xl flex items-center justify-center overflow-hidden transition-all duration-500"
            style={{
              animation: !isHovered
                ? "waterFlow 4s ease-in-out infinite"
                : "waterFlow 4s ease-in-out infinite",
              boxShadow: !isHovered
                ? "0 6px 20px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
                : "0 8px 30px rgba(59, 130, 246, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
              transform: isHovered ? "scale(1.05)" : "scale(1)",
            }}
          >
            {/* Undele de apă în fundal */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 opacity-80">
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-25 transform -skew-x-12"
                style={{
                  animation: isHovered
                    ? "wave 1.5s infinite linear"
                    : "wave 2.5s infinite linear",
                }}
              />
            </div>

            {/* Textul RIZ - rămâne mereu vizibil */}
            <span
              className="relative z-10 text-white font-bold text-lg tracking-wider transition-all duration-300"
              style={{
                textShadow:
                  "0 2px 6px rgba(0,0,0,0.5), 0 0 12px rgba(255,255,255,0.2)",
                transform: isHovered ? "scale(1.1)" : "scale(1)",
                filter: isHovered
                  ? "drop-shadow(0 0 8px rgba(255,255,255,0.4))"
                  : "none",
              }}
            >
              RIZ
            </span>
          </div>
        </div>

        {/* Text responsive */}
        <span className="hidden sm:inline text-sm md:text-base lg:text-lg font-medium text-gray-800 whitespace-nowrap">
          Raport Individual Zilnic
        </span>
      </div>
    </>
  );
};

export default RizLogo;
