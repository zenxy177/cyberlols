"use client";

import { useEffect, useRef } from "react";

type LunarEffectsProps = {
  enabled?: boolean;
};

type Star = {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  pulseSpeed: number;
  pulsePhase: number;
};

export function LunarEffects({ enabled = true }: LunarEffectsProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    function handleResize() {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    window.addEventListener("resize", handleResize);

    // Generate ~35 ethereal celestial stardust particles
    const count = Math.min(45, Math.floor((width * height) / 25000));
    const stars: Star[] = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.8 + 0.6,
      speedY: -(Math.random() * 0.35 + 0.15),
      speedX: (Math.random() - 0.5) * 0.2,
      opacity: Math.random() * 0.7 + 0.2,
      pulseSpeed: Math.random() * 0.02 + 0.01,
      pulsePhase: Math.random() * Math.PI * 2,
    }));

    function render() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];

        // Animate position
        s.y += s.speedY;
        s.x += s.speedX;
        s.pulsePhase += s.pulseSpeed;

        // Wrap around screen
        if (s.y < -10) {
          s.y = height + 10;
          s.x = Math.random() * width;
        }
        if (s.x < -10) s.x = width + 10;
        if (s.x > width + 10) s.x = -10;

        // Compute glistening moonlight brightness
        const currentOpacity = Math.max(
          0.1,
          s.opacity + Math.sin(s.pulsePhase) * 0.3,
        );

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(224, 242, 254, ${currentOpacity.toFixed(3)})`;
        ctx.shadowBlur = s.size * 4;
        ctx.shadowColor = "rgba(186, 230, 253, 0.8)";
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    }

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="guns-lunar-canvas"
      aria-hidden="true"
    />
  );
}
