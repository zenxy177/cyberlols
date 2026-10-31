"use client";

import { useEffect, useRef, useState } from "react";
import type { CursorStyle, CursorTrail } from "@/lib/profile";

type CustomCursorProps = {
  enabled?: boolean;
  cursorStyle?: CursorStyle;
  cursorTrail?: CursorTrail;
  enableClickRipple?: boolean;
};

type StardustParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
  color: string;
};

type ClickRipple = {
  id: number;
  x: number;
  y: number;
};

export function CustomCursor({
  enabled = true,
  cursorStyle = "neon_dot",
  cursorTrail = "stardust",
  enableClickRipple = true,
}: CustomCursorProps) {
  const [visible, setVisible] = useState(false);
  const [isPointer, setIsPointer] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [ripples, setRipples] = useState<ClickRipple[]>([]);

  const cursorRef = useRef<HTMLDivElement | null>(null);
  const followerRef = useRef<HTMLDivElement | null>(null);
  const ghostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const mousePos = useRef({ x: -100, y: -100 });
  const followerPos = useRef({ x: -100, y: -100 });
  const ghostPos = useRef({ x: -100, y: -100 });
  const isPointerRef = useRef(false);
  const isClickingRef = useRef(false);
  const isVisibleRef = useRef(false);
  const rippleIdCounter = useRef(0);

  // Stardust particle system
  const particles = useRef<StardustParticle[]>([]);
  const lastSpawnTime = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined" || window.matchMedia("(pointer: coarse)").matches) return;

    let animationFrameId: number;
    const canvas = canvasRef.current;
    let ctx: CanvasRenderingContext2D | null = null;

    if (canvas && cursorTrail === "stardust") {
      ctx = canvas.getContext("2d");
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function handleResize() {
      if (canvas && cursorTrail === "stardust") {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    }

    function spawnStardust(x: number, y: number) {
      if (cursorTrail !== "stardust") return;
      const now = performance.now();
      if (now - lastSpawnTime.current < 28) return; // limit spawn rate
      lastSpawnTime.current = now;

      // Keep max 45 particles in pool
      if (particles.current.length > 45) {
        particles.current.shift();
      }

      const colors = ["#f8fafc", "#e0f2fe", "#bae6fd", "#7dd3fc", "#e2e8f0"];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      particles.current.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 8,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8 - 0.3,
        size: Math.random() * 2.8 + 1.2,
        opacity: Math.random() * 0.4 + 0.6,
        life: 0,
        maxLife: Math.floor(Math.random() * 24 + 20),
        color: randomColor,
      });
    }

    function handleMouseMove(e: globalThis.MouseEvent) {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;

      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        followerPos.current.x = e.clientX;
        followerPos.current.y = e.clientY;
        ghostPos.current.x = e.clientX;
        ghostPos.current.y = e.clientY;
        setVisible(true);
      }

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }

      spawnStardust(e.clientX, e.clientY);

      const target = e.target as HTMLElement | null;
      const isInteractive = Boolean(
        target &&
          (target.closest("a") ||
            target.closest("button") ||
            target.closest("input") ||
            target.closest("textarea") ||
            target.closest("[role='button']") ||
            target.classList.contains("interactive")),
      );

      if (isInteractive !== isPointerRef.current) {
        isPointerRef.current = isInteractive;
        setIsPointer(isInteractive);
      }
    }

    function handleMouseDown(e: globalThis.MouseEvent) {
      isClickingRef.current = true;
      setIsClicking(true);

      if (enableClickRipple) {
        const id = ++rippleIdCounter.current;
        setRipples((prev) => [...prev.slice(-4), { id, x: e.clientX, y: e.clientY }]);
        setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== id));
        }, 650);
      }
    }

    function handleMouseUp() {
      isClickingRef.current = false;
      setIsClicking(false);
    }

    function handleMouseLeave() {
      isVisibleRef.current = false;
      setVisible(false);
    }

    function handleMouseEnter() {
      isVisibleRef.current = true;
      setVisible(true);
    }

    function renderLoop() {
      // Primary follower lag
      followerPos.current.x += (mousePos.current.x - followerPos.current.x) * 0.24;
      followerPos.current.y += (mousePos.current.y - followerPos.current.y) * 0.24;

      if (followerRef.current) {
        const scale = isClickingRef.current ? 0.75 : isPointerRef.current ? 1.3 : 1;
        followerRef.current.style.transform = `translate3d(${followerPos.current.x}px, ${followerPos.current.y}px, 0) scale(${scale})`;
      }

      // Ghost trail follower (slower lag)
      if (cursorTrail === "ghost" && ghostRef.current) {
        ghostPos.current.x += (mousePos.current.x - ghostPos.current.x) * 0.12;
        ghostPos.current.y += (mousePos.current.y - ghostPos.current.y) * 0.12;
        ghostRef.current.style.transform = `translate3d(${ghostPos.current.x}px, ${ghostPos.current.y}px, 0)`;
      }

      // Render Stardust Canvas
      if (ctx && canvas && cursorTrail === "stardust") {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = particles.current.length - 1; i >= 0; i--) {
          const p = particles.current[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life++;

          const progress = p.life / p.maxLife;
          const currentOpacity = Math.max(0, p.opacity * (1 - progress));

          if (progress >= 1 || currentOpacity <= 0.01) {
            particles.current.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (1 - progress * 0.4), 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = currentOpacity;
          ctx.shadowColor = "rgba(224, 242, 254, 0.8)";
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    }

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      cancelAnimationFrame(animationFrameId);
    };
  }, [enabled, cursorStyle, cursorTrail, enableClickRipple]);

  if (!enabled) return null;

  return (
    <>
      {/* 1. Stardust Canvas Trail */}
      {cursorTrail === "stardust" ? (
        <canvas
          ref={canvasRef}
          className="guns-cursor-stardust-canvas"
          aria-hidden="true"
        />
      ) : null}

      {/* 2. Click Shockwave Ripples */}
      {enableClickRipple && ripples.length > 0 ? (
        <div className="guns-click-ripples-container" aria-hidden="true">
          {ripples.map((r) => (
            <div
              key={r.id}
              className="guns-click-shockwave"
              style={{ left: `${r.x}px`, top: `${r.y}px` }}
            />
          ))}
        </div>
      ) : null}

      {/* 3. Ghost Trail Follower */}
      {cursorTrail === "ghost" ? (
        <div
          ref={ghostRef}
          className={`guns-cursor-ghost${visible ? " is-visible" : ""}`}
          aria-hidden="true"
        />
      ) : null}

      {/* 4. Active Custom Pointer & Follower */}
      {cursorStyle !== "default" ? (
        <div
          className={`guns-custom-cursor-container cursor-style-${cursorStyle}${
            visible ? " is-visible" : ""
          }${isPointer ? " is-hovering" : ""}${isClicking ? " is-clicking" : ""}`}
          aria-hidden="true"
        >
          {/* Main Pointer (Direct 1:1 mouse position) */}
          <div ref={cursorRef} className={`guns-cursor-pointer type-${cursorStyle}`}>
            {cursorStyle === "crosshair" ? (
              <div className="crosshair-elements">
                <span className="crosshair-dot" />
                <span className="crosshair-tick tick-top" />
                <span className="crosshair-tick tick-right" />
                <span className="crosshair-tick tick-bottom" />
                <span className="crosshair-tick tick-left" />
              </div>
            ) : cursorStyle === "lunar_crescent" ? (
              <div className="lunar-crescent-pointer">
                <svg
                  width={20}
                  height={20}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="lunar-crescent-svg"
                >
                  <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 12c0 5.385 4.365 9.75 9.75 9.75 4.14 0 7.697-2.585 9.002-6.748z" />
                </svg>
                <div className="lunar-crescent-glow" />
              </div>
            ) : (
              /* neon_dot default */
              <div className="guns-cursor-dot" />
            )}
          </div>

          {/* Smooth Spring Follower Ring */}
          <div ref={followerRef} className={`guns-cursor-follower type-${cursorStyle}`} />
        </div>
      ) : null}
    </>
  );
}
