"use client";

import { useState, useEffect, useMemo } from "react";

const LoginDynamicTitle = () => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  const words = useMemo(
    () => [
      { text: "Raport Individual Zilnic", color: "text-blue-600" },
      { text: "Analiza ta Personală", color: "text-purple-600" },
      { text: "Progres și Performanță", color: "text-green-600" },
      { text: "Date în Timp Real", color: "text-orange-600" },
    ],
    []
  );

  useEffect(() => {
    const currentWord = words[currentWordIndex].text;

    if (isTyping) {
      if (displayText.length < currentWord.length) {
        const timer = setTimeout(() => {
          setDisplayText(currentWord.slice(0, displayText.length + 1));
        }, 100);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
        return () => clearTimeout(timer);
      }
    } else {
      if (displayText.length > 0) {
        const timer = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 50);
        return () => clearTimeout(timer);
      } else {
        setCurrentWordIndex((prev) => (prev + 1) % words.length);
        setIsTyping(true);
      }
    }
  }, [displayText, isTyping, currentWordIndex, words]);

  return (
    <h1 className="text-3xl font-bold mb-2 h-20 flex items-center justify-center">
      <span
        className={`${words[currentWordIndex].color} transition-colors duration-500`}
      >
        {displayText}
        <span className="animate-pulse">|</span>
      </span>
    </h1>
  );
};

export default LoginDynamicTitle;
