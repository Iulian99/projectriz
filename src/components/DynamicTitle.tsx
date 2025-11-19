// checked
"use client";

import { useState, useEffect, useMemo } from "react";

const LoginDynamicTitle = () => {
  const words = useMemo(
    () => [
      { text: "Raport Individual Zilnic", color: "text-blue-600" },
      { text: "Analiza Rapoartelor", color: "text-purple-600" },
      { text: "Progres și Performanță", color: "text-green-600" },
      { text: "Date în Timp Real", color: "text-orange-600" },
    ],
    []
  );
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    }, 2500);

    return () => clearInterval(timer);
  }, [words.length]);

  const currentWord = words[currentWordIndex];

  return (
    <h1 className="text-3xl font-bold mb-2 h-20 flex items-center justify-center">
      <span
        className={`${currentWord.color} transition-all duration-500 ease-out inline-flex items-center`}
      >
        <span className="mr-1">{currentWord.text}</span>
        <span
          className="h-6 w-0.5 bg-current animate-pulse"
          aria-hidden="true"
        ></span>
      </span>
    </h1>
  );
};

export default LoginDynamicTitle;
