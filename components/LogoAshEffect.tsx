"use client";
import { useEffect, useRef, type RefObject } from "react";

// Ash + smoke atmosphere behind the About-page logo.
// Ash flows outward from the logo's lower/side edges, some rising, some falling.
// Soft charcoal smoke wisps curl slowly around it. Ember only ever appears as a
// rare, tiny spark — never a dominant color. Reacts gently to cursor proximity
// and bursts briefly on click before settling back to its ambient state.
//
// `containerRef` must point at the shared parent that also holds the logo
// image, so hovering/clicking directly on the logo itself is still detected
// (this canvas layer sits behind the logo, so it can't catch those events on
// its own — the parent can, via bubbling).
export default function LogoAshEffect({ containerRef }: { containerRef: RefObject<HTMLDivElement | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const mouse = useRef({ x: -9999, y: -9999, active: false });

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, cx = 0, cy = 0, baseR = 120;

    const resize = () => {
      w = container.clientWidth;
      h = container.clientHeight;
      cx = w / 2;
      cy = h / 2;
      baseR = Math.max(70, Math.min(170, Math.min(w, h) * 0.42));
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    // Bias spawn angle toward the lower half and sides, rarely the top —
    // "ash flows out of the logo's lower/side edges".
    const biasedAngle = () => {
      const r = Math.random();
      if (r < 0.55) return (20 + Math.random() * 140) * (Math.PI / 180);
      if (r < 0.85)
        return Math.random() < 0.5
          ? (-40 + Math.random() * 60) * (Math.PI / 180)
          : (200 + Math.random() * 60) * (Math.PI / 180);
      return Math.random() * Math.PI * 2;
    };

    type Ash = {
      x: number; y: number; vx: number; vy: number;
      r: number; phase: number; rising: boolean;
      life: number; maxLife: number; spark: boolean;
    };

    const resetAsh = (p: Ash, burstFrom?: { x: number; y: number }) => {
      const angle = burstFrom ? Math.random() * Math.PI * 2 : biasedAngle();
      if (burstFrom) {
        p.x = burstFrom.x;
        p.y = burstFrom.y;
        const speed = 0.35 + Math.random() * 0.5;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
        p.maxLife = 0.7 + Math.random() * 0.6;
      } else {
        const dist = baseR * (0.85 + Math.random() * 0.35);
        p.x = cx + Math.cos(angle) * dist;
        p.y = cy + Math.sin(angle) * dist * 0.85;
        const speed = 0.05 + Math.random() * 0.09;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
        p.maxLife = 6 + Math.random() * 6;
      }
      p.r = 0.9 + Math.random() * 1.9;
      p.phase = Math.random() * Math.PI * 2;
      p.rising = Math.random() < 0.55;
      p.life = 0;
      p.spark = Math.random() > 0.91;
    };

    const ashPool: Ash[] = Array.from({ length: 46 }, () => {
      const p: Ash = { x: cx, y: cy, vx: 0, vy: 0, r: 1, phase: 0, rising: true, life: 0, maxLife: 1, spark: false };
      resetAsh(p);
      p.life = Math.random() * p.maxLife; // desync the pool so they don't all reset together
      return p;
    });

    let burstAsh: Ash[] = [];

    type Smoke = { bx: number; by: number; r: number; phase: number; fx: number; fy: number; ax: number; ay: number };
    const smokeCount = 6;
    const smoke: Smoke[] = Array.from({ length: smokeCount }, (_, i) => ({
      bx: cx + (Math.random() - 0.5) * baseR * 1.2,
      by: cy + (Math.random() - 0.3) * baseR * 1.1,
      r: 75 + Math.random() * 85,
      phase: (i / smokeCount) * Math.PI * 2,
      fx: 0.05 + Math.random() * 0.06,
      fy: 0.04 + Math.random() * 0.05,
      ax: 16 + Math.random() * 18,
      ay: 12 + Math.random() * 16,
    }));

    let time = 0;
    let lastT = performance.now();

    const handleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const cxp = e.clientX - rect.left;
      const cyp = e.clientY - rect.top;
      const sparkCount = 2 + Math.floor(Math.random() * 4); // 2–5
      const total = 14 + Math.floor(Math.random() * 6);
      const fresh: Ash[] = Array.from({ length: total }, (_, i) => {
        const p: Ash = { x: cxp, y: cyp, vx: 0, vy: 0, r: 1, phase: 0, rising: true, life: 0, maxLife: 1, spark: i < sparkCount };
        resetAsh(p, { x: cxp, y: cyp });
        p.spark = i < sparkCount;
        return p;
      });
      burstAsh = burstAsh.concat(fresh).slice(-60);
    };

    const handleMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.current.x = e.clientX - rect.left;
      mouse.current.y = e.clientY - rect.top;
      mouse.current.active = true;
    };
    const handleLeave = () => { mouse.current.active = false; };

    container.addEventListener("mousemove", handleMove);
    container.addEventListener("mouseleave", handleLeave);
    container.addEventListener("click", handleClick);

    const drawAsh = (p: Ash, dt: number, ambient: boolean) => {
      p.life += dt;
      const finished = p.life > p.maxLife;
      if (ambient && finished) { resetAsh(p); return true; }
      if (!ambient && finished) return false;

      // Gentle organic curl, plus a slow bias into a rise or a fall over the particle's life.
      const sway = Math.sin(time * 0.6 + p.phase) * (ambient ? 0.012 : 0.02);
      p.vx += sway * dt * 60;
      p.vy += (p.rising ? -0.0022 : 0.0016) * dt * 60;

      // Cursor proximity: nearby ash gently breaks away from the pointer.
      if (mouse.current.active) {
        const dx = p.x - mouse.current.x, dy = p.y - mouse.current.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 85 * 85) {
          const d = Math.sqrt(d2) || 1;
          p.vx += (dx / d) * 0.05;
          p.vy += (dy / d) * 0.05;
        }
      }

      // Light damping so velocity doesn't run away.
      p.vx *= 0.985;
      p.vy *= 0.985;
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;

      const progress = p.life / p.maxLife;
      const easeInOut = Math.sin(progress * Math.PI); // fades in, holds, fades out — no hard cuts
      const baseAlpha = ambient ? 0.32 : 0.5;
      const isHotSpark = p.spark && (ambient ? progress > 0.35 && progress < 0.55 : true);
      const rgb = isHotSpark ? "217,74,30" : Math.random() < 0.5 ? "196,199,200" : "142,147,149";
      const alpha = easeInOut * baseAlpha * (isHotSpark ? 1.6 : 1);

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * (isHotSpark ? 1.3 : 1), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb},${alpha})`;
      if (isHotSpark) {
        ctx.shadowColor = "rgba(255,113,56,0.8)";
        ctx.shadowBlur = p.r * 4;
      }
      ctx.fill();
      ctx.shadowBlur = 0;
      return true;
    };

    const draw = () => {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;
      time += dt;

      ctx.clearRect(0, 0, w, h);

      const distToCenter = Math.hypot(mouse.current.x - cx, mouse.current.y - cy);
      const proximity = mouse.current.active ? Math.max(0, 1 - distToCenter / 220) : 0;

      // Smoke — soft, slow, curling wisps behind the logo.
      for (const s of smoke) {
        const x = s.bx + Math.sin(time * s.fx + s.phase) * s.ax - (mouse.current.active ? (s.bx - mouse.current.x) * 0.015 * proximity : 0);
        const y = s.by + Math.cos(time * s.fy + s.phase * 1.3) * s.ay - (mouse.current.active ? (s.by - mouse.current.y) * 0.015 * proximity : 0);
        const op = 0.09 + (Math.sin(time * 0.12 + s.phase) * 0.5 + 0.5) * 0.08;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, s.r);
        grad.addColorStop(0, `rgba(90,94,96,${op})`);
        grad.addColorStop(0.55, `rgba(45,47,48,${op * 0.6})`);
        grad.addColorStop(1, "rgba(8,8,8,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Ambient ash pool (speeds up very slightly the closer the cursor gets).
      const speedMul = 1 + proximity * 0.7;
      for (const p of ashPool) {
        const savedVx = p.vx, savedVy = p.vy;
        p.vx *= speedMul; p.vy *= speedMul;
        drawAsh(p, dt, true);
        if (!(p.life > p.maxLife)) { p.vx = savedVx; p.vy = savedVy; }
      }

      // Click-burst ash (transient, settles quickly).
      burstAsh = burstAsh.filter((p) => drawAsh(p, dt, false));

      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
      container.removeEventListener("mousemove", handleMove);
      container.removeEventListener("mouseleave", handleLeave);
      container.removeEventListener("click", handleClick);
    };
  }, [containerRef]);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
}
