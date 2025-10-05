"use client";

import React from "react";

const LoginWaterBubbles: React.FC = () => {
  return (
    <>
      {/* Large Aquarium Water Bubbles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Extra Large bubbles */}
        <div className="absolute bottom-0 left-1/5 w-24 h-24 bg-blue-200 rounded-full opacity-30 animate-aquarium-bubble-1"></div>
        <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-cyan-200 rounded-full opacity-25 animate-aquarium-bubble-2"></div>
        <div className="absolute bottom-0 left-1/3 w-28 h-28 bg-indigo-200 rounded-full opacity-35 animate-aquarium-bubble-3"></div>
        <div className="absolute bottom-0 right-1/5 w-20 h-20 bg-purple-200 rounded-full opacity-40 animate-aquarium-bubble-4"></div>
        <div className="absolute bottom-0 left-1/6 w-36 h-36 bg-teal-200 rounded-full opacity-20 animate-aquarium-bubble-5"></div>

        {/* Large bubbles */}
        <div className="absolute bottom-0 left-1/2 w-16 h-16 bg-sky-300 rounded-full opacity-45 animate-aquarium-bubble-6"></div>
        <div className="absolute bottom-0 right-1/6 w-16 h-16 bg-blue-300 rounded-full opacity-40 animate-aquarium-bubble-1"></div>
        <div className="absolute bottom-0 left-3/4 w-20 h-20 bg-violet-200 rounded-full opacity-30 animate-aquarium-bubble-2"></div>
        <div className="absolute bottom-0 right-1/2 w-20 h-20 bg-cyan-300 rounded-full opacity-35 animate-aquarium-bubble-3"></div>

        {/* Medium bubbles */}
        <div className="absolute bottom-0 right-3/4 w-14 h-14 bg-emerald-300 rounded-full opacity-50 animate-aquarium-bubble-4"></div>
        <div className="absolute bottom-0 left-2/3 w-12 h-12 bg-blue-400 rounded-full opacity-45 animate-aquarium-bubble-5"></div>
        <div className="absolute bottom-0 right-2/3 w-16 h-16 bg-indigo-300 rounded-full opacity-40 animate-aquarium-bubble-6"></div>
        <div className="absolute bottom-0 left-5/6 w-16 h-16 bg-purple-300 rounded-full opacity-35 animate-aquarium-bubble-1"></div>

        {/* Additional bubbles for continuous effect */}
        <div className="absolute bottom-0 left-1/8 w-16 h-16 bg-cyan-100 rounded-full opacity-30 animate-aquarium-bubble-2"></div>
        <div className="absolute bottom-0 right-1/8 w-20 h-20 bg-blue-100 rounded-full opacity-25 animate-aquarium-bubble-4"></div>
        <div className="absolute bottom-0 left-7/8 w-14 h-14 bg-teal-300 rounded-full opacity-40 animate-aquarium-bubble-6"></div>
        <div className="absolute bottom-0 right-7/8 w-10 h-10 bg-indigo-400 rounded-full opacity-45 animate-aquarium-bubble-3"></div>
      </div>

      <style jsx>{`
        @keyframes aquarium-bubble-1 {
          0% {
            transform: translateY(0) translateX(0) scale(0.5);
            opacity: 0;
          }
          5% {
            opacity: 0.3;
            transform: translateY(-5vh) translateX(5px) scale(0.7);
          }
          15% {
            transform: translateY(-15vh) translateX(-10px) scale(1);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-30vh) translateX(15px) scale(1.1);
            opacity: 0.35;
          }
          50% {
            transform: translateY(-50vh) translateX(-8px) scale(0.9);
            opacity: 0.3;
          }
          70% {
            transform: translateY(-70vh) translateX(12px) scale(1.2);
            opacity: 0.25;
          }
          85% {
            transform: translateY(-85vh) translateX(-5px) scale(0.8);
            opacity: 0.2;
          }
          95% {
            transform: translateY(-95vh) translateX(8px) scale(0.6);
            opacity: 0.1;
          }
          100% {
            transform: translateY(-105vh) translateX(-3px) scale(0.3);
            opacity: 0;
          }
        }

        @keyframes aquarium-bubble-2 {
          0% {
            transform: translateY(0) translateX(0) scale(0.4);
            opacity: 0;
          }
          8% {
            opacity: 0.25;
            transform: translateY(-8vh) translateX(-15px) scale(0.8);
          }
          20% {
            transform: translateY(-20vh) translateX(20px) scale(1.2);
            opacity: 0.3;
          }
          40% {
            transform: translateY(-40vh) translateX(-12px) scale(0.7);
            opacity: 0.35;
          }
          60% {
            transform: translateY(-60vh) translateX(25px) scale(1.4);
            opacity: 0.2;
          }
          80% {
            transform: translateY(-80vh) translateX(-18px) scale(0.9);
            opacity: 0.15;
          }
          100% {
            transform: translateY(-105vh) translateX(10px) scale(0.2);
            opacity: 0;
          }
        }

        @keyframes aquarium-bubble-3 {
          0% {
            transform: translateY(0) translateX(0) scale(0.6);
            opacity: 0;
          }
          10% {
            opacity: 0.35;
            transform: translateY(-10vh) translateX(12px) scale(0.9);
          }
          25% {
            transform: translateY(-25vh) translateX(-20px) scale(1.3);
            opacity: 0.4;
          }
          45% {
            transform: translateY(-45vh) translateX(30px) scale(0.8);
            opacity: 0.3;
          }
          65% {
            transform: translateY(-65vh) translateX(-15px) scale(1.1);
            opacity: 0.25;
          }
          85% {
            transform: translateY(-85vh) translateX(22px) scale(0.7);
            opacity: 0.2;
          }
          100% {
            transform: translateY(-105vh) translateX(-8px) scale(0.4);
            opacity: 0;
          }
        }

        @keyframes aquarium-bubble-4 {
          0% {
            transform: translateY(0) translateX(0) scale(0.7);
            opacity: 0;
          }
          12% {
            opacity: 0.4;
            transform: translateY(-12vh) translateX(-8px) scale(1);
          }
          28% {
            transform: translateY(-28vh) translateX(18px) scale(0.6);
            opacity: 0.45;
          }
          48% {
            transform: translateY(-48vh) translateX(-25px) scale(1.5);
            opacity: 0.35;
          }
          68% {
            transform: translateY(-68vh) translateX(28px) scale(0.8);
            opacity: 0.2;
          }
          88% {
            transform: translateY(-88vh) translateX(-12px) scale(1.2);
            opacity: 0.15;
          }
          100% {
            transform: translateY(-105vh) translateX(15px) scale(0.3);
            opacity: 0;
          }
        }

        @keyframes aquarium-bubble-5 {
          0% {
            transform: translateY(0) translateX(0) scale(0.3);
            opacity: 0;
          }
          6% {
            opacity: 0.2;
            transform: translateY(-6vh) translateX(20px) scale(0.5);
          }
          18% {
            transform: translateY(-18vh) translateX(-30px) scale(1.6);
            opacity: 0.25;
          }
          35% {
            transform: translateY(-35vh) translateX(35px) scale(0.9);
            opacity: 0.3;
          }
          55% {
            transform: translateY(-55vh) translateX(-22px) scale(1.2);
            opacity: 0.15;
          }
          75% {
            transform: translateY(-75vh) translateX(28px) scale(0.7);
            opacity: 0.1;
          }
          100% {
            transform: translateY(-105vh) translateX(-15px) scale(0.1);
            opacity: 0;
          }
        }

        @keyframes aquarium-bubble-6 {
          0% {
            transform: translateY(0) translateX(0) scale(0.8);
            opacity: 0;
          }
          14% {
            opacity: 0.45;
            transform: translateY(-14vh) translateX(-6px) scale(1.1);
          }
          32% {
            transform: translateY(-32vh) translateX(24px) scale(0.7);
            opacity: 0.5;
          }
          52% {
            transform: translateY(-52vh) translateX(-20px) scale(1.4);
            opacity: 0.4;
          }
          72% {
            transform: translateY(-72vh) translateX(18px) scale(0.9);
            opacity: 0.3;
          }
          92% {
            transform: translateY(-92vh) translateX(-10px) scale(0.6);
            opacity: 0.2;
          }
          100% {
            transform: translateY(-105vh) translateX(5px) scale(0.2);
            opacity: 0;
          }
        }

        .animate-aquarium-bubble-1 {
          animation: aquarium-bubble-1 25s linear infinite;
        }

        .animate-aquarium-bubble-2 {
          animation: aquarium-bubble-2 30s linear infinite;
          animation-delay: 5s;
        }

        .animate-aquarium-bubble-3 {
          animation: aquarium-bubble-3 22s linear infinite;
          animation-delay: 10s;
        }

        .animate-aquarium-bubble-4 {
          animation: aquarium-bubble-4 28s linear infinite;
          animation-delay: 15s;
        }

        .animate-aquarium-bubble-5 {
          animation: aquarium-bubble-5 35s linear infinite;
          animation-delay: 20s;
        }

        .animate-aquarium-bubble-6 {
          animation: aquarium-bubble-6 26s linear infinite;
          animation-delay: 8s;
        }
      `}</style>
    </>
  );
};

export default LoginWaterBubbles;
