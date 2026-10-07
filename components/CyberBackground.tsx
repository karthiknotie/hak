"use client";
import { useEffect, useRef } from "react";

// Ambient site-wide backdrop: ash is the dominant motion, embers are rare sparks.
export default function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio, 2);
    let w = 0;
    let h = 0;

    const resize = () => {
      w = window.innerWidth;
      h = document.documentElement.scrollHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    type Ember = { x: number; y: number; r: number; speed: number; drift: number; phase: number; spark: boolean };
    type Ash = { x: number; y: number; r: number; speed: number; drift: number; phase: number; bright: boolean };

    // Ash is the dominant particle — embers are a rare, occasional spark
    const ashCount = Math.max(22, Math.floor((w * h) / 65000));
    const emberCount = Math.max(5, Math.floor((w * h) / 260000));

    const ashFlakes: Ash[] = Array.from({ length: ashCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.6 + Math.random() * 1.4,
      speed: 0.04 + Math.random() * 0.08,
      drift: (Math.random() - 0.5) * 0.18,
      phase: Math.random() * Math.PI * 2,
      bright: Math.random() > 0.75,
    }));

    const embers: Ember[] = Array.from({ length: emberCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.7 + Math.random() * 1.3,
      speed: 0.1 + Math.random() * 0.18,
      drift: (Math.random() - 0.5) * 0.2,
      phase: Math.random() * Math.PI * 2,
      spark: Math.random() > 0.82, // only a rare few embers ever flash hot-yellow
    }));

    let time = 0;

    const draw = () => {
      time += 0.016;
      ctx.clearRect(0, 0, w, h);

      // Ash — the dominant drift: slow, heavy, near-neutral grey
      for (const a of ashFlakes) {
        a.y += a.speed;
        a.x += a.drift + Math.sin(time * 0.35 + a.phase) * 0.14;
        if (a.y > h + 4) { a.y = -4; a.x = Math.random() * w; }
        if (a.x < -4) a.x = w + 4;
        if (a.x > w + 4) a.x = -4;

        const flicker = 0.55 + Math.sin(time * 0.5 + a.phase) * 0.25;
        const rgb = a.bright ? "196,199,200" : "142,147,149";
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},${0.16 * flicker})`;
        ctx.fill();
      }

      // Embers — rare, small, slow rise, quickly fading
      for (const e of embers) {
        e.y -= e.speed;
        e.x += e.drift + Math.sin(time * 0.45 + e.phase) * 0.12;
        if (e.y < -6) { e.y = h + 6; e.x = Math.random() * w; }
        if (e.x < -6) e.x = w + 6;
        if (e.x > w + 6) e.x = -6;

        const flicker = 0.45 + Math.sin(time * 1.4 + e.phase) * 0.55;
        const alpha = 0.065 * (0.35 + flicker * 0.65);

        // At its single brightest instant, a rare ember flashes hot-yellow instead of orange
        const isPeakSpark = e.spark && flicker > 0.93;
        const rgb = isPeakSpark ? "255,201,74" : "217,74,30";
        const glowRgb = isPeakSpark ? "255,201,74" : "255,113,56";

        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},${alpha})`;
        ctx.shadowColor = `rgba(${glowRgb},${alpha * 1.3})`;
        ctx.shadowBlur = e.r * 4;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(document.body);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <>
      {/* Canvas: drifting ash (dominant) + rare ember sparks */}
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 pointer-events-none"
        style={{ zIndex: 1, opacity: 0.8 }}
      />

      {/* Soft smoke wash */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background: "radial-gradient(ellipse 60% 50% at 20% 15%, rgba(142,147,149,0.04) 0%, transparent 60%), radial-gradient(ellipse 55% 45% at 85% 80%, rgba(142,147,149,0.03) 0%, transparent 60%)",
        }}
      />

      {/* Very restrained ash vortex — a nod to the logo's swirl, never literal */}
      <div
        className="fixed pointer-events-none"
        style={{
          zIndex: 1,
          top: "50%",
          left: "50%",
          width: "140vmax",
          height: "140vmax",
          marginLeft: "-70vmax",
          marginTop: "-70vmax",
          background: "conic-gradient(from 0deg, transparent 0deg, rgba(142,147,149,0.018) 40deg, transparent 90deg, transparent 200deg, rgba(217,74,30,0.012) 250deg, transparent 300deg, transparent 360deg)",
          animation: "cyberAshVortex 140s linear infinite",
        }}
      />

      {/* Vignette — cinematic darkness at the edges */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 2,
          background: "radial-gradient(ellipse 70% 70% at 50% 50%, transparent 40%, rgba(0,0,0,0.5) 100%)",
        }}
      />

      {/* Slow breathing at the frame edges */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 2,
          animation: "cyberEdgeGlow 7s ease-in-out infinite",
        }}
      />

      <style>{`
        @keyframes cyberAshVortex {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
