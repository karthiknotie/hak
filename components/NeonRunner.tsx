"use client";
import { useState, useEffect, useRef, useCallback } from "react";

interface Obstacle {
  x: number;
  width: number;
  height: number;
  gap: number;
}

type RunnerState = "idle" | "playing" | "gameover";

export default function NeonRunner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<RunnerState>("idle");
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(0);

  const stateRef = useRef({
    playerY: 0,
    velocityY: 0,
    grounded: true,
    obstacles: [] as Obstacle[],
    score: 0,
    level: 1,
    speed: 4,
    frameCount: 0,
    particles: [] as { x: number; y: number; vx: number; vy: number; life: number; color: string }[],
    gameState: "idle" as RunnerState,
    groundY: 0,
    playerX: 80,
    playerSize: 28,
    doubleJumped: false,
    // Cyberpunk effect state
    deathFlashTimer: 0,
    levelUpFlashTimer: 0,
    levelUpText: "",
    trailPositions: [] as { x: number; y: number }[],
  });

  useEffect(() => {
    const saved = localStorage.getItem("hakRunnerHighScore");
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  const jump = useCallback(() => {
    const s = stateRef.current;
    if (s.gameState !== "playing") return;
    if (s.grounded) {
      s.velocityY = -13;
      s.grounded = false;
      s.doubleJumped = false;
      for (let i = 0; i < 6; i++) {
        s.particles.push({
          x: s.playerX + s.playerSize / 2,
          y: s.playerY + s.playerSize,
          vx: (Math.random() - 0.5) * 3,
          vy: Math.random() * 2 + 1,
          life: 20 + Math.random() * 15,
          color: "#00e5ff",
        });
      }
    } else if (!s.doubleJumped) {
      s.velocityY = -11;
      s.doubleJumped = true;
      for (let i = 0; i < 4; i++) {
        s.particles.push({
          x: s.playerX + s.playerSize / 2,
          y: s.playerY + s.playerSize,
          vx: (Math.random() - 0.5) * 4,
          vy: Math.random() * 2,
          life: 15 + Math.random() * 10,
          color: "#c084fc",
        });
      }
    }
  }, []);

  const startGame = useCallback(() => {
    const s = stateRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    s.groundY = canvas.height - 60;
    s.playerY = s.groundY - s.playerSize;
    s.velocityY = 0;
    s.grounded = true;
    s.doubleJumped = false;
    s.obstacles = [];
    s.score = 0;
    s.level = 1;
    s.speed = 4;
    s.frameCount = 0;
    s.particles = [];
    s.gameState = "playing";
    s.deathFlashTimer = 0;
    s.levelUpFlashTimer = 0;
    s.levelUpText = "";
    s.trailPositions = [];
    setScore(0);
    setLevel(1);
    setGameState("playing");
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      stateRef.current.groundY = canvas.height - 60;
    };
    resize();
    window.addEventListener("resize", resize);

    const handleKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        if (stateRef.current.gameState === "idle" || stateRef.current.gameState === "gameover") {
          startGame();
        } else {
          jump();
        }
      }
    };
    window.addEventListener("keydown", handleKey);

    let animId: number;

    const loop = () => {
      const s = stateRef.current;
      const W = canvas.width;
      const H = canvas.height;

      ctx.clearRect(0, 0, W, H);

      // Grid bg with hex dot intersections and circuit traces
      ctx.strokeStyle = "rgba(0,229,255,0.03)";
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 48) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += 48) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Hex dot intersections
      ctx.fillStyle = "rgba(0,229,255,0.08)";
      for (let x = 0; x < W; x += 48) {
        for (let y = 0; y < H; y += 48) {
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Subtle circuit trace paths between nodes
      ctx.strokeStyle = "rgba(0,229,255,0.025)";
      ctx.lineWidth = 0.5;
      for (let x = 48; x < W; x += 96) {
        for (let y = 48; y < H - 80; y += 96) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + 24, y);
          ctx.lineTo(x + 24, y + 24);
          ctx.stroke();
        }
      }

      // Ground line - double-line with neon glow
      ctx.save();
      ctx.shadowColor = "#00e5ff";
      ctx.shadowBlur = 12;
      ctx.strokeStyle = "rgba(0,229,255,0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, s.groundY);
      ctx.lineTo(W, s.groundY);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(0,229,255,0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, s.groundY + 4);
      ctx.lineTo(W, s.groundY + 4);
      ctx.stroke();
      ctx.restore();

      // Circuit nodes along the ground
      const nodeOffset = (s.frameCount * s.speed) % 48;
      ctx.fillStyle = "rgba(0,229,255,0.2)";
      ctx.strokeStyle = "rgba(0,229,255,0.12)";
      ctx.lineWidth = 0.5;
      for (let x = -nodeOffset; x < W; x += 48) {
        ctx.fillRect(x - 2, s.groundY - 2, 4, 4);
        ctx.strokeRect(x - 3, s.groundY - 3, 6, 6);
      }

      // Ground glow dots
      const dotOffset = (s.frameCount * s.speed) % 24;
      ctx.fillStyle = "rgba(0,229,255,0.15)";
      for (let x = -dotOffset; x < W; x += 24) {
        ctx.fillRect(x, s.groundY + 1, 1, 1);
      }

      if (s.gameState === "playing") {
        s.frameCount++;

        // Store trail positions for afterimage
        if (s.frameCount % 2 === 0) {
          s.trailPositions.unshift({ x: s.playerX, y: s.playerY });
          if (s.trailPositions.length > 3) s.trailPositions.pop();
        }

        // Level up every 600 frames
        const newLevel = Math.floor(s.frameCount / 600) + 1;
        if (newLevel !== s.level) {
          s.level = newLevel;
          s.speed = 4 + newLevel * 0.8;
          setLevel(newLevel);
          s.levelUpFlashTimer = 45;
          s.levelUpText = `LEVEL_UP:// LV.${newLevel}`;
          // Level-up particles
          for (let i = 0; i < 15; i++) {
            s.particles.push({
              x: s.playerX + s.playerSize / 2,
              y: s.playerY + s.playerSize / 2,
              vx: (Math.random() - 0.5) * 8,
              vy: (Math.random() - 0.5) * 8,
              life: 30 + Math.random() * 20,
              color: i % 2 === 0 ? "#00e5ff" : "#c084fc",
            });
          }
        }

        // Score
        s.score = Math.floor(s.frameCount / 3);
        setScore(s.score);

        // Physics
        s.velocityY += 0.7;
        s.playerY += s.velocityY;
        if (s.playerY >= s.groundY - s.playerSize) {
          s.playerY = s.groundY - s.playerSize;
          s.velocityY = 0;
          s.grounded = true;
          s.doubleJumped = false;
        }

        // Spawn obstacles
        const spawnRate = Math.max(45, 100 - s.level * 6);
        if (s.frameCount % spawnRate === 0) {
          const h = 20 + Math.random() * 35 + s.level * 2;
          s.obstacles.push({
            x: W + 10,
            width: 16 + Math.random() * 14,
            height: h,
            gap: 0,
          });
        }

        // Move obstacles
        s.obstacles = s.obstacles.filter(o => {
          o.x -= s.speed;
          return o.x > -60;
        });

        // Collision
        const px1 = s.playerX + 4;
        const py1 = s.playerY + 4;
        const px2 = s.playerX + s.playerSize - 4;
        const py2 = s.playerY + s.playerSize - 4;
        for (const o of s.obstacles) {
          const ox1 = o.x;
          const oy1 = s.groundY - o.height;
          const ox2 = o.x + o.width;
          const oy2 = s.groundY;
          if (px2 > ox1 && px1 < ox2 && py2 > oy1 && py1 < oy2) {
            s.gameState = "gameover";
            setGameState("gameover");
            s.deathFlashTimer = 30;
            // Death particles
            for (let i = 0; i < 20; i++) {
              s.particles.push({
                x: s.playerX + s.playerSize / 2,
                y: s.playerY + s.playerSize / 2,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 30 + Math.random() * 30,
                color: i % 3 === 0 ? "#ff0040" : i % 3 === 1 ? "#00e5ff" : "#c084fc",
              });
            }
            setHighScore(prev => {
              const newHigh = Math.max(prev, s.score);
              if (newHigh > prev) localStorage.setItem("hakRunnerHighScore", String(newHigh));
              return newHigh;
            });
            break;
          }
        }

        // Trail particles
        if (s.frameCount % 3 === 0) {
          s.particles.push({
            x: s.playerX,
            y: s.playerY + s.playerSize / 2 + (Math.random() - 0.5) * 10,
            vx: -1 - Math.random(),
            vy: (Math.random() - 0.5) * 0.5,
            life: 12 + Math.random() * 8,
            color: s.grounded ? "rgba(0,229,255,0.4)" : "rgba(192,132,252,0.5)",
          });
        }
      }

      // Draw obstacles with cyberpunk enhancements
      for (const o of s.obstacles) {
        const oTop = s.groundY - o.height;
        const glitchJitter = (s.frameCount % 17 === 0) ? (Math.random() - 0.5) * 3 : 0;
        const drawX = o.x + glitchJitter;

        const gradient = ctx.createLinearGradient(drawX, oTop, drawX, s.groundY);
        gradient.addColorStop(0, "rgba(255,0,64,0.9)");
        gradient.addColorStop(1, "rgba(255,0,64,0.3)");
        ctx.fillStyle = gradient;
        ctx.fillRect(drawX, oTop, o.width, o.height);

        ctx.strokeStyle = "rgba(255,0,64,0.7)";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(drawX, oTop, o.width, o.height);

        // Top glow
        ctx.shadowColor = "#ff0040";
        ctx.shadowBlur = 10;
        ctx.fillStyle = "#ff0040";
        ctx.fillRect(drawX, oTop, o.width, 2);
        ctx.shadowBlur = 0;

        // Diagonal warning stripes pattern
        ctx.save();
        ctx.beginPath();
        ctx.rect(drawX, oTop, o.width, o.height);
        ctx.clip();
        ctx.strokeStyle = "rgba(255,0,64,0.18)";
        ctx.lineWidth = 1;
        for (let dy = -o.height; dy < o.height + o.width; dy += 8) {
          ctx.beginPath();
          ctx.moveTo(drawX + dy, oTop);
          ctx.lineTo(drawX + dy - o.height, oTop + o.height);
          ctx.stroke();
        }
        ctx.restore();

        // Circuit-board trace on edges (small perpendicular lines)
        ctx.strokeStyle = "rgba(255,0,64,0.3)";
        ctx.lineWidth = 0.5;
        for (let ey = oTop + 8; ey < s.groundY; ey += 16) {
          // Left edge
          ctx.beginPath();
          ctx.moveTo(drawX, ey);
          ctx.lineTo(drawX - 4, ey);
          ctx.stroke();
          // Right edge
          ctx.beginPath();
          ctx.moveTo(drawX + o.width, ey);
          ctx.lineTo(drawX + o.width + 4, ey);
          ctx.stroke();
        }
        // Top edge
        for (let ex = drawX + 5; ex < drawX + o.width - 2; ex += 10) {
          ctx.beginPath();
          ctx.moveTo(ex, oTop);
          ctx.lineTo(ex, oTop - 4);
          ctx.stroke();
        }
      }

      // Draw player
      const px = s.playerX;
      const py = s.playerY;
      const ps = s.playerSize;

      // Afterimage trail (draw 2-3 faded copies at previous positions)
      for (let t = s.trailPositions.length - 1; t >= 0; t--) {
        const tp = s.trailPositions[t];
        const trailAlpha = 0.08 + (s.trailPositions.length - 1 - t) * 0.02;
        const trailColor = s.grounded ? `rgba(0,229,255,${trailAlpha})` : `rgba(192,132,252,${trailAlpha})`;
        ctx.beginPath();
        ctx.moveTo(tp.x + ps / 2, tp.y);
        ctx.lineTo(tp.x + ps, tp.y + ps / 2);
        ctx.lineTo(tp.x + ps / 2, tp.y + ps);
        ctx.lineTo(tp.x, tp.y + ps / 2);
        ctx.closePath();
        ctx.strokeStyle = trailColor;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Player glow
      ctx.shadowColor = s.grounded ? "#00e5ff" : "#c084fc";
      ctx.shadowBlur = 15;

      // Player body (diamond shape)
      ctx.beginPath();
      ctx.moveTo(px + ps / 2, py);
      ctx.lineTo(px + ps, py + ps / 2);
      ctx.lineTo(px + ps / 2, py + ps);
      ctx.lineTo(px, py + ps / 2);
      ctx.closePath();
      ctx.fillStyle = s.grounded ? "rgba(0,229,255,0.15)" : "rgba(192,132,252,0.15)";
      ctx.fill();
      ctx.strokeStyle = s.grounded ? "#00e5ff" : "#c084fc";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Player inner
      ctx.beginPath();
      ctx.moveTo(px + ps / 2, py + 6);
      ctx.lineTo(px + ps - 6, py + ps / 2);
      ctx.lineTo(px + ps / 2, py + ps - 6);
      ctx.lineTo(px + 6, py + ps / 2);
      ctx.closePath();
      ctx.strokeStyle = s.grounded ? "rgba(0,229,255,0.4)" : "rgba(192,132,252,0.4)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Player center dot
      ctx.beginPath();
      ctx.arc(px + ps / 2, py + ps / 2, 3, 0, Math.PI * 2);
      ctx.fillStyle = s.grounded ? "#00e5ff" : "#c084fc";
      ctx.fill();

      // HUD bracket corners around the diamond
      const bracketLen = 6;
      const bracketOff = 5;
      const bracketColor = s.grounded ? "rgba(0,229,255,0.5)" : "rgba(192,132,252,0.5)";
      ctx.strokeStyle = bracketColor;
      ctx.lineWidth = 1;
      // Top-left
      ctx.beginPath();
      ctx.moveTo(px - bracketOff, py - bracketOff + bracketLen);
      ctx.lineTo(px - bracketOff, py - bracketOff);
      ctx.lineTo(px - bracketOff + bracketLen, py - bracketOff);
      ctx.stroke();
      // Top-right
      ctx.beginPath();
      ctx.moveTo(px + ps + bracketOff - bracketLen, py - bracketOff);
      ctx.lineTo(px + ps + bracketOff, py - bracketOff);
      ctx.lineTo(px + ps + bracketOff, py - bracketOff + bracketLen);
      ctx.stroke();
      // Bottom-left
      ctx.beginPath();
      ctx.moveTo(px - bracketOff, py + ps + bracketOff - bracketLen);
      ctx.lineTo(px - bracketOff, py + ps + bracketOff);
      ctx.lineTo(px - bracketOff + bracketLen, py + ps + bracketOff);
      ctx.stroke();
      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(px + ps + bracketOff - bracketLen, py + ps + bracketOff);
      ctx.lineTo(px + ps + bracketOff, py + ps + bracketOff);
      ctx.lineTo(px + ps + bracketOff, py + ps + bracketOff - bracketLen);
      ctx.stroke();

      // Data readout below player
      if (s.gameState === "playing") {
        ctx.fillStyle = "rgba(0,229,255,0.35)";
        ctx.font = "7px 'Geist Mono', monospace";
        ctx.textAlign = "center";
        ctx.fillText(`VEL ${Math.abs(s.velocityY).toFixed(1)}`, px + ps / 2, py + ps + bracketOff + 12);
      }

      // Particles
      s.particles = s.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        const alpha = Math.max(0, p.life / 40);
        ctx.fillStyle = p.color.startsWith("rgba") ? p.color : p.color;
        ctx.globalAlpha = alpha;
        ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
        ctx.globalAlpha = 1;
        return p.life > 0;
      });

      // Death flash effect - screen glitch with RGB-split
      if (s.deathFlashTimer > 0) {
        s.deathFlashTimer--;
        const intensity = s.deathFlashTimer / 30;

        // RGB-split colored rectangles
        ctx.globalAlpha = intensity * 0.3;
        for (let i = 0; i < 6; i++) {
          const gy = Math.random() * H;
          const gh = 2 + Math.random() * 8;
          // Red channel split
          ctx.fillStyle = "#ff0040";
          ctx.fillRect(Math.random() * 10 - 5, gy, W, gh);
          // Cyan channel split
          ctx.fillStyle = "#00e5ff";
          ctx.fillRect(Math.random() * 10 - 5, gy + 2, W, gh * 0.5);
        }
        ctx.globalAlpha = 1;

        // "SYSTEM FAILURE" text with glitch-style rendering
        if (s.deathFlashTimer > 10) {
          const textY = H / 2;
          ctx.font = "bold 24px 'Orbitron', 'Geist Mono', monospace";
          ctx.textAlign = "center";
          // Red offset copy
          ctx.fillStyle = "rgba(255,0,64,0.6)";
          ctx.fillText("SYSTEM FAILURE", W / 2 + 3, textY - 2);
          // Blue offset copy
          ctx.fillStyle = "rgba(0,229,255,0.6)";
          ctx.fillText("SYSTEM FAILURE", W / 2 - 3, textY + 2);
          // White main copy
          ctx.fillStyle = "rgba(255,255,255,0.9)";
          ctx.fillText("SYSTEM FAILURE", W / 2, textY);
        }
      }

      // Level-up flash effect
      if (s.levelUpFlashTimer > 0) {
        s.levelUpFlashTimer--;
        const intensity = s.levelUpFlashTimer / 45;

        ctx.font = "bold 18px 'Orbitron', 'Geist Mono', monospace";
        ctx.textAlign = "center";
        const textY = H / 2 - 30;
        // Glitch offset copies
        ctx.fillStyle = `rgba(192,132,252,${intensity * 0.5})`;
        ctx.fillText(s.levelUpText, W / 2 + 2, textY - 1);
        ctx.fillStyle = `rgba(0,229,255,${intensity * 0.5})`;
        ctx.fillText(s.levelUpText, W / 2 - 2, textY + 1);
        // Main text
        ctx.fillStyle = `rgba(255,255,255,${intensity * 0.9})`;
        ctx.fillText(s.levelUpText, W / 2, textY);

        // Horizontal glitch lines
        ctx.globalAlpha = intensity * 0.15;
        ctx.fillStyle = "#c084fc";
        ctx.fillRect(0, textY - 20, W, 1);
        ctx.fillRect(0, textY + 10, W, 1);
        ctx.globalAlpha = 1;
      }

      // Level indicator
      if (s.gameState === "playing") {
        ctx.fillStyle = "rgba(0,229,255,0.3)";
        ctx.font = "bold 11px 'Geist Mono', monospace";
        ctx.textAlign = "right";
        ctx.fillText(`LVL ${s.level}  ·  SPD ${s.speed.toFixed(1)}`, W - 20, 30);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", handleKey);
    };
  }, [startGame, jump]);

  const handleClick = () => {
    if (gameState === "idle" || gameState === "gameover") {
      startGame();
    } else {
      jump();
    }
  };

  return (
    <div className="relative w-full h-full">
      <div
        className="relative w-full h-full overflow-hidden select-none cursor-pointer"
        style={{
          background: "rgba(0,2,10,0.98)",
          border: `1px solid ${gameState === "playing" ? "rgba(0,229,255,0.28)" : "rgba(255,255,255,0.07)"}`,
          boxShadow: gameState === "playing" ? "0 0 60px rgba(0,229,255,0.05), inset 0 0 120px rgba(0,0,0,0.9)" : "none",
          transition: "border-color 0.4s, box-shadow 0.4s",
        }}
        onClick={handleClick}
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {/* Idle overlay */}
        {gameState === "idle" && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center z-30"
            style={{
              background: "rgba(0,0,0,0.82)",
              backdropFilter: "blur(8px)",
              clipPath: "polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))",
            }}
          >
            {/* Neon corner edges */}
            <span className="absolute top-0 left-0 w-8 h-[2px]" style={{ background: "#00e5ff", boxShadow: "0 0 8px #00e5ff" }} />
            <span className="absolute top-0 left-0 w-[2px] h-8" style={{ background: "#00e5ff", boxShadow: "0 0 8px #00e5ff" }} />
            <span className="absolute top-0 right-6 w-8 h-[2px]" style={{ background: "#c084fc", boxShadow: "0 0 8px #c084fc" }} />
            <span className="absolute bottom-6 left-0 w-[2px] h-8" style={{ background: "#c084fc", boxShadow: "0 0 8px #c084fc" }} />
            <span className="absolute bottom-0 right-0 w-8 h-[2px]" style={{ background: "#00e5ff", boxShadow: "0 0 8px #00e5ff" }} />
            <span className="absolute bottom-0 right-0 w-[2px] h-8" style={{ background: "#00e5ff", boxShadow: "0 0 8px #00e5ff" }} />

            {/* Scan line effect */}
            <div
              className="absolute inset-0 pointer-events-none z-40"
              style={{
                background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,229,255,0.015) 2px, rgba(0,229,255,0.015) 4px)",
              }}
            />
            <div
              className="absolute left-0 w-full h-[2px] pointer-events-none z-40"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(0,229,255,0.08), transparent)",
                animation: "cyberSlideUp 3s linear infinite",
              }}
            />

            {/* Circuit decorations */}
            <div className="absolute top-8 left-8 pointer-events-none" style={{ opacity: 0.1 }}>
              <svg width="60" height="40" viewBox="0 0 60 40">
                <path d="M0 20 H20 L25 10 H45 L50 20 H60" stroke="#00e5ff" strokeWidth="1" fill="none" />
                <circle cx="20" cy="20" r="2" fill="#00e5ff" />
                <circle cx="50" cy="20" r="2" fill="#00e5ff" />
              </svg>
            </div>
            <div className="absolute bottom-12 right-8 pointer-events-none" style={{ opacity: 0.1 }}>
              <svg width="60" height="40" viewBox="0 0 60 40">
                <path d="M0 10 H15 L20 30 H40 L45 10 H60" stroke="#c084fc" strokeWidth="1" fill="none" />
                <circle cx="15" cy="10" r="2" fill="#c084fc" />
                <circle cx="45" cy="10" r="2" fill="#c084fc" />
              </svg>
            </div>

            <div className="text-center px-4 sm:px-8 max-w-md relative z-50">
              <p
                className="font-mono text-xs uppercase tracking-[0.3em] mb-3"
                style={{
                  color: "#00e5ff",
                  textShadow: "0 0 10px rgba(0,229,255,0.5)",
                }}
              >
                {/* Flickering status dot */}
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full mr-2 align-middle"
                  style={{
                    background: "#00e5ff",
                    boxShadow: "0 0 6px #00e5ff",
                    animation: "cyberFlicker 2s infinite",
                  }}
                />
                Endless Mission
              </p>
              <h3
                className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight"
                style={{
                  fontFamily: "'Orbitron', 'Space Grotesk', monospace",
                  animation: "cyberGlitchText 4s infinite",
                  textShadow: "0 0 20px rgba(0,229,255,0.3), 0 0 40px rgba(0,229,255,0.1)",
                }}
              >
                NEON RUNNER
              </h3>
              <p
                className="font-mono text-sm leading-7 mb-3"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                Run through infinite neon obstacles.<br />
                Speed increases with each level -- how far can you go?
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 mb-3 font-mono text-[10px] sm:text-xs">
                <span style={{ color: "#00e5ff" }}>
                  <span style={{ color: "rgba(0,229,255,0.5)" }}>{">_"} </span>
                  CLICK / SPACE -- Jump
                </span>
                <span style={{ color: "#c084fc" }}>
                  <span style={{ color: "rgba(192,132,252,0.5)" }}>{">_"} </span>
                  Double-jump!
                </span>
              </div>
              <p className="text-zinc-600 font-mono text-xs mb-8 tracking-wider">Levels increase every 200 distance</p>
              <button
                onClick={(e) => { e.stopPropagation(); startGame(); }}
                className="font-black text-xs sm:text-sm uppercase tracking-widest px-8 sm:px-12 py-3 sm:py-4 transition-all duration-300 cursor-pointer"
                style={{
                  fontFamily: "'Orbitron', 'Space Grotesk', monospace",
                  background: "rgba(0,229,255,0.07)",
                  border: "2px solid rgba(0,229,255,0.45)",
                  color: "#00e5ff",
                  clipPath: "polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,14px 100%,0 calc(100% - 14px))",
                  textShadow: "0 0 10px rgba(0,229,255,0.4)",
                  animation: "cyberNeonPulse 3s infinite",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,229,255,0.18)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,229,255,0.07)"; }}
              >
                START RUNNING
              </button>
            </div>
          </div>
        )}

        {/* Game over */}
        {gameState === "gameover" && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center z-30"
            style={{
              background: "rgba(0,0,0,0.85)",
              backdropFilter: "blur(8px)",
              clipPath: "polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))",
              animation: "cyberGlitchIn 0.4s ease-out",
            }}
          >
            {/* Neon corner edges */}
            <span className="absolute top-0 left-0 w-8 h-[2px]" style={{ background: "#ff0040", boxShadow: "0 0 8px #ff0040" }} />
            <span className="absolute top-0 left-0 w-[2px] h-8" style={{ background: "#ff0040", boxShadow: "0 0 8px #ff0040" }} />
            <span className="absolute top-0 right-6 w-8 h-[2px]" style={{ background: "#c084fc", boxShadow: "0 0 8px #c084fc" }} />
            <span className="absolute bottom-6 left-0 w-[2px] h-8" style={{ background: "#c084fc", boxShadow: "0 0 8px #c084fc" }} />
            <span className="absolute bottom-0 right-0 w-8 h-[2px]" style={{ background: "#00e5ff", boxShadow: "0 0 8px #00e5ff" }} />
            <span className="absolute bottom-0 right-0 w-[2px] h-8" style={{ background: "#00e5ff", boxShadow: "0 0 8px #00e5ff" }} />

            {/* Scan line effect */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,0,64,0.01) 2px, rgba(255,0,64,0.01) 4px)",
              }}
            />

            {/* Circuit decorations */}
            <div className="absolute top-6 right-12 pointer-events-none" style={{ opacity: 0.08 }}>
              <svg width="80" height="30" viewBox="0 0 80 30">
                <path d="M0 15 H20 L28 5 H55 L60 15 H80" stroke="#ff0040" strokeWidth="1" fill="none" />
                <circle cx="28" cy="5" r="2" fill="#ff0040" />
                <circle cx="60" cy="15" r="2" fill="#ff0040" />
              </svg>
            </div>
            <div className="absolute bottom-10 left-12 pointer-events-none" style={{ opacity: 0.08 }}>
              <svg width="70" height="30" viewBox="0 0 70 30">
                <path d="M0 20 H10 L18 8 H50 L55 20 H70" stroke="#00e5ff" strokeWidth="1" fill="none" />
                <circle cx="18" cy="8" r="2" fill="#00e5ff" />
              </svg>
            </div>

            <div className="text-center px-4 sm:px-8 max-w-sm w-full relative z-50">
              <p
                className="font-mono text-xs uppercase tracking-[0.3em] mb-2"
                style={{
                  color: "#ff0040",
                  textShadow: "0 0 10px rgba(255,0,64,0.5)",
                  animation: "cyberFlicker 1.5s infinite",
                }}
              >
                [ CRASHED ]
              </p>
              <h3
                className="text-3xl font-black text-white mb-6 tracking-wider"
                style={{
                  fontFamily: "'Orbitron', 'Space Grotesk', monospace",
                  animation: "cyberGlitchText 3s infinite",
                  textShadow: "0 0 20px rgba(255,0,64,0.3), 0 0 40px rgba(255,0,64,0.1)",
                }}
              >
                RUN OVER
              </h3>
              <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6 font-mono text-left">
                {[
                  { label: "Distance", val: score.toLocaleString(), color: "#00e5ff" },
                  { label: "Level", val: level.toString(), color: "#c084fc" },
                  { label: "High Score", val: highScore.toLocaleString(), color: "#f97316" },
                ].map(({ label, val, color }) => (
                  <div
                    key={label}
                    className="p-2.5 sm:p-4"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: `1px solid ${color}22`,
                      clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                      position: "relative",
                    }}
                  >
                    <div className="text-zinc-600 text-[10px] uppercase tracking-widest mb-1">{label}</div>
                    <div className="font-black text-base sm:text-xl" style={{ color, textShadow: `0 0 14px ${color}55` }}>{val}</div>
                  </div>
                ))}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); startGame(); }}
                className="w-full font-black text-sm uppercase tracking-widest py-4 transition-all duration-300 cursor-pointer"
                style={{
                  fontFamily: "'Orbitron', 'Space Grotesk', monospace",
                  background: "rgba(0,229,255,0.07)",
                  border: "2px solid rgba(0,229,255,0.35)",
                  color: "#00e5ff",
                  clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
                  textShadow: "0 0 10px rgba(0,229,255,0.4)",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,229,255,0.18)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,229,255,0.07)"; }}
              >
                RUN AGAIN
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
