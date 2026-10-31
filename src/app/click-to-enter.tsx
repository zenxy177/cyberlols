"use client";

import { useCallback, useEffect, useState } from "react";
import { Volume2 } from "lucide-react";

type ClickToEnterProps = {
  text?: string;
  onEnter: () => void;
};

export function ClickToEnter({
  text = "click to enter",
  onEnter,
}: ClickToEnterProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  const handleTrigger = useCallback(() => {
    if (isFading || !isVisible) return;
    setIsFading(true);

    // Synchronously dispatch event in current user gesture stack to unlock strict browser autoplay
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("guns:play-audio"));
    }

    onEnter();
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [isFading, isVisible, onEnter]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Enter" || event.key === " " || event.key === "Escape") {
        event.preventDefault();
        handleTrigger();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleTrigger]);

  if (!isVisible) return null;

  return (
    <div
      className={`click-to-enter-overlay${isFading ? " click-to-enter-fading" : ""}`}
      onClick={handleTrigger}
      role="button"
      tabIndex={0}
      aria-label={`${text}. Giriş yapmak için tıklayın`}
    >
      <div className="click-to-enter-content">
        <div className="click-to-enter-icon-wrapper">
          <Volume2 className="click-to-enter-icon" size={26} strokeWidth={1.7} />
        </div>
        <p className="click-to-enter-text">{text}</p>
        <span className="click-to-enter-subtext">[ click anywhere to continue ]</span>
      </div>
    </div>
  );
}
