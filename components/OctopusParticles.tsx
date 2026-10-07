"use client";
import { useEffect, useRef } from "react";

interface Particle {
  x: number; y: number;
  tx: number; ty: number;
  vx: number; vy: number;
  r: number;
  color: string;
  phase: number;
}

function drawOctopusShape(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const cx = W / 2;
  ctx.clearRect(0, 0, W, H);

  // Mantle
  ctx.beginPath();
  ctx.ellipse(cx, H * 0.27, W * 0.285, H * 0.225, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#00e5ff";
  ctx.fill();

  // Inner shading
  ctx.beginPath();
  ctx.ellipse(cx, H * 0.24, W * 0.17, H * 0.135, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#00bcd4";
  ctx.fill();

  // Eyes
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(cx + side * W * 0.09, H * 0.235, W * 0.052, 0, Math.PI * 2);
    ctx.fillStyle = "#e0f7fa";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + side * W * 0.09, H * 0.235, W * 0.024, 0, Math.PI * 2);
    ctx.fillStyle = "#001a22";
    ctx.fill();
  }

  // Web collar
  ctx.beginPath();
  ctx.ellipse(cx, H * 0.495, W * 0.295, H * 0.088, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#0097a7";
  ctx.fill();

  // 8 Tentacles
  for (let i = 0; i < 8; i++) {
    const spread = (i / 7) * 2 - 1;
    const startX = cx + spread * W * 0.26;
    const startY = H * 0.535;
    const endX = cx + spread * W * 0.46;
    const endY = H * 0.87 + Math.sin(i * 0.95) * H * 0.038;
    const cp1x = cx + spread * W * 0.32;
    const cp1y = H * 0.665;
    const cp2x = cx + spread * W * 0.41;
    const cp2y = H * 0.785;
    const lw = Math.max(W * 0.043 * (1 - Math.abs(spread) * 0.18), 5);

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
    ctx.lineWidth = lw;
    ctx.strokeStyle = i % 2 === 0 ? "#00b8d4" : "#00838f";
    ctx.lineCap = "round";
    ctx.stroke();

    for (let s = 1; s <= 4; s++) {
      const st = s / 5;
      const bx =
        Math.pow(1 - st, 3) * startX +
        3 * Math.pow(1 - st, 2) * st * cp1x +
        3 * (1 - st) * st * st * cp2x +
        Math.pow(st, 3) * endX;
      const by =
        Math.pow(1 - st, 3) * startY +
        3 * Math.pow(1 - st, 2) * st * cp1y +
        3 * (1 - st) * st * st * cp2y +
        Math.pow(st, 3) * endY;
      ctx.beginPath();
      ctx.arc(bx, by, lw * 0.38, 0, Math.PI * 2);
      ctx.fillStyle = "#b2ebf2";
      ctx.fill();
    }

    const curlDir = i < 4 ? -1 : 1;
    const cr = W * 0.026;
    const ccx = endX + curlDir * cr * 1.4;
    const ccy = endY - cr * 0.7;
    ctx.beginPath();
    ctx.arc(ccx, ccy, cr, 0, Math.PI * 1.75);
    ctx.lineWidth = cr * 0.75;
    ctx.strokeStyle = "#ce93d8";
    ctx.stroke();
  }
}

export default function OctopusParticles({ visible }: { visible: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    visible: false,
    time: 0,
    particles: [] as Particle[],
    raf: 0,
  });

  useEffect(() => { stateRef.current.visible = visible; }, [visible]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const W = 288, H = 370;
    const DPR = window.devicePixelRatio || 1;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;

    const ctx = canvas.getContext("2d")!;
    ctx.scale(DPR, DPR);

    const off = document.createElement("canvas");
    off.width = W; off.height = H;
    const offCtx = off.getContext("2d")!;
    drawOctopusShape(offCtx, W, H);

    const imgData = offCtx.getImageData(0, 0, W, H);
    const targets: { x: number; y: number; color: string }[] = [];

    for (let y = 0; y < H; y += 4) {
      for (let x = 0; x < W; x += 4) {
        const idx = (y * W + x) * 4;
        if (imgData.data[idx + 3] > 90) {
          const r = imgData.data[idx];
          const g = imgData.data[idx + 1];
          const b = imgData.data[idx + 2];
          targets.push({ x, y, color: `rgb(${r},${g},${b})` });
        }
      }
    }

    stateRef.current.particles = targets.map(t => ({
      x: Math.random() * W, y: Math.random() * H,
      tx: t.x, ty: t.y,
      vx: (Math.random() - 0.5) * 5,
      vy: (Math.random() - 0.5) * 5,
      r: Math.random() * 1.7 + 0.4,
      color: t.color,
      phase: Math.random() * Math.PI * 2,
    }));

    function animate() {
      const s = stateRef.current;
      s.raf = requestAnimationFrame(animate);
      s.time += 0.018;

      ctx.fillStyle = "rgba(5,5,5,0.16)";
      ctx.fillRect(0, 0, W, H);

      for (const p of s.particles) {
        if (s.visible) {
          const fx = Math.sin(s.time * 0.85 + p.phase) * 1.6;
          const fy = Math.cos(s.time * 0.65 + p.phase) * 1.6;
          const dx = p.tx + fx - p.x;
          const dy = p.ty + fy - p.y;
          p.vx = p.vx * 0.83 + dx * 0.058;
          p.vy = p.vy * 0.83 + dy * 0.058;
        } else {
          p.vx += (Math.random() - 0.5) * 0.32;
          p.vy += (Math.random() - 0.5) * 0.32;
          p.vx *= 0.975; p.vy *= 0.975;
          if (p.x < 0 || p.x > W) p.vx *= -0.85;
          if (p.y < 0 || p.y > H) p.vy *= -0.85;
        }
        p.x += p.vx; p.y += p.vy;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 2.8, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace("rgb(", "rgba(").replace(")", ",0.08)");
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }
    }

    animate();
    return () => cancelAnimationFrame(stateRef.current.raf);
  }, []);

  return <canvas ref={canvasRef} className="relative z-10" />;
}
