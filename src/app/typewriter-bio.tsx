"use client";

import { useEffect, useMemo, useState } from "react";

type TypewriterBioProps = {
  lines: string[];
  fallbackBio?: string;
  speed?: number;
  deleteSpeed?: number;
  pauseTime?: number;
};

export function TypewriterBio({
  lines,
  fallbackBio,
  speed = 70,
  deleteSpeed = 35,
  pauseTime = 1800,
}: TypewriterBioProps) {
  const activeLines = useMemo(() => {
    const valid = Array.isArray(lines)
      ? lines
          .map((line) => (typeof line === "string" ? line.trim() : ""))
          .filter((line) => line.length > 0)
      : [];

    if (valid.length > 0) return valid;
    if (fallbackBio && fallbackBio.trim().length > 0) return [fallbackBio.trim()];
    return ["Welcome to my profile.", "Moon Knight aesthetic."];
  }, [lines, fallbackBio]);

  const [lineIndex, setLineIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const safeIndex = lineIndex % activeLines.length;
    const currentLine = activeLines[safeIndex] || "";

    if (!isDeleting) {
      if (displayText.length < currentLine.length) {
        timer = setTimeout(() => {
          setDisplayText(currentLine.slice(0, displayText.length + 1));
        }, speed);
      } else {
        // Line fully typed, pause before deleting if multiple lines
        if (activeLines.length > 1) {
          timer = setTimeout(() => {
            setIsDeleting(true);
          }, pauseTime);
        }
      }
    } else {
      if (displayText.length > 0) {
        timer = setTimeout(() => {
          setDisplayText(currentLine.slice(0, displayText.length - 1));
        }, deleteSpeed);
      } else {
        // Finished deleting, move to next line
        setIsDeleting(false);
        setLineIndex((prev) => (prev + 1) % activeLines.length);
      }
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, lineIndex, activeLines, speed, deleteSpeed, pauseTime]);

  return (
    <div className="guns-typewriter-container" aria-label={activeLines.join(". ")}>
      <span className="guns-typewriter-text">{displayText}</span>
      <span className="guns-typewriter-cursor" aria-hidden="true" />
    </div>
  );
}
