"use client";

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";

type ProfileCardProps = {
  enableTilt?: boolean;
  children: React.ReactNode;
  className?: string;
  style?: CSSProperties;
};

export function ProfileCard({
  enableTilt = true,
  children,
  className = "",
  style = {},
}: ProfileCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const glareRef = useRef<HTMLDivElement | null>(null);
  const rafId = useRef<number | null>(null);
  const [isTouchOrReducedMotion, setIsTouchOrReducedMotion] = useState(false);

  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setIsTouchOrReducedMotion(isTouch || isReduced);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (!enableTilt || isTouchOrReducedMotion || !cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (rafId.current) cancelAnimationFrame(rafId.current);

    rafId.current = requestAnimationFrame(() => {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Normalize between -1 and 1
      const percentX = (x - centerX) / centerX;
      const percentY = (y - centerY) / centerY;

      // Max 10 degrees tilt for subtle, elegant premium feel
      const maxTilt = 10;
      const rotateX = -percentY * maxTilt;
      const rotateY = percentX * maxTilt;

      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`;
      card.style.transition = "transform 0.1s ease-out";

      if (glareRef.current) {
        glareRef.current.style.opacity = "0.14";
        glareRef.current.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 70%)`;
      }
    });
  }

  function handleMouseLeave() {
    if (!enableTilt || isTouchOrReducedMotion || !cardRef.current) return;

    if (rafId.current) cancelAnimationFrame(rafId.current);

    const card = cardRef.current;
    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    card.style.transition = "transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)";

    if (glareRef.current) {
      glareRef.current.style.opacity = "0";
    }
  }

  const tiltActive = enableTilt && !isTouchOrReducedMotion;

  return (
    <div
      ref={cardRef}
      className={`guns-profile-card ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        ...style,
        transform: tiltActive
          ? "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)"
          : undefined,
        transition: tiltActive
          ? "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)"
          : undefined,
      }}
    >
      {/* Glare specular highlight overlay */}
      {tiltActive ? (
        <div
          ref={glareRef}
          className="guns-card-glare"
          style={{
            opacity: 0,
            background:
              "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 70%)",
          }}
          aria-hidden="true"
        />
      ) : null}

      <div className="guns-card-inner">{children}</div>
    </div>
  );
}
