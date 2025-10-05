"use client";
import React, { useState } from "react";

const RizLogo: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <style jsx global>{`
        /* Opțiunea 1: Glow simplu și elegant */
        @keyframes gentleGlow {
          0%,
          100% {
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
          }
          50% {
            box-shadow: 0 4px 25px rgba(59, 130, 246, 0.6);
          }
        }

        @keyframes sparkle {
          0%,
          100% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* Opțiunea 2: Undă de lumină care trece */
        @keyframes lightSweep {
          0% {
            left: -100%;
          }
          100% {
            left: 100%;
          }
        }

        /* Opțiunea 3: Pulsare subtilă */
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
      `}</style>

      <div
        className="relative inline-flex items-center cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* OPȚIUNEA 1: Glow simplu cu sparkles */}
        <div
          className="relative w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-xl flex items-center justify-center mr-3 transition-all duration-500"
          style={{
            animation: isHovered
              ? "gentleGlow 2s ease-in-out infinite"
              : "none",
            transform: isHovered ? "scale(1.05)" : "scale(1)",
          }}
        >
          {/* Sparkle effects - doar puncte mici care sclipesc */}
          {isHovered && (
            <>
              <div
                className="absolute top-2 left-2 w-1 h-1 bg-white rounded-full"
                style={{
                  animation: "sparkle 1.5s ease-in-out infinite",
                  animationDelay: "0.2s",
                }}
              />
              <div
                className="absolute top-3 right-2 w-0.5 h-0.5 bg-white rounded-full"
                style={{
                  animation: "sparkle 1.2s ease-in-out infinite",
                  animationDelay: "0.8s",
                }}
              />
              <div
                className="absolute bottom-2 left-3 w-1 h-1 bg-white rounded-full"
                style={{
                  animation: "sparkle 1.8s ease-in-out infinite",
                  animationDelay: "1.2s",
                }}
              />
            </>
          )}

          {/* RIZ Text */}
          <span
            className="relative z-10 text-white font-bold text-lg tracking-wider transition-all duration-300"
            style={{
              textShadow: "0 2px 4px rgba(0,0,0,0.4)",
              transform: isHovered ? "scale(1.05)" : "scale(1)",
              filter: isHovered
                ? "drop-shadow(0 0 3px rgba(255,255,255,0.5))"
                : "none",
            }}
          >
            RIZ
          </span>
        </div>

        {/* Text static */}
        <span className="text-xl font-semibold text-gray-900">
          Raport Individual Zilnic
        </span>
      </div>

      {/* COMENTEAZĂ LINIA DE DEASUPRA ȘI DECOMENTEAZĂ PENTRU ALTE OPȚIUNI: */}

      {/* 
      // OPȚIUNEA 2: Undă de lumină
      <div 
        className="relative inline-flex items-center cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div 
          className="relative w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-xl flex items-center justify-center mr-3 overflow-hidden transition-all duration-300"
          style={{
            transform: isHovered ? 'scale(1.05)' : 'scale(1)'
          }}
        >
          {isHovered && (
            <div 
              className="absolute top-0 w-2 h-full bg-white opacity-30 transform -skew-x-12"
              style={{
                animation: 'lightSweep 1.5s ease-in-out infinite'
              }}
            />
          )}
          
          <span 
            className="relative z-10 text-white font-bold text-lg tracking-wider transition-all duration-300"
            style={{
              textShadow: '0 2px 4px rgba(0,0,0,0.4)'
            }}
          >
            RIZ
          </span>
        </div>

        <span className="text-xl font-semibold text-gray-900">
          Raport Individual Zilnic
        </span>
      </div>
      */}

      {/* 
      // OPȚIUNEA 3: Pulsare simplă
      <div 
        className="relative inline-flex items-center cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div 
          className="relative w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-xl flex items-center justify-center mr-3 transition-all duration-300"
          style={{
            animation: isHovered ? 'pulse 1.5s ease-in-out infinite' : 'none',
            boxShadow: isHovered ? '0 0 20px rgba(59, 130, 246, 0.5)' : '0 4px 15px rgba(59, 130, 246, 0.2)'
          }}
        >
          <span 
            className="relative z-10 text-white font-bold text-lg tracking-wider"
            style={{
              textShadow: '0 2px 4px rgba(0,0,0,0.4)'
            }}
          >
            RIZ
          </span>
        </div>

        <span className="text-xl font-semibold text-gray-900">
          Raport Individual Zilnic
        </span>
      </div>
      */}

      {/* 
      // OPȚIUNEA 4: Fără efecte - doar simplu
      <div className="relative inline-flex items-center">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-xl flex items-center justify-center mr-3">
          <span 
            className="text-white font-bold text-lg tracking-wider"
            style={{
              textShadow: '0 2px 4px rgba(0,0,0,0.4)'
            }}
          >
            RIZ
          </span>
        </div>

        <span className="text-xl font-semibold text-gray-900">
          Raport Individual Zilnic
        </span>
      </div>
      */}
    </>
  );
};

export default RizLogo;
