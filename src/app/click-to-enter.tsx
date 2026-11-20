"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    overlayRef.current?.focus();
  }, []);

  const handleTrigger = useCallback(() => {
    if (isFading || !isVisible) return;
    setIsFading(true);

    // Synchronously dispatch event in current user gesture stack to unlock strict browser autoplay
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("guns:play-audio"));
    }

    onEnter();
    setTimeout(() => {
      setIsVisible(false);
    }, 600);
  }, [isFading, isVisible, onEnter]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Escape girişi tetiklememeli; yalnızca Enter/Space ile ilerlenir.
      if (event.key === "Enter" || event.key === " ") {
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
      ref={overlayRef}
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
        <span className="click-to-enter-subtext">SİNYALİ AÇMAK İÇİN TIKLA</span>
      </div>
    </div>
  );
}
