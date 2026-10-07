"use client";
import { useEffect, useRef } from "react";

interface VortexParticle {
  angle: number; radius: number;
  angSpeed: number; fallRate: number;
  size: number; hue: number; opacity: number;
  tail: { x: number; y: number }[];
}

interface DustParticle {
  x: number; y: number; vx: number; vy: number;
  size: number; opacity: number; hue: number; life: number; maxLife: number;
}

interface PulseWave { radius: number; maxRadius: number; opacity: number; hue: number; }

export default function PortalBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement!;
    const W = parent.offsetWidth;
    const H = parent.offsetHeight;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width  = `${W}px`;
    canvas.style.height = `${H}px`;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(DPR, DPR);

    const cx = W / 2;
    const cy = H / 2;
    const MAX_R  = Math.min(W, H) * 0.43;
    const CORE_R = Math.min(W, H) * 0.058;

    // ── Pre-render nebula clouds on offscreen canvas ──
    const nebCanvas = document.createElement("canvas");
    nebCanvas.width = W; nebCanvas.height = H;
    const nCtx = nebCanvas.getContext("2d")!;
    const nebulas = [
      { x: cx - MAX_R * 0.35, y: cy - MAX_R * 0.2,  r: MAX_R * 0.55, hue: 265, a: 0.055 },
      { x: cx + MAX_R * 0.3,  y: cy + MAX_R * 0.25, r: MAX_R * 0.48, hue: 190, a: 0.045 },
      { x: cx - MAX_R * 0.15, y: cy + MAX_R * 0.3,  r: MAX_R * 0.42, hue: 230, a: 0.035 },
      { x: cx + MAX_R * 0.1,  y: cy - MAX_R * 0.32, r: MAX_R * 0.38, hue: 300, a: 0.030 },
    ];
    for (const n of nebulas) {
      const g = nCtx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
      g.addColorStop(0,   `hsla(${n.hue},80%,55%,${n.a})`);
      g.addColorStop(0.5, `hsla(${n.hue},80%,40%,${n.a * 0.5})`);
      g.addColorStop(1,   `hsla(${n.hue},80%,30%,0)`);
      nCtx.beginPath();
      nCtx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      nCtx.fillStyle = g;
      nCtx.fill();
    }

    // ── Pre-compute distorted spacetime grid ──
    const gridCanvas = document.createElement("canvas");
    gridCanvas.width = W; gridCanvas.height = H;
    const gCtx = gridCanvas.getContext("2d")!;
    const GRID_STEP = 45;
    const WARP_STR  = MAX_R * 1.1;

    function warpPoint(x: number, y: number): [number, number] {
      const dx = x - cx, dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
      const warp = Math.pow(Math.max(0, 1 - dist / (MAX_R * 1.15)), 2.2) * WARP_STR * 0.28;
      return [x - (dx / dist) * warp, y - (dy / dist) * warp];
    }

    gCtx.lineWidth = 0.45;
    // horizontal lines
    for (let y = 0; y <= H; y += GRID_STEP) {
      gCtx.beginPath();
      for (let x = 0; x <= W; x += 4) {
        const [wx, wy] = warpPoint(x, y);
        const dx = x - cx, dy = y - cy;
        const d = Math.sqrt(dx*dx + dy*dy);
        const a = Math.max(0, 0.07 * (1 - d / (MAX_R * 1.4)));
        gCtx.strokeStyle = `rgba(0,229,255,${a})`;
        if (x === 0) gCtx.moveTo(wx, wy); else gCtx.lineTo(wx, wy);
      }
      gCtx.stroke();
    }
    // vertical lines
    for (let x = 0; x <= W; x += GRID_STEP) {
      gCtx.beginPath();
      for (let y = 0; y <= H; y += 4) {
        const [wx, wy] = warpPoint(x, y);
        const dx = x - cx, dy = y - cy;
        const d = Math.sqrt(dx*dx + dy*dy);
        const a = Math.max(0, 0.07 * (1 - d / (MAX_R * 1.4)));
        gCtx.strokeStyle = `rgba(0,229,255,${a})`;
        if (y === 0) gCtx.moveTo(wx, wy); else gCtx.lineTo(wx, wy);
      }
      gCtx.stroke();
    }

    // ── Static background stars ──
    const bgStars = Array.from({ length: 200 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      size: Math.random() * 1.1 + 0.15,
      opacity: Math.random() * 0.5 + 0.1,
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.5 + Math.random() * 1.5,
    }));

    // ── Inner "other world" stars ──
    const innerStars = Array.from({ length: 60 }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: Math.random() * CORE_R * 0.82,
      size: Math.random() * 0.85 + 0.15,
      speed: (Math.random() > 0.5 ? 1 : -1) * (0.0008 + Math.random() * 0.002),
      opacity: Math.random() * 0.55 + 0.2,
    }));

    // ── Vortex particles ──
    function makeVortex(spread = false): VortexParticle {
      const t = spread ? Math.random() : 0.5 + Math.random() * 0.5;
      return {
        angle: Math.random() * Math.PI * 2,
        radius: CORE_R * 2 + t * (MAX_R - CORE_R * 2),
        angSpeed: 0.004 + Math.random() * 0.014,
        fallRate: 0.18 + Math.random() * 0.52,
        size: 0.45 + Math.random() * 2.1,
        hue: 270 - t * 88,
        opacity: 0.22 + t * 0.48 + Math.random() * 0.3,
        tail: [],
      };
    }
    const vortex: VortexParticle[] = Array.from({ length: 520 }, () => {
      const p = makeVortex(true);
      return p;
    });

    // ── Ambient dust particles ──
    function makeDust(): DustParticle {
      const angle = Math.random() * Math.PI * 2;
      const r = MAX_R * (0.5 + Math.random() * 0.7);
      return {
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.2 + 0.2,
        opacity: Math.random() * 0.25 + 0.05,
        hue: 220 + Math.random() * 80,
        life: 0,
        maxLife: 180 + Math.random() * 240,
      };
    }
    const dust: DustParticle[] = Array.from({ length: 120 }, makeDust);

    // ── Pulse waves ──
    const pulses: PulseWave[] = [];
    let pulseTimer = 0;
    const PULSE_INTERVAL = 90;

    // ── Wormhole tunnel rings ──
    const NUM_RINGS = 14;

    let time = 0;

    function frame() {
      rafRef.current = requestAnimationFrame(frame);
      time += 0.013;
      pulseTimer++;

      // Spawn pulse waves
      if (pulseTimer >= PULSE_INTERVAL) {
        pulseTimer = 0;
        pulses.push({
          radius: CORE_R * 1.2,
          maxRadius: MAX_R * 1.1,
          opacity: 0.6,
          hue: Math.random() > 0.5 ? 185 : 270,
        });
      }

      // Trail smear
      ctx.fillStyle = "rgba(0,0,0,0.11)";
      ctx.fillRect(0, 0, W, H);

      // ── Nebula ──
      ctx.globalAlpha = 0.9 + Math.sin(time * 0.4) * 0.1;
      ctx.drawImage(nebCanvas, 0, 0);
      ctx.globalAlpha = 1;

      // ── Distorted grid ──
      ctx.globalAlpha = 0.65 + Math.sin(time * 0.3) * 0.15;
      ctx.drawImage(gridCanvas, 0, 0);
      ctx.globalAlpha = 1;

      // ── Background stars ──
      for (const s of bgStars) {
        const d = Math.hypot(s.x - cx, s.y - cy);
        if (d > CORE_R) {
          const twinkle = 0.7 + 0.3 * Math.sin(time * s.twinkleSpeed + s.twinkle);
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${s.opacity * twinkle})`;
          ctx.fill();
        }
      }

      // ── Pulse waves ──
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.radius += (p.maxRadius - p.radius) * 0.022;
        p.opacity *= 0.972;
        if (p.opacity < 0.01) { pulses.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(cx, cy, p.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${p.hue},90%,65%,${p.opacity * 0.5})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // ── Wormhole tunnel rings ──
      for (let i = NUM_RINGS - 1; i >= 0; i--) {
        const t = i / (NUM_RINGS - 1);          // 0=center, 1=outer
        const baseR = CORE_R * 1.8 + (MAX_R * 0.42 - CORE_R * 1.8) * Math.pow(t, 0.65);
        const pulse = 1 + Math.sin(time * 1.2 + i * 0.45) * 0.03;
        const rr = baseR * pulse;
        const ry = rr * 0.32;                   // flattened ellipse for depth
        const hue = 185 + t * 85;
        const alpha = (1 - t) * 0.35 + 0.04;
        const rotation = time * (0.18 + i * 0.022);

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotation);
        ctx.beginPath();
        ctx.ellipse(0, 0, rr, ry, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${hue},90%,65%,${alpha})`;
        ctx.lineWidth = 0.8 + (1 - t) * 0.8;
        ctx.setLineDash([6 + i * 1.5, 10 + i * 2]);
        ctx.lineDashOffset = -time * (30 + i * 8);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }

      // ── Vortex particles ──
      for (const p of vortex) {
        const momentum = Math.pow(MAX_R / Math.max(p.radius, CORE_R * 1.8), 1.5);
        p.angle += p.angSpeed * momentum;

        const t = Math.max(0, (p.radius - CORE_R) / (MAX_R - CORE_R));
        p.radius -= p.fallRate * (1 + Math.pow(1 - t, 3) * 5) * 0.35;

        if (p.radius < CORE_R * 1.3) {
          Object.assign(p, makeVortex(false));
          p.tail = [];
          continue;
        }

        const x = cx + p.radius * Math.cos(p.angle);
        const y = cy + p.radius * Math.sin(p.angle);

        // Tail
        p.tail.push({ x, y });
        if (p.tail.length > 7) p.tail.shift();

        const bright = (1 - t * 0.6) + 0.15;
        const alpha  = Math.min(0.9, p.opacity * bright);
        const litBoost = (1 - t) * 42;

        // Draw tail
        if (p.tail.length > 2) {
          ctx.beginPath();
          ctx.moveTo(p.tail[0].x, p.tail[0].y);
          for (let j = 1; j < p.tail.length; j++) ctx.lineTo(p.tail[j].x, p.tail[j].y);
          ctx.strokeStyle = `hsla(${p.hue},90%,${Math.min(88, 48 + litBoost)}%,${alpha * 0.55})`;
          ctx.lineWidth = p.size * 0.7;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.stroke();
        }

        // Core dot with glow halo
        ctx.beginPath();
        ctx.arc(x, y, p.size * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},90%,${Math.min(85, 48 + litBoost)}%,${alpha * 0.12})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, p.size * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},90%,${Math.min(92, 58 + litBoost)}%,${alpha})`;
        ctx.fill();
      }

      // ── Ambient dust ──
      for (let i = 0; i < dust.length; i++) {
        const d = dust[i];
        d.x += d.vx; d.y += d.vy; d.life++;

        // Slight pull toward center at outer range
        const dx = cx - d.x, dy = cy - d.y;
        const dist = Math.hypot(dx, dy);
        if (dist > CORE_R * 3) {
          d.vx += dx / dist * 0.006;
          d.vy += dy / dist * 0.006;
        }

        const lt = d.life / d.maxLife;
        const a = d.opacity * (lt < 0.2 ? lt / 0.2 : lt > 0.8 ? (1 - lt) / 0.2 : 1);
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${d.hue},70%,70%,${a})`;
        ctx.fill();

        if (d.life >= d.maxLife || dist < CORE_R) dust[i] = makeDust();
      }

      // ── Photon ring glow ──
      const ppulse = 1 + Math.sin(time * 2.6) * 0.045;
      const pR = CORE_R * 1.5 * ppulse;
      const pg = ctx.createRadialGradient(cx, cy, CORE_R * 0.85, cx, cy, pR * 2.2);
      pg.addColorStop(0,    "rgba(0,229,255,0)");
      pg.addColorStop(0.3,  `rgba(0,229,255,${0.28 + Math.sin(time * 2.6) * 0.07})`);
      pg.addColorStop(0.65, "rgba(0,229,255,0.06)");
      pg.addColorStop(1,    "rgba(0,229,255,0)");
      ctx.beginPath();
      ctx.arc(cx, cy, pR * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = pg;
      ctx.fill();

      // Purple secondary ring
      const pg2 = ctx.createRadialGradient(cx, cy, CORE_R, cx, cy, pR * 3.0);
      pg2.addColorStop(0,    "rgba(168,85,247,0)");
      pg2.addColorStop(0.38, `rgba(168,85,247,${0.12 + Math.sin(time * 1.7 + 1) * 0.04})`);
      pg2.addColorStop(1,    "rgba(168,85,247,0)");
      ctx.beginPath();
      ctx.arc(cx, cy, pR * 3.0, 0, Math.PI * 2);
      ctx.fillStyle = pg2;
      ctx.fill();

      // ── Inner world stars (inside event horizon) ──
      for (const s of innerStars) {
        s.angle += s.speed;
        const sx = cx + s.radius * Math.cos(s.angle);
        const sy = cy + s.radius * Math.sin(s.angle);
        const twinkle = 0.6 + 0.4 * Math.sin(time * 4 + s.angle * 3);
        ctx.beginPath();
        ctx.arc(sx, sy, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,235,255,${s.opacity * twinkle})`;
        ctx.fill();
      }

      // ── Event horizon (black core) ──
      const hg = ctx.createRadialGradient(cx, cy, 0, cx, cy, CORE_R * 1.45);
      hg.addColorStop(0,    "rgba(0,0,12,1)");
      hg.addColorStop(0.75, "rgba(0,0,8,1)");
      hg.addColorStop(1,    "rgba(0,0,5,0)");
      ctx.beginPath();
      ctx.arc(cx, cy, CORE_R * 1.45, 0, Math.PI * 2);
      ctx.fillStyle = hg;
      ctx.fill();

      // ── Edge vignette ──
      const vg = ctx.createRadialGradient(cx, cy, MAX_R * 0.62, cx, cy, MAX_R * 2.1);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(0,0,0,0.96)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);
    }

    frame();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden
    />
  );
}
