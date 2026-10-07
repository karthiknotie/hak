"use client";
import { useState, useEffect, useRef, useCallback } from "react";

type HackState = "idle" | "showing" | "input" | "success" | "gameover";

interface Cell {
  id: number;
  symbol: string;
  active: boolean;
  correct: boolean;
  wrong: boolean;
}

const SYMBOLS = ["◆", "◇", "▲", "▽", "■", "□", "●", "○", "★", "✦", "⬡", "⬢", "◈", "⊕", "⊗", "⟐"];
const GRID_SIZE = 16;

export default function CyberHack() {
  const [gameState, setGameState] = useState<HackState>("idle");
  const [cells, setCells] = useState<Cell[]>([]);
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [breaches, setBreaches] = useState(0);
  const [showingIndex, setShowingIndex] = useState(-1);
  const [feedback, setFeedback] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("hakCyberHighScore");
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  const generateGrid = useCallback(() => {
    return Array.from({ length: GRID_SIZE }, (_, i) => ({
      id: i,
      symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      active: false,
      correct: false,
      wrong: false,
    }));
  }, []);

  const startLevel = useCallback((lvl: number, currentScore: number) => {
    const grid = generateGrid();
    const seqLength = Math.min(3 + lvl, 10);
    const indices: number[] = [];
    while (indices.length < seqLength) {
      const r = Math.floor(Math.random() * GRID_SIZE);
      if (!indices.includes(r)) indices.push(r);
    }

    setCells(grid);
    setSequence(indices);
    setPlayerIndex(0);
    setLevel(lvl);
    setScore(currentScore);
    setTimeLeft(0);
    setFeedback(`LEVEL ${lvl} — MEMORIZE THE SEQUENCE`);
    setGameState("showing");

    // Show sequence one by one
    let i = 0;
    const showInterval = setInterval(() => {
      if (i < indices.length) {
        setShowingIndex(indices[i]);
        i++;
      } else {
        clearInterval(showInterval);
        setShowingIndex(-1);
        setFeedback("BREACH THE SEQUENCE — GO!");
        setGameState("input");
        // Start timer
        const inputTime = Math.max(5, 15 - lvl);
        setTimeLeft(inputTime);
      }
    }, 600);
  }, [generateGrid]);

  const startGame = useCallback(() => {
    setBreaches(0);
    startLevel(1, 0);
  }, [startLevel]);

  // Timer countdown
  useEffect(() => {
    if (gameState !== "input") {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState("gameover");
          setFeedback("TIME OUT — FIREWALL LOCKED");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameState]);

  // Save high score on game over
  useEffect(() => {
    if (gameState === "gameover") {
      setHighScore(prev => {
        const newHigh = Math.max(prev, score);
        if (newHigh > prev) localStorage.setItem("hakCyberHighScore", String(newHigh));
        return newHigh;
      });
    }
  }, [gameState, score]);

  const handleCellClick = (cellId: number) => {
    if (gameState !== "input") return;

    const expected = sequence[playerIndex];
    if (cellId === expected) {
      // Correct
      setCells(prev => prev.map(c => c.id === cellId ? { ...c, correct: true } : c));
      const pts = (100 + level * 50) * (playerIndex + 1);
      const newScore = score + pts;
      setScore(newScore);

      if (playerIndex + 1 >= sequence.length) {
        // Level complete
        if (timerRef.current) clearInterval(timerRef.current);
        const newBreaches = breaches + 1;
        setBreaches(newBreaches);
        setFeedback(`BREACH ${newBreaches} COMPLETE`);
        setGameState("success");
        setTimeout(() => {
          startLevel(level + 1, newScore);
        }, 1500);
      } else {
        setPlayerIndex(playerIndex + 1);
      }
    } else {
      // Wrong
      setCells(prev => prev.map(c => c.id === cellId ? { ...c, wrong: true } : c));
      setTimeout(() => {
        setCells(prev => prev.map(c => c.id === cellId ? { ...c, wrong: false } : c));
      }, 400);
      setGameState("gameover");
      setFeedback("WRONG NODE — INTRUSION DETECTED");
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const getTimerColor = () => {
    if (timeLeft <= 3) return "#ff0040";
    if (timeLeft <= 6) return "#f97316";
    return "#00e5ff";
  };

  const maxTime = Math.max(5, 15 - level);
  const timerPct = maxTime > 0 ? (timeLeft / maxTime) * 100 : 0;

  return (
    <div className="relative w-full h-full">
      <div
        className="relative w-full h-full overflow-hidden select-none"
        style={{
          background: "rgba(0,2,10,0.98)",
          border: `1px solid ${gameState === "input" ? "rgba(0,229,255,0.28)" : gameState === "gameover" ? "rgba(255,0,64,0.28)" : gameState === "success" ? "rgba(74,222,128,0.35)" : "rgba(255,255,255,0.07)"}`,
          boxShadow: gameState === "input"
            ? "0 0 60px rgba(0,229,255,0.05), inset 0 0 120px rgba(0,0,0,0.9)"
            : gameState === "success"
            ? "0 0 80px rgba(74,222,128,0.08), inset 0 0 120px rgba(0,0,0,0.85)"
            : "none",
          transition: "border-color 0.4s, box-shadow 0.4s",
        }}
      >
        {/* Grid bg with hex dots */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,229,255,0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,229,255,0.02) 1px, transparent 1px),
              radial-gradient(circle, rgba(0,229,255,0.04) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px, 48px 48px, 24px 24px",
          }} />

        {/* Data stream vertical lines */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity: 0.03 }}>
          {[12, 28, 44, 60, 76, 92].map(pct => (
            <div key={pct} className="absolute top-0 h-full" style={{
              left: `${pct}%`,
              width: "1px",
              background: "linear-gradient(180deg, transparent 0%, #00e5ff 20%, transparent 40%, #c084fc 60%, transparent 80%, #00e5ff 100%)",
              animation: "cyberStaticNoise 8s linear infinite",
            }} />
          ))}
        </div>

        {/* Corner brackets with inner marks + glow */}
        {[
          { pos: "top-3 left-3", border: "border-l-2 border-t-2", innerX: "left-1", innerY: "top-1" },
          { pos: "top-3 right-3", border: "border-r-2 border-t-2", innerX: "right-1", innerY: "top-1" },
          { pos: "bottom-3 left-3", border: "border-l-2 border-b-2", innerX: "left-1", innerY: "bottom-1" },
          { pos: "bottom-3 right-3", border: "border-r-2 border-b-2", innerX: "right-1", innerY: "bottom-1" },
        ].map((c, i) => (
          <span key={i} className={`absolute ${c.pos} w-6 h-6 ${c.border} pointer-events-none z-10`}
            style={{
              borderColor: "rgba(0,229,255,0.35)",
              filter: "drop-shadow(0 0 3px rgba(0,229,255,0.3))",
            }}>
            <span className={`absolute ${c.innerX} ${c.innerY} w-1.5 h-1.5`}
              style={{ background: "rgba(0,229,255,0.2)" }} />
          </span>
        ))}

        {/* HUD: Timer bar + system readouts */}
        {gameState === "input" && (
          <div className="absolute bottom-4 left-4 right-4 z-20">
            {/* Timer bar */}
            <div className="relative h-2 mb-2"
              style={{
                background: "rgba(255,255,255,0.04)",
                clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                border: `1px solid ${getTimerColor()}22`,
              }}>
              <div className="absolute inset-0 h-full transition-all duration-1000 ease-linear"
                style={{
                  width: `${timerPct}%`,
                  background: `linear-gradient(90deg, ${getTimerColor()}88, ${getTimerColor()})`,
                  boxShadow: `0 0 12px ${getTimerColor()}66, 0 0 24px ${getTimerColor()}33`,
                  clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                  animation: timeLeft <= 3 ? "cyberFlicker 0.5s infinite" : "none",
                }} />
            </div>
            {/* HUD readout row */}
            <div className="flex items-center justify-between font-mono text-[10px] tracking-widest"
              style={{ color: "rgba(0,229,255,0.5)" }}>
              <span style={{ animation: "cyberFlicker 4s infinite" }}>{">_"} SEC.LEVEL: {level}</span>
              <span style={{
                color: getTimerColor(),
                textShadow: `0 0 8px ${getTimerColor()}55`,
                fontFamily: "Orbitron, monospace",
                fontSize: "13px",
                fontWeight: 900,
                animation: timeLeft <= 3 ? "cyberNeonPulse 0.6s infinite" : "none",
              }}>
                {timeLeft}s
              </span>
              <span style={{ animation: "cyberFlicker 5s infinite", animationDelay: "1s" }}>BREACH.STATUS: {breaches}</span>
            </div>
          </div>
        )}

        {/* Feedback bar */}
        {gameState !== "idle" && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20"
            style={{
              clipPath: "polygon(12px 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 12px 100%, 0 50%)",
            }}>
            {/* Scan line inside */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity: 0.06 }}>
              <div className="absolute w-full h-[2px]"
                style={{
                  background: gameState === "gameover" ? "#ff0040" : gameState === "success" ? "#4ade80" : "#00e5ff",
                  animation: "cyberSlideUp 2s linear infinite",
                  top: 0,
                }} />
            </div>
            <div className="relative font-mono text-xs tracking-[0.2em] px-8 py-2"
              style={{
                color: gameState === "gameover" ? "#ff0040" : gameState === "success" ? "#4ade80" : "#00e5ff",
                background: gameState === "gameover"
                  ? "rgba(255,0,64,0.08)"
                  : gameState === "success"
                  ? "rgba(74,222,128,0.08)"
                  : "rgba(0,229,255,0.06)",
                border: `1.5px solid ${
                  gameState === "gameover" ? "rgba(255,0,64,0.35)" : gameState === "success" ? "rgba(74,222,128,0.35)" : "rgba(0,229,255,0.25)"
                }`,
                boxShadow: `0 0 20px ${
                  gameState === "gameover" ? "rgba(255,0,64,0.1)" : gameState === "success" ? "rgba(74,222,128,0.12)" : "rgba(0,229,255,0.08)"
                }, inset 0 0 30px rgba(0,0,0,0.5)`,
                clipPath: "polygon(12px 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 12px 100%, 0 50%)",
                fontFamily: "Geist Mono, monospace",
                textShadow: `0 0 10px currentColor`,
              }}>
              {/* Corner marks */}
              <span className="absolute top-0 left-2 w-2 h-[1px]"
                style={{ background: gameState === "gameover" ? "#ff0040" : gameState === "success" ? "#4ade80" : "#00e5ff" }} />
              <span className="absolute bottom-0 right-2 w-2 h-[1px]"
                style={{ background: gameState === "gameover" ? "#ff0040" : gameState === "success" ? "#4ade80" : "#00e5ff" }} />
              {feedback}
            </div>
          </div>
        )}

        {/* Sequence progress with connecting lines */}
        {(gameState === "input" || gameState === "showing") && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-0">
            {sequence.map((_, i) => {
              const filled = i < playerIndex;
              const isCurrent = i === playerIndex && gameState === "input";
              const isShowingDot = gameState === "showing" && i <= sequence.indexOf(showingIndex);
              return (
                <div key={i} className="flex items-center">
                  <div className="relative w-3.5 h-3.5 transition-all duration-200"
                    style={{
                      border: `1.5px solid ${filled ? "rgba(74,222,128,0.7)" : isCurrent ? "rgba(0,229,255,0.9)" : "rgba(255,255,255,0.12)"}`,
                      background: filled ? "rgba(74,222,128,0.35)" : isShowingDot ? "rgba(0,229,255,0.3)" : "transparent",
                      clipPath: "polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)",
                      boxShadow: filled
                        ? "0 0 8px rgba(74,222,128,0.3)"
                        : isCurrent
                        ? "0 0 12px rgba(0,229,255,0.4)"
                        : "none",
                      animation: isCurrent ? "cyberNeonPulse 1.2s infinite" : "none",
                    }}>
                    {filled && <span className="absolute inset-0 flex items-center justify-center text-[7px] text-green-400/80"
                      style={{ fontFamily: "Geist Mono, monospace" }}>{"✓"}</span>}
                  </div>
                  {/* Connecting line between dots */}
                  {i < sequence.length - 1 && (
                    <div className="w-3 h-[1px]" style={{
                      background: filled
                        ? "rgba(74,222,128,0.4)"
                        : "rgba(255,255,255,0.06)",
                      boxShadow: filled ? "0 0 4px rgba(74,222,128,0.2)" : "none",
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Game grid */}
        {gameState !== "idle" && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="grid grid-cols-4 gap-3 p-4" style={{ maxWidth: 380 }}>
              {cells.map(cell => {
                const isShowing = showingIndex === cell.id;
                const isInSequence = gameState === "showing" && sequence.includes(cell.id) && showingIndex === cell.id;
                const canClick = gameState === "input" && !cell.correct;
                const nodeId = `N.${String(cell.id + 1).padStart(2, "0")}`;

                return (
                  <button
                    key={cell.id}
                    onClick={() => handleCellClick(cell.id)}
                    disabled={!canClick}
                    className="relative w-14 h-14 sm:w-[72px] sm:h-[72px] md:w-20 md:h-20 flex items-center justify-center font-mono text-lg sm:text-2xl transition-all duration-200"
                    style={{
                      background: cell.correct
                        ? "rgba(74,222,128,0.15)"
                        : cell.wrong
                        ? "rgba(255,0,64,0.2)"
                        : isShowing
                        ? "rgba(0,229,255,0.15)"
                        : "rgba(255,255,255,0.02)",
                      border: `1.5px solid ${
                        cell.correct
                          ? "rgba(74,222,128,0.5)"
                          : cell.wrong
                          ? "rgba(255,0,64,0.5)"
                          : isShowing
                          ? "rgba(0,229,255,0.6)"
                          : "rgba(255,255,255,0.08)"
                      }`,
                      color: cell.correct
                        ? "#4ade80"
                        : cell.wrong
                        ? "#ff0040"
                        : isShowing
                        ? "#00e5ff"
                        : "rgba(255,255,255,0.25)",
                      boxShadow: cell.correct
                        ? "0 0 20px rgba(74,222,128,0.2), inset 0 0 15px rgba(74,222,128,0.05)"
                        : cell.wrong
                        ? "0 0 20px rgba(255,0,64,0.3)"
                        : isShowing
                        ? "0 0 25px rgba(0,229,255,0.25), inset 0 0 20px rgba(0,229,255,0.05)"
                        : "none",
                      clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                      cursor: canClick ? "pointer" : "default",
                      transform: isShowing
                        ? "scale(1.08) skewX(-1deg)"
                        : cell.wrong
                        ? "scale(0.95) skewX(2deg)"
                        : cell.correct
                        ? "scale(1.02)"
                        : "scale(1)",
                      animation: cell.correct
                        ? "cyberNeonPulse 2s infinite"
                        : cell.wrong
                        ? "cyberGlitchIn 0.3s ease-out"
                        : "none",
                      fontFamily: "Space Grotesk, monospace",
                    }}
                  >
                    {/* Circuit trace pattern on card back (when not showing/matched) */}
                    {!cell.correct && !isShowing && (
                      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity: 0.06 }}>
                        {/* Horizontal trace */}
                        <div className="absolute" style={{
                          top: "30%", left: "15%", width: "35%", height: "1px",
                          background: "#00e5ff",
                        }} />
                        {/* Vertical trace */}
                        <div className="absolute" style={{
                          top: "30%", left: "50%", width: "1px", height: "40%",
                          background: "#00e5ff",
                        }} />
                        {/* Dot node */}
                        <div className="absolute" style={{
                          top: "28%", left: "13%", width: "3px", height: "3px",
                          background: "#00e5ff", borderRadius: "50%",
                        }} />
                        {/* Another trace */}
                        <div className="absolute" style={{
                          top: "70%", left: "50%", width: "30%", height: "1px",
                          background: "#c084fc",
                        }} />
                        <div className="absolute" style={{
                          top: "68%", right: "18%", width: "3px", height: "3px",
                          background: "#c084fc", borderRadius: "50%",
                        }} />
                      </div>
                    )}
                    {/* Symbol */}
                    <span className="relative z-10" style={{
                      textShadow: cell.correct
                        ? "0 0 12px #4ade80, 0 0 24px rgba(74,222,128,0.3)"
                        : isShowing
                        ? "0 0 12px #00e5ff, 0 0 24px rgba(0,229,255,0.3)"
                        : "none",
                    }}>
                      {cell.symbol}
                    </span>
                    {/* Node ID label */}
                    <span className="absolute bottom-0.5 right-1 text-[6px] tracking-wider pointer-events-none z-10"
                      style={{
                        color: cell.correct ? "rgba(74,222,128,0.4)" : isShowing ? "rgba(0,229,255,0.4)" : "rgba(255,255,255,0.08)",
                        fontFamily: "Geist Mono, monospace",
                      }}>
                      {nodeId}
                    </span>
                    {/* Ping ring on sequence reveal */}
                    {isInSequence && (
                      <span className="absolute inset-0 border-2 border-cyan-400 pointer-events-none"
                        style={{
                          clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                          animation: "tPing 0.6s ease-out",
                        }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Success flash overlay */}
        {gameState === "success" && (
          <div className="absolute inset-0 pointer-events-none z-25"
            style={{
              background: "radial-gradient(ellipse at center, rgba(74,222,128,0.06) 0%, transparent 70%)",
              animation: "cyberFlicker 0.8s ease-out",
            }} />
        )}

        {/* Idle overlay */}
        {gameState === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-30"
            style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(8px)" }}>
            <div className="relative px-8 max-w-md w-full"
              style={{
                clipPath: "polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))",
              }}>
              {/* Angular panel background */}
              <div className="absolute inset-0"
                style={{
                  background: "rgba(0,4,15,0.92)",
                  border: "1px solid rgba(0,229,255,0.12)",
                  clipPath: "polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))",
                }} />

              {/* Scan line */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity: 0.04 }}>
                <div className="absolute w-full h-[1px]"
                  style={{
                    background: "linear-gradient(90deg, transparent, #00e5ff, transparent)",
                    animation: "cyberHologram 3s linear infinite",
                    top: "30%",
                  }} />
              </div>

              {/* Neon corner edges (L-shaped) */}
              <span className="absolute top-0 left-0 w-8 h-[2px] pointer-events-none" style={{ background: "#00e5ff", boxShadow: "0 0 8px rgba(0,229,255,0.5)" }} />
              <span className="absolute top-0 left-0 w-[2px] h-8 pointer-events-none" style={{ background: "#00e5ff", boxShadow: "0 0 8px rgba(0,229,255,0.5)" }} />
              <span className="absolute top-0 right-0 w-8 h-[2px] pointer-events-none" style={{ background: "#c084fc", boxShadow: "0 0 8px rgba(192,132,252,0.5)" }} />
              <span className="absolute bottom-0 left-0 w-8 h-[2px] pointer-events-none" style={{ background: "#c084fc", boxShadow: "0 0 8px rgba(192,132,252,0.5)" }} />
              <span className="absolute bottom-0 right-0 w-[2px] h-8 pointer-events-none" style={{ background: "#00e5ff", boxShadow: "0 0 8px rgba(0,229,255,0.5)" }} />
              <span className="absolute bottom-0 right-0 w-8 h-[2px] pointer-events-none" style={{ background: "#00e5ff", boxShadow: "0 0 8px rgba(0,229,255,0.5)" }} />

              {/* Circuit decoration lines */}
              <div className="absolute top-12 left-3 w-[1px] h-8 pointer-events-none" style={{ background: "rgba(0,229,255,0.08)" }} />
              <div className="absolute top-20 left-3 w-4 h-[1px] pointer-events-none" style={{ background: "rgba(0,229,255,0.08)" }} />
              <div className="absolute bottom-16 right-3 w-[1px] h-6 pointer-events-none" style={{ background: "rgba(192,132,252,0.08)" }} />
              <div className="absolute bottom-16 right-3 w-3 h-[1px] pointer-events-none" style={{ background: "rgba(192,132,252,0.08)" }} />

              <div className="relative text-center py-10">
                {/* Flickering system indicator */}
                <div className="flex items-center justify-center gap-2 mb-4"
                  style={{ animation: "cyberFlicker 4s infinite" }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#4ade80", boxShadow: "0 0 6px #4ade80" }} />
                  <span className="font-mono text-[10px] uppercase tracking-[0.4em]"
                    style={{ color: "rgba(74,222,128,0.6)", fontFamily: "Geist Mono, monospace" }}>
                    SYS.ONLINE
                  </span>
                </div>

                {/* System readout */}
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] mb-4"
                  style={{
                    color: "rgba(0,229,255,0.5)",
                    fontFamily: "Geist Mono, monospace",
                    animation: "cyberFlicker 6s infinite",
                    animationDelay: "0.5s",
                  }}>
                  {">_"} System Breach Protocol v2.7
                </p>

                {/* Ghost/echo text behind title */}
                <div className="relative mb-5">
                  <h3 className="absolute inset-0 flex items-center justify-center text-3xl md:text-4xl font-black font-mono tracking-wider pointer-events-none"
                    style={{
                      color: "rgba(0,229,255,0.04)",
                      transform: "translateX(3px) translateY(-2px) skewX(-2deg)",
                      fontFamily: "Orbitron, monospace",
                    }}>
                    CYBER HACK
                  </h3>
                  <h3 className="absolute inset-0 flex items-center justify-center text-3xl md:text-4xl font-black font-mono tracking-wider pointer-events-none"
                    style={{
                      color: "rgba(192,132,252,0.04)",
                      transform: "translateX(-2px) translateY(2px) skewX(1deg)",
                      fontFamily: "Orbitron, monospace",
                    }}>
                    CYBER HACK
                  </h3>
                  <h3 className="relative text-3xl md:text-4xl font-black text-white tracking-wider"
                    style={{
                      fontFamily: "Orbitron, monospace",
                      animation: "cyberGlitchText 4s infinite",
                      textShadow: "0 0 20px rgba(0,229,255,0.3), 0 0 40px rgba(0,229,255,0.1)",
                    }}>
                    CYBER HACK
                  </h3>
                </div>

                {/* Terminal-style instructions */}
                <div className="text-left mx-auto mb-4" style={{ maxWidth: "280px" }}>
                  <p className="font-mono text-sm leading-8"
                    style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Geist Mono, monospace" }}>
                    <span style={{ color: "rgba(0,229,255,0.6)" }}>{">_"}</span> Memorize the highlighted sequence<br />
                    <span style={{ color: "rgba(0,229,255,0.6)" }}>{">_"}</span> Repeat before firewall timeout<br />
                    <span style={{ color: "rgba(0,229,255,0.6)" }}>{">_"}</span> Sequences grow each level
                  </p>
                </div>

                {/* Info row with flicker */}
                <div className="flex items-center justify-center gap-5 mb-3 font-mono text-xs">
                  <span style={{ color: "#00e5ff", animation: "cyberFlicker 5s infinite", fontFamily: "Geist Mono, monospace" }}>Watch the pattern</span>
                  <span style={{ color: "#4ade80", animation: "cyberFlicker 5s infinite", animationDelay: "1s", fontFamily: "Geist Mono, monospace" }}>Click in order</span>
                  <span style={{ color: "#f97316", animation: "cyberFlicker 5s infinite", animationDelay: "2s", fontFamily: "Geist Mono, monospace" }}>Beat the timer</span>
                </div>

                {/* Flickering status */}
                <div className="flex items-center justify-center gap-3 mb-8">
                  <span className="w-1 h-1 rounded-full" style={{ background: "#00e5ff", animation: "cyberFlicker 3s infinite" }} />
                  <span className="font-mono text-[9px] tracking-[0.3em]"
                    style={{ color: "rgba(255,255,255,0.15)", fontFamily: "Geist Mono, monospace" }}>
                    READY
                  </span>
                  <span className="w-1 h-1 rounded-full" style={{ background: "#c084fc", animation: "cyberFlicker 3s infinite", animationDelay: "1.5s" }} />
                </div>

                <button
                  onClick={startGame}
                  className="font-mono font-black text-sm uppercase tracking-widest px-12 py-4 transition-all duration-300 cursor-pointer"
                  style={{
                    background: "rgba(74,222,128,0.07)",
                    border: "2px solid rgba(74,222,128,0.45)",
                    color: "#4ade80",
                    clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
                    fontFamily: "Orbitron, monospace",
                    textShadow: "0 0 12px rgba(74,222,128,0.4)",
                    boxShadow: "0 0 20px rgba(74,222,128,0.08), inset 0 0 30px rgba(74,222,128,0.03)",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(74,222,128,0.18)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 30px rgba(74,222,128,0.15), inset 0 0 30px rgba(74,222,128,0.05)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(74,222,128,0.07)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 20px rgba(74,222,128,0.08), inset 0 0 30px rgba(74,222,128,0.03)";
                  }}>
                  INITIATE BREACH
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Game over overlay */}
        {gameState === "gameover" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-30"
            style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}>
            <div className="relative px-8 max-w-sm w-full"
              style={{
                clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))",
              }}>
              {/* Angular panel bg */}
              <div className="absolute inset-0"
                style={{
                  background: "rgba(10,0,2,0.95)",
                  border: "1px solid rgba(255,0,64,0.15)",
                  clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))",
                }} />

              {/* Scan line */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity: 0.04 }}>
                <div className="absolute w-full h-[1px]"
                  style={{
                    background: "linear-gradient(90deg, transparent, #ff0040, transparent)",
                    animation: "cyberHologram 2s linear infinite",
                    top: "40%",
                  }} />
              </div>

              {/* Neon edges */}
              <span className="absolute top-0 left-0 w-6 h-[2px] pointer-events-none" style={{ background: "#ff0040", boxShadow: "0 0 8px rgba(255,0,64,0.5)" }} />
              <span className="absolute top-0 left-0 w-[2px] h-6 pointer-events-none" style={{ background: "#ff0040", boxShadow: "0 0 8px rgba(255,0,64,0.5)" }} />
              <span className="absolute top-0 right-6 w-6 h-[2px] pointer-events-none" style={{ background: "#ff0040", boxShadow: "0 0 6px rgba(255,0,64,0.4)" }} />
              <span className="absolute bottom-0 left-6 w-6 h-[2px] pointer-events-none" style={{ background: "#ff0040", boxShadow: "0 0 6px rgba(255,0,64,0.4)" }} />
              <span className="absolute bottom-0 right-0 w-[2px] h-6 pointer-events-none" style={{ background: "#ff0040", boxShadow: "0 0 8px rgba(255,0,64,0.5)" }} />
              <span className="absolute bottom-0 right-0 w-6 h-[2px] pointer-events-none" style={{ background: "#ff0040", boxShadow: "0 0 8px rgba(255,0,64,0.5)" }} />

              {/* Circuit decorations */}
              <div className="absolute top-8 right-4 w-[1px] h-5 pointer-events-none" style={{ background: "rgba(255,0,64,0.1)" }} />
              <div className="absolute top-12 right-4 w-3 h-[1px] pointer-events-none" style={{ background: "rgba(255,0,64,0.1)" }} />

              <div className="relative text-center py-8">
                {/* Flickering error indicator */}
                <div className="flex items-center justify-center gap-2 mb-3"
                  style={{ animation: "cyberFlicker 2s infinite" }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#ff0040", boxShadow: "0 0 6px #ff0040" }} />
                  <span className="font-mono text-[9px] uppercase tracking-[0.4em]"
                    style={{ color: "rgba(255,0,64,0.7)", fontFamily: "Geist Mono, monospace" }}>
                    INTRUSION DETECTED
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#ff0040", boxShadow: "0 0 6px #ff0040" }} />
                </div>

                {/* Subtitle */}
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] mb-2"
                  style={{
                    color: "rgba(255,0,64,0.5)",
                    fontFamily: "Geist Mono, monospace",
                    animation: "cyberGlitchText 6s infinite",
                  }}>
                  [ FIREWALL ACTIVATED ]
                </p>

                {/* Ghost text */}
                <div className="relative mb-5">
                  <h3 className="absolute inset-0 flex items-center justify-center text-3xl font-black font-mono tracking-wider pointer-events-none"
                    style={{
                      color: "rgba(255,0,64,0.05)",
                      transform: "translateX(2px) translateY(-1px) skewX(-3deg)",
                      fontFamily: "Orbitron, monospace",
                    }}>
                    LOCKED OUT
                  </h3>
                  <h3 className="relative text-3xl font-black text-white tracking-wider"
                    style={{
                      fontFamily: "Orbitron, monospace",
                      animation: "cyberGlitchText 3s infinite",
                      textShadow: "0 0 20px rgba(255,0,64,0.3), 0 0 40px rgba(255,0,64,0.1)",
                    }}>
                    LOCKED OUT
                  </h3>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 gap-3 mb-6 font-mono text-left">
                  {[
                    { label: "Score", val: score.toLocaleString(), color: "#00e5ff" },
                    { label: "Breaches", val: breaches.toString(), color: "#4ade80" },
                    { label: "Level", val: level.toString(), color: "#c084fc" },
                    { label: "High Score", val: highScore.toLocaleString(), color: "#f97316" },
                  ].map(({ label, val, color }) => (
                    <div key={label} className="relative p-4"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: `1px solid ${color}18`,
                        clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                        boxShadow: `inset 0 0 20px ${color}05`,
                      }}>
                      {/* Top-right neon mark */}
                      <span className="absolute top-0 right-2 w-2 h-[1px] pointer-events-none" style={{ background: `${color}33` }} />
                      <div className="text-[10px] uppercase tracking-widest mb-1"
                        style={{ color: "rgba(255,255,255,0.25)", fontFamily: "Geist Mono, monospace" }}>
                        {">_"} {label}
                      </div>
                      <div className="font-black text-xl" style={{
                        color,
                        textShadow: `0 0 14px ${color}55, 0 0 28px ${color}22`,
                        fontFamily: "Orbitron, monospace",
                      }}>
                        {val}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Retry button */}
                <button
                  onClick={startGame}
                  className="w-full font-mono font-black text-sm uppercase tracking-widest py-4 transition-all duration-300 cursor-pointer"
                  style={{
                    background: "rgba(74,222,128,0.07)",
                    border: "2px solid rgba(74,222,128,0.35)",
                    color: "#4ade80",
                    clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
                    fontFamily: "Orbitron, monospace",
                    textShadow: "0 0 10px rgba(74,222,128,0.3)",
                    boxShadow: "0 0 16px rgba(74,222,128,0.06)",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(74,222,128,0.18)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 24px rgba(74,222,128,0.12)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(74,222,128,0.07)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 16px rgba(74,222,128,0.06)";
                  }}>
                  {"↺"} RETRY BREACH
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
