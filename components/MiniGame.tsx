"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import NeonRunner from "./NeonRunner";
import CyberHack from "./CyberHack";

/* ═══════════════════════════════════════
   TARGET HUNT GAME
   ═══════════════════════════════════════ */
type TargetType = "small" | "medium" | "large";
interface Target { id: number; x: number; y: number; size: number; points: number; type: TargetType; color: string; spawnTime: number; lifespan: number }
interface HitFX  { id: number; x: number; y: number; points: number; color: string }
type TGS = "idle" | "playing" | "gameover";
const CFG: Record<TargetType, { size: number; points: number; lifespan: number; color: string }> = {
  small: { size: 36, points: 150, lifespan: 2200, color: "#00e5ff" },
  medium: { size: 58, points: 60, lifespan: 3800, color: "#c084fc" },
  large: { size: 86, points: 20, lifespan: 6000, color: "#f97316" },
};

function TargetHunt() {
  const [gs, setGs] = useState<TGS>("idle");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [targets, setTargets] = useState<Target[]>([]);
  const [hitFX, setHitFX] = useState<HitFX[]>([]);
  const [shots, setShots] = useState(0);
  const [hits, setHits] = useState(0);
  const [combo, setCombo] = useState(1);
  const [highScore, setHighScore] = useState(0);
  useEffect(() => { const s = localStorage.getItem("hakArenaHighScore"); if (s) setHighScore(parseInt(s, 10)); }, []);
  const comboRef = useRef(1), scoreRef = useRef(0), lastHitRef = useRef(0), gameRef = useRef<HTMLDivElement>(null);
  const start = useCallback(() => { comboRef.current=1;scoreRef.current=0;lastHitRef.current=0;setCombo(1);setScore(0);setTimeLeft(30);setTargets([]);setHitFX([]);setShots(0);setHits(0);setGs("playing"); }, []);
  useEffect(() => {
    if (gs !== "playing") return;
    const timer = setInterval(() => { setTimeLeft(p => { if(p<=1){setHighScore(h=>{const n=Math.max(h,scoreRef.current);if(n>h)localStorage.setItem("hakArenaHighScore",String(n));return n;});setGs("gameover");setTargets([]);return 0;}return p-1;}); }, 1000);
    const spawner = setInterval(() => { setTargets(p => { if(p.length>=7)return p;const r=Math.random();const t:TargetType=r<.52?"small":r<.82?"medium":"large";return[...p,{id:Date.now()+Math.random(),x:6+Math.random()*82,y:10+Math.random()*72,type:t,spawnTime:Date.now(),...CFG[t]}];}); }, 680);
    const expirer = setInterval(() => { const n=Date.now();setTargets(p=>p.filter(t=>n-t.spawnTime<t.lifespan)); }, 120);
    return () => { clearInterval(timer);clearInterval(spawner);clearInterval(expirer); };
  }, [gs]);
  const hitTarget = (target: Target, e: React.MouseEvent) => {
    e.stopPropagation();if(gs!=="playing")return;
    const now=Date.now();comboRef.current=now-lastHitRef.current<1200?Math.min(comboRef.current+1,8):1;lastHitRef.current=now;setCombo(comboRef.current);
    const pts=target.points*comboRef.current;scoreRef.current+=pts;setScore(scoreRef.current);setHits(h=>h+1);setShots(s=>s+1);setTargets(p=>p.filter(t=>t.id!==target.id));
    if(gameRef.current){const rect=gameRef.current.getBoundingClientRect();const fxId=Date.now()+Math.random();setHitFX(p=>[...p,{id:fxId,x:e.clientX-rect.left,y:e.clientY-rect.top,points:pts,color:target.color}]);setTimeout(()=>setHitFX(p=>p.filter(f=>f.id!==fxId)),950);}
  };
  const miss = () => { if(gs!=="playing")return;comboRef.current=1;setCombo(1);setShots(s=>s+1); };
  const acc = shots>0?Math.round((hits/shots)*100):100;

  return (
    <div ref={gameRef} className="relative w-full h-full overflow-hidden select-none" style={{cursor:gs==="playing"?"none":"default"}} onClick={miss}>
      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{backgroundImage:"linear-gradient(rgba(0,229,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,0.02) 1px,transparent 1px)",backgroundSize:"50px 50px"}} />
      {/* Scanline */}
      {gs==="playing"&&<div className="absolute left-0 right-0 h-px pointer-events-none z-5" style={{background:"linear-gradient(to right,transparent,rgba(0,229,255,0.1) 50%,transparent)",animation:"gameScan 5s linear infinite"}} />}
      {/* Time bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 z-20 pointer-events-none" style={{background:"rgba(255,255,255,0.03)"}}>
        {gs==="playing"&&<div className="h-full transition-all duration-1000 ease-linear" style={{width:`${(timeLeft/30)*100}%`,background:timeLeft<=5?"#f97316":timeLeft<=10?"#facc15":"#00e5ff",boxShadow:`0 0 10px ${timeLeft<=5?"rgba(249,115,22,0.8)":"rgba(0,229,255,0.6)"}`}} />}
      </div>
      {/* Timer */}
      {gs==="playing"&&<div className="absolute top-4 left-1/2 -translate-x-1/2 font-mono text-sm z-20 pointer-events-none tracking-widest font-black" style={{color:timeLeft<=10?"#f97316":"rgba(0,229,255,0.5)"}}>{String(timeLeft).padStart(2,"0")}s</div>}
      {/* Score + combo */}
      {gs==="playing"&&<div className="absolute top-4 left-5 z-20 pointer-events-none font-mono text-[11px]"><span className="text-zinc-600">SCORE </span><span className="text-cyan-400 font-black text-lg">{score.toLocaleString()}</span>{combo>1&&<span className="ml-3 font-black text-orange-400" style={{animation:"comboGlow .4s ease-in-out infinite"}}>x{combo}</span>}</div>}
      {/* Accuracy */}
      {gs==="playing"&&<div className="absolute top-4 right-5 z-20 pointer-events-none font-mono text-[11px]"><span className="text-zinc-600">ACC </span><span className="text-purple-400">{acc}%</span><span className="text-zinc-700 mx-2">.</span><span className="text-zinc-600">HITS </span><span className="text-green-400">{hits}</span></div>}
      {/* Targets */}
      {targets.map(target=>{const sp=target.type==="small"?1.8:target.type==="medium"?3:5;return(
        <div key={target.id} style={{position:"absolute",left:`${target.x}%`,top:`${target.y}%`,width:target.size,height:target.size,animation:"tAppear .3s cubic-bezier(.34,1.56,.64,1) forwards",zIndex:15,pointerEvents:gs==="playing"?"auto":"none",cursor:"none"}} onClick={e=>hitTarget(target,e)}>
          <div style={{position:"absolute",inset:0,borderRadius:"50%",border:`2px solid ${target.color}`,animation:"tPing 1.1s ease-out infinite"}} /><div style={{position:"absolute",inset:-5,borderRadius:"50%",border:"1.5px dashed transparent",borderTopColor:`${target.color}65`,borderRightColor:`${target.color}65`,animation:`tSpin ${sp}s linear infinite`}} /><div style={{position:"absolute",inset:0,borderRadius:"50%",border:`2px solid ${target.color}`,boxShadow:`0 0 14px ${target.color}55, inset 0 0 10px ${target.color}12`,background:`radial-gradient(circle,${target.color}07 0%,transparent 70%)`}} /><div style={{position:"absolute",inset:"23%",borderRadius:"50%",border:`1px solid ${target.color}40`}} /><div style={{position:"absolute",top:"50%",left:"10%",right:"10%",height:1,background:`${target.color}25`,transform:"translateY(-50%)"}} /><div style={{position:"absolute",left:"50%",top:"10%",bottom:"10%",width:1,background:`${target.color}25`,transform:"translateX(-50%)"}} /><div style={{position:"absolute",top:"50%",left:"50%",width:7,height:7,borderRadius:"50%",background:target.color,boxShadow:`0 0 12px ${target.color}`,transform:"translate(-50%,-50%)"}} />
          <div style={{position:"absolute",top:"108%",left:"50%",transform:"translateX(-50%)",color:target.color,fontSize:9,fontFamily:"monospace",whiteSpace:"nowrap",opacity:.6}}>{target.points}pts</div>
        </div>);})}
      {/* Hit effects */}
      {hitFX.map(fx=>(<div key={fx.id} style={{position:"absolute",left:fx.x,top:fx.y,pointerEvents:"none",zIndex:40}}><div style={{position:"absolute",width:46,height:46,border:`2.5px solid ${fx.color}`,borderRadius:"50%",boxShadow:`0 0 12px ${fx.color}`,animation:"hitRing .55s ease-out forwards"}} /><div style={{position:"absolute",left:"50%",color:fx.color,fontFamily:"monospace",fontWeight:900,fontSize:fx.points>=600?22:fx.points>=200?17:13,whiteSpace:"nowrap",animation:"scoreUp .9s ease-out forwards",textShadow:`0 0 14px ${fx.color}`}}>+{fx.points}</div></div>))}

      {/* ── IDLE SCREEN ── */}
      {gs==="idle"&&(<div className="absolute inset-0 flex flex-col items-center justify-center z-30" style={{background:"rgba(0,0,0,0.82)",backdropFilter:"blur(10px)"}}>
        {/* Scanline overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,229,255,0.015) 2px,rgba(0,229,255,0.015) 4px)",animation:"cyberScanlineGlobal 8s linear infinite"}} />
        {/* Circuit decoration */}
        <div className="absolute top-6 left-6 pointer-events-none" style={{opacity:0.15}}>
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none"><path d="M0 30h20M30 0v20M40 30h20M30 40v20" stroke="#c084fc" strokeWidth="1" strokeDasharray="4 3"><animate attributeName="stroke-dashoffset" from="0" to="-14" dur="2s" repeatCount="indefinite"/></path><circle cx="30" cy="30" r="3" fill="#c084fc" opacity="0.5"/><circle cx="20" cy="30" r="1.5" fill="#c084fc" opacity="0.3"/><circle cx="30" cy="20" r="1.5" fill="#c084fc" opacity="0.3"/></svg>
        </div>
        <div className="absolute bottom-6 right-6 pointer-events-none" style={{opacity:0.15}}>
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none"><path d="M0 30h20M30 0v20M40 30h20M30 40v20" stroke="#c084fc" strokeWidth="1" strokeDasharray="4 3"><animate attributeName="stroke-dashoffset" from="0" to="14" dur="2.5s" repeatCount="indefinite"/></path><circle cx="30" cy="30" r="3" fill="#c084fc" opacity="0.5"/></svg>
        </div>
        <div className="text-center px-6 sm:px-8 max-w-md relative">
          {/* Angular panel background */}
          <div className="absolute -inset-6 sm:-inset-8 pointer-events-none" style={{
            clipPath:"polygon(0 8px, 8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px))",
            border:"1px solid rgba(192,132,252,0.12)",
            background:"rgba(192,132,252,0.02)",
          }}>
            {/* Neon corner marks */}
            <div className="absolute top-0 left-0 w-3 h-3" style={{borderTop:"2px solid #c084fc",borderLeft:"2px solid #c084fc",boxShadow:"0 0 6px rgba(192,132,252,0.4)"}} />
            <div className="absolute top-0 right-0 w-3 h-3" style={{borderTop:"2px solid #c084fc",borderRight:"2px solid #c084fc",boxShadow:"0 0 6px rgba(192,132,252,0.4)"}} />
            <div className="absolute bottom-0 left-0 w-3 h-3" style={{borderBottom:"2px solid #c084fc",borderLeft:"2px solid #c084fc",boxShadow:"0 0 6px rgba(192,132,252,0.4)"}} />
            <div className="absolute bottom-0 right-0 w-3 h-3" style={{borderBottom:"2px solid #c084fc",borderRight:"2px solid #c084fc",boxShadow:"0 0 6px rgba(192,132,252,0.4)"}} />
          </div>

          <div className="text-5xl mb-5" style={{filter:"drop-shadow(0 0 12px rgba(192,132,252,0.4))",animation:"cyberFlicker 4s ease-in-out infinite"}}>🎯</div>
          {/* Glitch title */}
          <div className="relative mb-4">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white font-mono tracking-tight relative z-10" style={{
              textShadow:"0 0 20px rgba(192,132,252,0.5), 0 0 40px rgba(192,132,252,0.2)",
              animation:"cyberGlitchText 4s ease-in-out infinite",
            }}>TARGET HUNT</h3>
            {/* Ghost echo */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
              <span className="text-2xl sm:text-3xl md:text-4xl font-black font-mono tracking-tight" style={{color:"#00e5ff",opacity:0.08,transform:"translate(2px,-2px)"}}>TARGET HUNT</span>
            </div>
          </div>
          {/* Status indicator */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full" style={{background:"#c084fc",boxShadow:"0 0 6px #c084fc",animation:"cyberFlicker 2s ease-in-out infinite"}} />
            <span className="font-mono text-[9px] tracking-[0.25em] uppercase" style={{color:"rgba(192,132,252,0.5)"}}>SYSTEM READY :: AWAITING INPUT</span>
            <div className="w-1.5 h-1.5 rounded-full" style={{background:"#c084fc",boxShadow:"0 0 6px #c084fc",animation:"cyberFlicker 2.5s ease-in-out infinite"}} />
          </div>
          <p className="text-zinc-400 font-mono text-xs sm:text-sm leading-7 mb-4" style={{fontFamily:"'Space Grotesk',monospace"}}>Eliminate all hostiles before they escape.<br/>Your cursor reticle is your weapon.</p>
          <div className="flex items-center justify-center gap-3 sm:gap-5 mb-6 font-mono text-[10px] sm:text-xs">
            <span style={{color:"#00e5ff",textShadow:"0 0 8px rgba(0,229,255,0.3)"}}>&#9670; SM 150pts</span>
            <span style={{color:"#c084fc",textShadow:"0 0 8px rgba(192,132,252,0.3)"}}>&#9670; MD 60pts</span>
            <span style={{color:"#f97316",textShadow:"0 0 8px rgba(249,115,22,0.3)"}}>&#9670; LG 20pts</span>
          </div>
          <button onClick={start} className="font-mono font-black text-xs sm:text-sm uppercase tracking-widest px-8 sm:px-10 py-3 sm:py-3.5 cursor-pointer transition-all duration-300 hover:shadow-[0_0_30px_rgba(192,132,252,0.4)] relative group"
            style={{
              background:"linear-gradient(135deg, rgba(192,132,252,0.1), rgba(0,229,255,0.05))",
              border:"2px solid rgba(192,132,252,0.5)",
              color:"#c084fc",
              clipPath:"polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
              textShadow:"0 0 10px rgba(192,132,252,0.4)",
            }}>
            <span className="relative z-10">INITIATE MISSION</span>
            {/* Corner accent on button */}
            <div className="absolute top-0 right-0 w-3.5 h-3.5 pointer-events-none" style={{borderBottom:"1px solid rgba(192,132,252,0.3)"}} />
          </button>
          {/* Terminal readout */}
          <div className="mt-4 font-mono text-[8px] tracking-widest" style={{color:"rgba(192,132,252,0.2)",animation:"cyberFlicker 5s ease-in-out infinite"}}>
            &#x27E8; SYS.TARGETING :: v2.7.1 :: CALIBRATED &#x27E9;
          </div>
        </div>
      </div>)}

      {/* ── GAMEOVER SCREEN ── */}
      {gs==="gameover"&&(<div className="absolute inset-0 flex flex-col items-center justify-center z-30" style={{background:"rgba(0,0,0,0.85)",backdropFilter:"blur(10px)"}}>
        {/* Scanline overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(192,132,252,0.012) 2px,rgba(192,132,252,0.012) 4px)",animation:"cyberScanlineGlobal 8s linear infinite"}} />
        {/* Circuit deco */}
        <div className="absolute top-4 right-4 pointer-events-none" style={{opacity:0.12}}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><path d="M0 20h15M20 0v15M25 20h15M20 25v15" stroke="#00e5ff" strokeWidth="1" strokeDasharray="3 2"><animate attributeName="stroke-dashoffset" from="0" to="-10" dur="1.5s" repeatCount="indefinite"/></path></svg>
        </div>
        <div className="text-center px-6 sm:px-8 max-w-sm w-full relative">
          {/* Angular panel */}
          <div className="absolute -inset-4 sm:-inset-6 pointer-events-none" style={{
            clipPath:"polygon(0 6px, 6px 0, calc(100% - 6px) 0, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0 calc(100% - 6px))",
            border:"1px solid rgba(192,132,252,0.08)",
            background:"rgba(192,132,252,0.015)",
          }}>
            <div className="absolute top-0 left-0 w-2.5 h-2.5" style={{borderTop:"1.5px solid #c084fc",borderLeft:"1.5px solid #c084fc",boxShadow:"0 0 4px rgba(192,132,252,0.3)"}} />
            <div className="absolute top-0 right-0 w-2.5 h-2.5" style={{borderTop:"1.5px solid #c084fc",borderRight:"1.5px solid #c084fc",boxShadow:"0 0 4px rgba(192,132,252,0.3)"}} />
            <div className="absolute bottom-0 left-0 w-2.5 h-2.5" style={{borderBottom:"1.5px solid #c084fc",borderLeft:"1.5px solid #c084fc",boxShadow:"0 0 4px rgba(192,132,252,0.3)"}} />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5" style={{borderBottom:"1.5px solid #c084fc",borderRight:"1.5px solid #c084fc",boxShadow:"0 0 4px rgba(192,132,252,0.3)"}} />
          </div>

          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-1 h-1 rounded-full" style={{background:"#c084fc",animation:"cyberFlicker 2s ease-in-out infinite"}} />
            <p className="text-purple-400 font-mono text-xs uppercase tracking-[0.3em]" style={{animation:"cyberGlitchText 5s ease-in-out infinite"}}>[ Mission Complete ]</p>
            <div className="w-1 h-1 rounded-full" style={{background:"#c084fc",animation:"cyberFlicker 2.3s ease-in-out infinite"}} />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white mb-6 font-mono relative" style={{textShadow:"0 0 20px rgba(0,229,255,0.3), 0 0 40px rgba(0,229,255,0.1)"}}>
            DEBRIEF
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
              <span className="text-2xl sm:text-3xl font-black font-mono" style={{color:"#c084fc",opacity:0.06,transform:"translate(-2px,2px)"}}>DEBRIEF</span>
            </div>
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-6 font-mono text-left">
            {[{l:"Score",v:score.toLocaleString(),c:"#00e5ff"},{l:"Hits",v:hits.toString(),c:"#c084fc"},{l:"Accuracy",v:`${acc}%`,c:"#4ade80"},{l:"Best",v:highScore.toLocaleString(),c:"#f97316"}].map(s=>(
              <div key={s.l} className="p-2.5 sm:p-3 relative" style={{
                background:"rgba(255,255,255,0.02)",
                clipPath:"polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
                border:"1px solid rgba(255,255,255,0.06)",
              }}>
                <div className="text-zinc-600 text-[9px] sm:text-[10px] uppercase tracking-widest mb-1">{s.l}</div>
                <div className="font-black text-lg sm:text-xl" style={{color:s.c,textShadow:`0 0 12px ${s.c}40`}}>{s.v}</div>
                {/* Tiny corner glow */}
                <div className="absolute top-0 left-0 w-1.5 h-1.5" style={{borderTop:`1px solid ${s.c}40`,borderLeft:`1px solid ${s.c}40`}} />
              </div>
            ))}
          </div>
          <button onClick={start} className="w-full font-mono font-black text-xs sm:text-sm uppercase tracking-widest py-3 sm:py-3.5 cursor-pointer transition-all duration-300 hover:shadow-[0_0_30px_rgba(192,132,252,0.4)] relative"
            style={{
              background:"linear-gradient(135deg, rgba(192,132,252,0.08), rgba(0,229,255,0.04))",
              border:"2px solid rgba(192,132,252,0.4)",
              color:"#c084fc",
              clipPath:"polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
              textShadow:"0 0 10px rgba(192,132,252,0.3)",
            }}>
            &#x21BA; RETRY
          </button>
          {/* System readout */}
          <div className="mt-3 font-mono text-[8px] tracking-widest" style={{color:"rgba(0,229,255,0.15)",animation:"cyberFlicker 4s ease-in-out infinite"}}>
            &#x27E8; ANALYSIS COMPLETE :: UPLOADING &#x27E9;
          </div>
        </div>
      </div>)}
    </div>
  );
}

/* ═══════════════════════════════════════
   PER-GAME THEME DATA
   ═══════════════════════════════════════ */
const GAMES = [
  {
    id: "runner", label: "NEON RUNNER", sub: "Endless Mode", icon: "🏃",
    accent: "#00e5ff", accent2: "#0088aa",
    tagline: "RUN . JUMP . SURVIVE",
    hudLabel: "SPEEDOMETER ONLINE",
    bgGrid: "linear-gradient(rgba(0,229,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,0.025) 1px,transparent 1px)",
    bgGlow: "radial-gradient(ellipse 70% 50% at 50% 80%, rgba(0,229,255,0.08) 0%, transparent 60%)",
    bgGlow2: "radial-gradient(circle at 20% 30%, rgba(0,120,200,0.05) 0%, transparent 50%)",
  },
  {
    id: "hack", label: "CYBER HACK", sub: "Memory Breach", icon: "🔓",
    accent: "#4ade80", accent2: "#166534",
    tagline: "WATCH . MEMORIZE . BREACH",
    hudLabel: "FIREWALL SCANNER",
    bgGrid: "linear-gradient(rgba(74,222,128,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(74,222,128,0.02) 1px,transparent 1px)",
    bgGlow: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(74,222,128,0.06) 0%, transparent 60%)",
    bgGlow2: "radial-gradient(circle at 80% 20%, rgba(34,197,94,0.05) 0%, transparent 50%)",
  },
  {
    id: "target", label: "TARGET HUNT", sub: "Reflex Training", icon: "🎯",
    accent: "#c084fc", accent2: "#6b21a8",
    tagline: "AIM . FIRE . ELIMINATE",
    hudLabel: "TARGETING SYSTEM",
    bgGrid: "linear-gradient(rgba(192,132,252,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(192,132,252,0.02) 1px,transparent 1px)",
    bgGlow: "radial-gradient(ellipse 65% 55% at 50% 60%, rgba(168,85,247,0.08) 0%, transparent 60%)",
    bgGlow2: "radial-gradient(circle at 70% 70%, rgba(139,92,246,0.05) 0%, transparent 50%)",
  },
];

/* Matrix characters for hack theme */
const MATRIX_CHARS = ["0","1","ア","カ","サ","タ","ナ","ハ","マ","ヤ","ラ","ワ","0","1","A","F","7","Z","$","#"];

/* ═══════════════════════════════════════
   PREMIUM THEMED GAME HUB
   ═══════════════════════════════════════ */
export default function MiniGame() {
  const [activeGame, setActiveGame] = useState("runner");
  const active = GAMES.find(g => g.id === activeGame)!;

  return (
    <section className="relative overflow-hidden py-12 sm:py-20 md:py-28 transition-colors duration-700" style={{ background: "#000" }}>
      <style>{`
        @keyframes tAppear{0%{transform:translate(-50%,-50%) scale(0) rotate(-90deg);opacity:0}65%{transform:translate(-50%,-50%) scale(1.12) rotate(5deg);opacity:1}100%{transform:translate(-50%,-50%) scale(1) rotate(0);opacity:1}}
        @keyframes tPing{0%{transform:scale(1);opacity:.55}100%{transform:scale(1.85);opacity:0}}
        @keyframes tSpin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes hitRing{0%{transform:translate(-50%,-50%) scale(0);opacity:1}100%{transform:translate(-50%,-50%) scale(3.5);opacity:0}}
        @keyframes scoreUp{0%{transform:translate(-50%,-100%) scale(1);opacity:1}100%{transform:translate(-50%,-230%) scale(.8);opacity:0}}
        @keyframes gameScan{from{top:-2px}to{top:100%}}
        @keyframes comboGlow{0%,100%{filter:drop-shadow(0 0 6px currentColor)}50%{filter:drop-shadow(0 0 18px currentColor)}}
        @keyframes titleShimmer{0%{background-position:200% center}100%{background-position:-200% center}}
        @keyframes scanH{0%{left:-20%}100%{left:120%}}
        @keyframes scanV{0%{top:-10%}100%{top:110%}}
        @keyframes matrixDrop{0%{transform:translateY(-100%);opacity:0}10%{opacity:.5}90%{opacity:.3}100%{transform:translateY(100vh);opacity:0}}
        @keyframes speedLine{0%{transform:translateX(100%) scaleX(0)}50%{transform:translateX(0%) scaleX(1)}100%{transform:translateX(-100%) scaleX(0)}}
        @keyframes crosshairPulse{0%,100%{opacity:.2;transform:translate(-50%,-50%) scale(1)}50%{opacity:.5;transform:translate(-50%,-50%) scale(1.1)}}
        @keyframes selectorGlow{0%,100%{box-shadow:0 0 6px var(--g1),inset 0 0 10px var(--g2)}50%{box-shadow:0 0 18px var(--g1),0 0 40px var(--g3),inset 0 0 20px var(--g2)}}
        @keyframes hudBlink{0%,40%,60%,100%{opacity:1}45%,55%{opacity:.3}}
        @keyframes matrixCharFall{0%{transform:translateY(-20px);opacity:0}10%{opacity:0.7}85%{opacity:0.2}100%{transform:translateY(calc(100vh + 20px));opacity:0}}
        @keyframes laserSweep{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
        @keyframes circuitPulse{0%,100%{stroke-dashoffset:0}50%{stroke-dashoffset:-20}}
        @keyframes dataStream{0%{transform:translateY(-100%)}100%{transform:translateY(100%)}}
        @keyframes borderTraceAnim{0%{stroke-dashoffset:200}100%{stroke-dashoffset:0}}
        @keyframes glitchBand{0%,100%{opacity:0}48%{opacity:0}49%{opacity:0.03}51%{opacity:0.03}52%{opacity:0}}
        @keyframes tabScan{0%{left:-30%}100%{left:130%}}
        @keyframes hexPulse{0%,100%{opacity:0.03}50%{opacity:0.06}}
        @keyframes cornerGlow{0%,100%{opacity:0.6}50%{opacity:1}}
        @keyframes speedStreak{0%{transform:translateX(100vw) scaleX(0);opacity:0}20%{opacity:0.6}80%{opacity:0.4}100%{transform:translateX(-100vw) scaleX(1.5);opacity:0}}
        @keyframes perspGrid{0%{transform:perspective(400px) rotateX(45deg) translateY(0)}100%{transform:perspective(400px) rotateX(45deg) translateY(50px)}}
        @keyframes scanBeam{0%{transform:rotate(0deg) scaleX(1)}50%{transform:rotate(180deg) scaleX(0.8)}100%{transform:rotate(360deg) scaleX(1)}}
        @keyframes nodeGlow{0%,100%{r:2;opacity:0.3}50%{r:3.5;opacity:0.7}}
      `}</style>

      {/* ── CYBERPUNK SECTION BG — Circuit grid + scanlines + data streams + hex dots + glitch band ── */}
      {/* Base circuit grid */}
      <div className="absolute inset-0 pointer-events-none transition-all duration-700" style={{ backgroundImage: active.bgGrid, backgroundSize: "50px 50px" }} />
      {/* Diagonal scanlines */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "repeating-linear-gradient(135deg, transparent, transparent 3px, rgba(0,229,255,0.008) 3px, rgba(0,229,255,0.008) 4px)",
        backgroundSize: "8px 8px",
      }} />
      {/* Hex dot pattern */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `radial-gradient(circle, ${active.accent}06 1px, transparent 1px)`,
        backgroundSize: "30px 30px",
        backgroundPosition: "15px 15px",
        animation: "hexPulse 6s ease-in-out infinite",
      }} />
      {/* Data stream vertical lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[10, 25, 50, 75, 90].map((left, i) => (
          <div key={`ds-${i}`} className="absolute w-px top-0" style={{
            left: `${left}%`,
            height: "30%",
            background: `linear-gradient(to bottom, transparent, ${active.accent}08, transparent)`,
            animation: `dataStream ${8 + i * 2}s linear infinite`,
            animationDelay: `${i * 1.5}s`,
          }} />
        ))}
      </div>
      {/* Glitch band overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute left-0 right-0 h-0.5" style={{
          top: "33%",
          background: `linear-gradient(90deg, transparent, ${active.accent}06, rgba(192,132,252,0.04), transparent)`,
          animation: "glitchBand 4s ease-in-out infinite",
        }} />
        <div className="absolute left-0 right-0 h-px" style={{
          top: "67%",
          background: `linear-gradient(90deg, transparent, rgba(192,132,252,0.04), ${active.accent}06, transparent)`,
          animation: "glitchBand 6s ease-in-out infinite",
          animationDelay: "2s",
        }} />
      </div>
      {/* Primary glows */}
      <div className="absolute inset-0 pointer-events-none transition-all duration-700" style={{ background: active.bgGlow }} />
      <div className="absolute inset-0 pointer-events-none transition-all duration-700" style={{ background: active.bgGlow2 }} />
      {/* Edge fades */}
      <div className="absolute inset-x-0 top-0 h-40 pointer-events-none z-5" style={{ background: "linear-gradient(to bottom, #000, transparent)" }} />
      <div className="absolute inset-x-0 bottom-0 h-40 pointer-events-none z-5" style={{ background: "linear-gradient(to top, #000, transparent)" }} />

      {/* ── Runner theme: speed distortion lines + grid perspective ── */}
      {activeGame === "runner" && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {/* Original speed lines */}
          {[15, 35, 55, 75, 90].map((top, i) => (
            <div key={i} className="absolute h-px left-0 right-0" style={{ top: `${top}%`, background: "linear-gradient(to right, transparent 20%, rgba(0,229,255,0.06) 50%, transparent 80%)", animation: `speedLine ${3 + i * 0.7}s linear infinite`, animationDelay: `${i * 0.5}s` }} />
          ))}
          {/* Extra distortion blur streaks */}
          {[22, 42, 68, 82].map((top, i) => (
            <div key={`streak-${i}`} className="absolute left-0 right-0" style={{
              top: `${top}%`,
              height: "2px",
              background: `linear-gradient(to right, transparent 10%, rgba(0,229,255,0.03) 30%, rgba(0,229,255,0.05) 50%, rgba(0,229,255,0.03) 70%, transparent 90%)`,
              filter: "blur(1px)",
              animation: `speedStreak ${5 + i * 1.2}s linear infinite`,
              animationDelay: `${i * 0.8}s`,
            }} />
          ))}
          {/* Perspective grid floor hint */}
          <div className="absolute bottom-0 left-0 right-0 h-[30%]" style={{
            backgroundImage: "linear-gradient(rgba(0,229,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.015) 1px, transparent 1px)",
            backgroundSize: "40px 20px",
            transform: "perspective(400px) rotateX(50deg)",
            transformOrigin: "bottom center",
            opacity: 0.5,
            maskImage: "linear-gradient(to top, rgba(0,0,0,0.3), transparent)",
            WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,0.3), transparent)",
          }} />
        </div>
      )}

      {/* ── Hack theme: matrix rain with actual characters ── */}
      {activeGame === "hack" && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {/* Original rain columns */}
          {[8, 18, 32, 48, 62, 78, 88].map((left, i) => (
            <div key={i} className="absolute w-px top-0 bottom-0" style={{ left: `${left}%`, background: "linear-gradient(to bottom, transparent, rgba(74,222,128,0.08) 30%, rgba(74,222,128,0.03) 70%, transparent)", animation: `matrixDrop ${6 + i * 1.5}s linear infinite`, animationDelay: `${i * 0.8}s` }} />
          ))}
          {/* Falling character columns */}
          {[12, 24, 38, 55, 70, 84].map((left, colIdx) => (
            <div key={`col-${colIdx}`} className="absolute top-0 bottom-0" style={{ left: `${left}%`, width: "12px" }}>
              {[0, 1, 2, 3, 4, 5, 6, 7].map((row) => (
                <div key={`char-${colIdx}-${row}`} className="absolute font-mono text-[10px] leading-none" style={{
                  color: row === 0 ? "rgba(74,222,128,0.5)" : `rgba(74,222,128,${0.15 - row * 0.015})`,
                  textShadow: row === 0 ? "0 0 6px rgba(74,222,128,0.5)" : "none",
                  top: `${row * 12}%`,
                  animation: `matrixCharFall ${7 + colIdx * 1.3 + row * 0.3}s linear infinite`,
                  animationDelay: `${colIdx * 0.6 + row * 0.4}s`,
                  fontFamily: "'Geist Mono', monospace",
                }}>{MATRIX_CHARS[(colIdx * 3 + row * 7) % MATRIX_CHARS.length]}</div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ── Target theme: laser grid + scanning beams + pulsing circles ── */}
      {activeGame === "target" && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {/* Floating crosshairs with connecting lines */}
          {[{x:15,y:25},{x:80,y:20},{x:25,y:75},{x:75,y:70},{x:50,y:45}].map((p, i) => (
            <div key={i} className="absolute" style={{ left: `${p.x}%`, top: `${p.y}%`, width: 30, height: 30, animation: `crosshairPulse ${3 + i}s ease-in-out infinite`, animationDelay: `${i * 0.6}s` }}>
              <div className="absolute top-1/2 left-0 right-0 h-px" style={{ background: "rgba(192,132,252,0.1)" }} />
              <div className="absolute left-1/2 top-0 bottom-0 w-px" style={{ background: "rgba(192,132,252,0.1)" }} />
              <div className="absolute inset-2 border border-purple-500/8 rounded-full" />
            </div>
          ))}
          {/* Connecting lines between crosshair positions */}
          <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.04 }}>
            <line x1="15%" y1="25%" x2="80%" y2="20%" stroke="#c084fc" strokeWidth="0.5" strokeDasharray="4 6" />
            <line x1="80%" y1="20%" x2="75%" y2="70%" stroke="#c084fc" strokeWidth="0.5" strokeDasharray="4 6" />
            <line x1="25%" y1="75%" x2="50%" y2="45%" stroke="#c084fc" strokeWidth="0.5" strokeDasharray="4 6" />
            <line x1="50%" y1="45%" x2="15%" y2="25%" stroke="#c084fc" strokeWidth="0.5" strokeDasharray="4 6" />
          </svg>
          {/* Pulsing circles at intersections */}
          <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.12 }}>
            {[{x:"15%",y:"25%"},{x:"80%",y:"20%"},{x:"50%",y:"45%"}].map((p, i) => (
              <circle key={`pulse-${i}`} cx={p.x} cy={p.y} r="2" fill="#c084fc" style={{animation:`nodeGlow ${2 + i * 0.5}s ease-in-out infinite`}} />
            ))}
          </svg>
          {/* Scanning beam SVG */}
          <div className="absolute" style={{ left: "50%", top: "50%", width: 200, height: 200, marginLeft: -100, marginTop: -100, opacity: 0.04 }}>
            <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
              <line x1="100" y1="100" x2="200" y2="100" stroke="#c084fc" strokeWidth="0.8">
                <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="8s" repeatCount="indefinite"/>
              </line>
              <circle cx="100" cy="100" r="80" stroke="#c084fc" strokeWidth="0.3" strokeDasharray="5 10" opacity="0.5" />
              <circle cx="100" cy="100" r="50" stroke="#c084fc" strokeWidth="0.3" strokeDasharray="3 8" opacity="0.3" />
            </svg>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 relative z-10">

        {/* ════════════ TITLE with glitch echoes ════════════ */}
        <div className="text-center mb-6 sm:mb-8 relative">
          {/* Ghost echo behind - cyan */}
          <div className="absolute inset-0 flex flex-col items-center justify-start pointer-events-none select-none" aria-hidden="true">
            <h2 className="text-3xl sm:text-5xl md:text-7xl font-black font-orbitron leading-none mb-2" style={{
              color: "#00e5ff",
              opacity: 0.06,
              transform: "translate(3px, -2px)",
              filter: "blur(0.5px)",
            }}>BLAKASH ARENA</h2>
          </div>
          {/* Ghost echo behind - purple */}
          <div className="absolute inset-0 flex flex-col items-center justify-start pointer-events-none select-none" aria-hidden="true">
            <h2 className="text-3xl sm:text-5xl md:text-7xl font-black font-orbitron leading-none mb-2" style={{
              color: "#c084fc",
              opacity: 0.05,
              transform: "translate(-3px, 2px)",
              filter: "blur(0.5px)",
            }}>BLAKASH ARENA</h2>
          </div>
          {/* Main title */}
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-black font-orbitron leading-none select-none mb-2 relative"
            style={{
              backgroundImage: `linear-gradient(90deg, #fff 0%, ${active.accent} 30%, #fff 50%, ${active.accent} 70%, #fff 100%)`,
              backgroundSize: "400% 100%",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              animation: "titleShimmer 5s linear infinite, cyberGlitchText 8s ease-in-out infinite",
              filter: `drop-shadow(0 0 30px ${active.accent}40) drop-shadow(0 0 60px ${active.accent}15)`,
              transition: "filter 0.5s",
              textShadow: `0 0 40px ${active.accent}30`,
            }}>BLAKASH ARENA</h2>
          <p className="font-mono text-[10px] sm:text-xs tracking-[0.3em] uppercase transition-colors duration-500" style={{ color: `${active.accent}60`, fontFamily: "'Space Grotesk', monospace" }}>{active.tagline}</p>
        </div>

        {/* ════════════ GAME SELECTOR — Angular clipPath tabs ════════════ */}
        <div className="flex justify-center mb-5 sm:mb-6">
          <div className="inline-flex flex-wrap justify-center gap-2 sm:gap-1">
            {GAMES.map((g, idx) => {
              const isActive = activeGame === g.id;
              const sysLabels = ["SYS.01", "SYS.02", "SYS.03"];
              return (
                <button key={g.id} onClick={() => setActiveGame(g.id)}
                  className="relative flex items-center gap-2.5 sm:gap-3 px-4 sm:px-7 py-3 sm:py-3.5 font-mono transition-all duration-300 cursor-pointer overflow-hidden group"
                  style={{
                    background: isActive ? `linear-gradient(135deg, ${g.accent}12, ${g.accent}06)` : "rgba(0,5,12,0.7)",
                    clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                    ["--g1" as string]: `${g.accent}30`,
                    ["--g2" as string]: `${g.accent}08`,
                    ["--g3" as string]: `${g.accent}12`,
                    animation: isActive ? "selectorGlow 3s ease-in-out infinite" : "none",
                  } as React.CSSProperties}>
                  {/* Top neon edge */}
                  {isActive && <span className="absolute top-0 left-0 right-2.5" style={{ height: "1.5px", background: `linear-gradient(to right, ${g.accent}80, ${g.accent}40, transparent)`, boxShadow: `0 0 10px ${g.accent}60` }} />}
                  {/* Left neon edge */}
                  {isActive && <span className="absolute top-0 left-0 bottom-2.5" style={{ width: "1.5px", background: `linear-gradient(to bottom, ${g.accent}80, ${g.accent}40, transparent)`, boxShadow: `0 0 10px ${g.accent}60` }} />}
                  {/* Scan line on hover/active */}
                  <span className="absolute top-0 bottom-0 w-[40%] pointer-events-none" style={{
                    background: `linear-gradient(90deg, transparent, ${g.accent}${isActive ? "10" : "04"}, transparent)`,
                    animation: isActive ? "tabScan 3s linear infinite" : "none",
                    left: "-30%",
                  }} />
                  {/* Corner edge marks */}
                  <span className="absolute top-0 left-0 w-2 h-2 pointer-events-none" style={{borderTop:`1px solid ${isActive ? g.accent : "transparent"}`,borderLeft:`1px solid ${isActive ? g.accent : "transparent"}`}} />
                  <span className="absolute bottom-0 right-0 w-2 h-2 pointer-events-none" style={{borderBottom:`1px solid ${isActive ? g.accent : "transparent"}`,borderRight:`1px solid ${isActive ? g.accent : "transparent"}`}} />

                  <span className="text-lg sm:text-xl relative z-10">{g.icon}</span>
                  <div className="text-left relative z-10">
                    <div className="text-[10px] sm:text-xs font-black tracking-wider leading-tight" style={{ color: isActive ? g.accent : "rgba(255,255,255,0.25)", textShadow: isActive ? `0 0 10px ${g.accent}40` : "none" }}>{g.label}</div>
                    <div className="flex items-center gap-2">
                      <div className="text-[8px] sm:text-[9px] tracking-widest" style={{ color: isActive ? `${g.accent}60` : "rgba(255,255,255,0.08)" }}>{g.sub}</div>
                      <div className="text-[7px] tracking-wider" style={{ color: isActive ? `${g.accent}30` : "rgba(255,255,255,0.04)", fontFamily: "'Geist Mono', monospace" }}>{sysLabels[idx]}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ════════════ GAME SCREEN ════════════ */}
        <div className="relative">

          {/* Outer frame — angular clipPath + animated neon border */}
          <div className="absolute -inset-px pointer-events-none z-20 transition-all duration-500" style={{
            border: `1.5px solid ${active.accent}25`,
            boxShadow: `0 0 30px ${active.accent}0a, 0 0 60px ${active.accent}05, inset 0 0 30px ${active.accent}03`,
            clipPath: "polygon(0 12px, 12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px))",
          }}>
            {/* Animated border trace via SVG */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{opacity:0.3}}>
              <rect x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)" fill="none" stroke={active.accent} strokeWidth="1" strokeDasharray="8 12" style={{animation:"borderTraceAnim 4s linear infinite"}} rx="1" />
            </svg>
          </div>

          {/* Corner brackets — upgraded with inner marks + glow */}
          {[
            { pos: "top-0 left-0", border: "border-t-2 border-l-2", inner: { top: 0, left: 0, borderTop: "1px", borderLeft: "1px" } },
            { pos: "top-0 right-0", border: "border-t-2 border-r-2", inner: { top: 0, right: 0, borderTop: "1px", borderRight: "1px" } },
            { pos: "bottom-0 left-0", border: "border-b-2 border-l-2", inner: { bottom: 0, left: 0, borderBottom: "1px", borderLeft: "1px" } },
            { pos: "bottom-0 right-0", border: "border-b-2 border-r-2", inner: { bottom: 0, right: 0, borderBottom: "1px", borderRight: "1px" } },
          ].map((c, i) => (
            <div key={i} className={`absolute ${c.pos} w-6 h-6 sm:w-8 sm:h-8 ${c.border} z-30 pointer-events-none transition-colors duration-500`} style={{
              borderColor: active.accent,
              filter: `drop-shadow(0 0 6px ${active.accent})`,
              animation: "cornerGlow 3s ease-in-out infinite",
              animationDelay: `${i * 0.3}s`,
            }}>
              {/* Inner corner mark */}
              <div className="absolute w-2 h-2 sm:w-3 sm:h-3" style={{
                ...c.inner,
                borderColor: `${active.accent}50`,
                borderStyle: "solid",
                borderWidth: "0",
                ...(c.inner.borderTop ? { borderTopWidth: c.inner.borderTop } : {}),
                ...(c.inner.borderLeft ? { borderLeftWidth: c.inner.borderLeft } : {}),
                ...(c.inner.borderRight ? { borderRightWidth: c.inner.borderRight } : {}),
                ...(c.inner.borderBottom ? { borderBottomWidth: c.inner.borderBottom } : {}),
              } as React.CSSProperties} />
            </div>
          ))}

          {/* ── Top HUD strip — cyberpunk enhanced ── */}
          <div className="relative z-30 flex items-center justify-between px-3 sm:px-5 py-2 sm:py-2.5 font-mono text-[9px] sm:text-[10px]"
            style={{
              background: `linear-gradient(to right, ${active.accent}0a, rgba(0,5,12,0.9), ${active.accent}0a)`,
              borderBottom: `1px solid ${active.accent}18`,
              clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)",
            }}>
            {/* Left — system label with flickering indicator */}
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inset-0 rounded-full animate-ping" style={{ background: active.accent, opacity: 0.5 }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: active.accent, boxShadow: `0 0 6px ${active.accent}` }} />
              </span>
              {/* Flickering secondary dot */}
              <span className="relative h-1 w-1 shrink-0 hidden sm:flex" style={{animation:"cyberFlicker 2.5s ease-in-out infinite"}}>
                <span className="inline-flex rounded-full h-1 w-1" style={{ background: "#c084fc" }} />
              </span>
              <span className="uppercase tracking-[0.2em] font-black hidden sm:inline" style={{ color: active.accent, animation: "hudBlink 4s ease-in-out infinite", fontFamily: "'Orbitron', monospace", fontSize: "9px" }}>{active.hudLabel}</span>
              <span className="uppercase tracking-[0.2em] font-black sm:hidden" style={{ color: active.accent, fontFamily: "'Orbitron', monospace", fontSize: "9px" }}>{active.icon} {active.label}</span>
            </div>
            {/* Center — game name + terminal readout */}
            <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-2">
              <div className="h-px w-6" style={{ background: `linear-gradient(to right, transparent, ${active.accent}40)` }} />
              {/* Circuit trace SVG */}
              <svg width="16" height="8" viewBox="0 0 16 8" className="hidden lg:block" style={{opacity:0.3}}>
                <path d="M0 4h4l2-3h4l2 3h4" stroke={active.accent} strokeWidth="0.8" fill="none" strokeDasharray="3 2">
                  <animate attributeName="stroke-dashoffset" from="0" to="-10" dur="2s" repeatCount="indefinite"/>
                </path>
              </svg>
              <span className="uppercase tracking-[0.3em] text-zinc-500" style={{fontFamily:"'Space Grotesk', monospace"}}>{active.label}</span>
              <svg width="16" height="8" viewBox="0 0 16 8" className="hidden lg:block" style={{opacity:0.3}}>
                <path d="M0 4h4l2-3h4l2 3h4" stroke={active.accent} strokeWidth="0.8" fill="none" strokeDasharray="3 2">
                  <animate attributeName="stroke-dashoffset" from="0" to="10" dur="2s" repeatCount="indefinite"/>
                </path>
              </svg>
              <div className="h-px w-6" style={{ background: `linear-gradient(to left, transparent, ${active.accent}40)` }} />
            </div>
            {/* Right — status with neon dots */}
            <div className="flex items-center gap-3 text-zinc-600">
              <span className="uppercase tracking-widest hidden sm:inline" style={{fontFamily:"'Geist Mono', monospace",fontSize:"8px",color:`${active.accent}30`,animation:"cyberFlicker 5s ease-in-out infinite"}}>&#x27E8; data :: streaming &#x27E9;</span>
              <span className="uppercase tracking-widest" style={{fontFamily:"'Space Grotesk', monospace"}}>SYS</span>
              <span style={{ color: active.accent, animation: "cyberNeonPulse 2s ease-in-out infinite", textShadow: `0 0 8px ${active.accent}` }}>&#9679;</span>
              <span className="uppercase tracking-widest hidden sm:inline" style={{fontFamily:"'Space Grotesk', monospace"}}>ONLINE</span>
            </div>
          </div>

          {/* ── Game viewport ── */}
          <div className="relative h-[300px] sm:h-[380px] md:h-[450px] lg:h-[500px] overflow-hidden" style={{ background: "rgba(0,2,8,0.98)" }}>
            {/* Vignette */}
            <div className="absolute inset-0 pointer-events-none z-10" style={{ boxShadow: `inset 0 0 60px rgba(0,0,0,0.5), inset 0 0 120px rgba(0,0,0,0.2)` }} />

            {/* Side edge glows — enhanced */}
            <div className="absolute left-0 top-0 bottom-0 w-px pointer-events-none z-20 transition-all duration-500" style={{ background: `linear-gradient(to bottom, ${active.accent}50, ${active.accent}15 20%, transparent 40%, transparent 60%, ${active.accent}15 80%, ${active.accent}50)`, boxShadow: `0 0 8px ${active.accent}20, 2px 0 15px ${active.accent}08` }} />
            <div className="absolute right-0 top-0 bottom-0 w-px pointer-events-none z-20 transition-all duration-500" style={{ background: `linear-gradient(to bottom, ${active.accent}50, ${active.accent}15 20%, transparent 40%, transparent 60%, ${active.accent}15 80%, ${active.accent}50)`, boxShadow: `0 0 8px ${active.accent}20, -2px 0 15px ${active.accent}08` }} />

            {/* Scan line */}
            <div className="absolute left-0 right-0 h-px pointer-events-none z-20" style={{ background: `linear-gradient(to right, transparent, ${active.accent}18 30%, ${active.accent}18 70%, transparent)`, animation: "scanV 8s linear infinite" }} />

            {/* Subtle scanline texture */}
            <div className="absolute inset-0 pointer-events-none z-5" style={{
              backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.03) 1px, rgba(0,0,0,0.03) 2px)",
              mixBlendMode: "multiply",
            }} />

            {activeGame === "runner" && <NeonRunner />}
            {activeGame === "hack" && <CyberHack />}
            {activeGame === "target" && <TargetHunt />}
          </div>

          {/* ── Bottom HUD strip — cyberpunk enhanced ── */}
          <div className="relative z-30 flex items-center justify-between px-3 sm:px-5 py-2 sm:py-2.5 font-mono text-[8px] sm:text-[9px]"
            style={{
              background: `linear-gradient(to right, ${active.accent}08, rgba(0,5,12,0.9), ${active.accent}08)`,
              borderTop: `1px solid ${active.accent}18`,
              clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
            }}>
            {/* Left — controls */}
            <div className="flex items-center gap-2 sm:gap-4 text-zinc-600">
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 font-bold tracking-wider" style={{ border: `1px solid ${active.accent}25`, color: `${active.accent}70`, background: `${active.accent}06`, clipPath: "polygon(0 0, calc(100% - 3px) 0, 100% 3px, 100% 100%, 0 100%)", fontFamily: "'Geist Mono', monospace" }}>
                  {activeGame === "runner" ? "SPACE" : activeGame === "hack" ? "CLICK" : "AIM"}
                </kbd>
                <span className="tracking-widest uppercase" style={{fontFamily:"'Space Grotesk', monospace"}}>{activeGame === "runner" ? "Jump" : activeGame === "hack" ? "Select" : "Fire"}</span>
              </div>
              <span style={{ color: `${active.accent}20` }}>&#x25C6;</span>
              <div className="items-center gap-1 hidden sm:flex">
                <kbd className="px-1.5 py-0.5 font-bold tracking-wider" style={{ border: `1px solid ${active.accent}25`, color: `${active.accent}70`, background: `${active.accent}06`, clipPath: "polygon(0 0, calc(100% - 3px) 0, 100% 3px, 100% 100%, 0 100%)", fontFamily: "'Geist Mono', monospace" }}>
                  {activeGame === "runner" ? "x2" : activeGame === "hack" ? "MEMO" : "COMBO"}
                </kbd>
                <span className="tracking-widest uppercase" style={{fontFamily:"'Space Grotesk', monospace"}}>{activeGame === "runner" ? "Double Jump" : activeGame === "hack" ? "Memorize" : "Chain Hits"}</span>
              </div>
            </div>
            {/* Center — circuit trace SVG */}
            <div className="absolute left-1/2 -translate-x-1/2 hidden md:block" style={{opacity:0.2}}>
              <svg width="100" height="10" viewBox="0 0 100 10" fill="none">
                <path d="M0 5h20l3-3h10l3 3h28l3 3h10l3-3h20" stroke={active.accent} strokeWidth="0.6" fill="none" strokeDasharray="4 4">
                  <animate attributeName="stroke-dashoffset" from="16" to="0" dur="2s" repeatCount="indefinite"/>
                </path>
                <circle cx="20" cy="5" r="1" fill={active.accent} opacity="0.5"><animate attributeName="opacity" values="0.3;0.7;0.3" dur="2s" repeatCount="indefinite"/></circle>
                <circle cx="50" cy="5" r="1" fill={active.accent} opacity="0.5"><animate attributeName="opacity" values="0.7;0.3;0.7" dur="2s" repeatCount="indefinite"/></circle>
                <circle cx="80" cy="5" r="1" fill={active.accent} opacity="0.5"><animate attributeName="opacity" values="0.3;0.7;0.3" dur="1.5s" repeatCount="indefinite"/></circle>
              </svg>
            </div>
            {/* Right — themed status with neon indicators */}
            <div className="flex items-center gap-2 sm:gap-3">
              {activeGame === "runner" && <><span className="text-zinc-700" style={{fontFamily:"'Orbitron', monospace",fontSize:"7px"}}>SPD</span><span style={{ color: active.accent, textShadow: `0 0 6px ${active.accent}40` }}>&#x25B0;&#x25B0;&#x25B0;&#x25B0;<span className="text-zinc-800">&#x25B0;</span></span></>}
              {activeGame === "hack" && <><span className="text-zinc-700" style={{fontFamily:"'Orbitron', monospace",fontSize:"7px"}}>SEC</span><span className="tracking-wider" style={{ color: active.accent, textShadow: `0 0 6px ${active.accent}40` }}>&#x2588;&#x2588;&#x2591;&#x2591;&#x2591;</span></>}
              {activeGame === "target" && <><span className="text-zinc-700" style={{fontFamily:"'Orbitron', monospace",fontSize:"7px"}}>AMMO</span><span style={{ color: active.accent, textShadow: `0 0 6px ${active.accent}40` }}>&#x221E;</span><span className="text-zinc-800">&#183;</span><span className="text-zinc-700" style={{fontFamily:"'Orbitron', monospace",fontSize:"7px"}}>RNG</span><span style={{ color: active.accent, textShadow: `0 0 6px ${active.accent}40` }}>MAX</span></>}
              {/* Animated neon dot */}
              <div className="w-1 h-1 rounded-full hidden sm:block" style={{background:active.accent,boxShadow:`0 0 4px ${active.accent}`,animation:"cyberFlicker 3s ease-in-out infinite"}} />
            </div>
          </div>
        </div>

        {/* ════════════ Bottom decoration — circuit trace SVGs ════════════ */}
        <div className="flex items-center justify-center gap-3 mt-6 relative">
          {/* Left circuit trace SVG */}
          <svg width="80" height="12" viewBox="0 0 80 12" fill="none" className="hidden sm:block" style={{opacity:0.25}}>
            <path d="M80 6h-20l-2-3h-8l-2 3h-8l-2 3h-8l-2-3h-28" stroke={active.accent} strokeWidth="0.7" fill="none" strokeDasharray="5 3">
              <animate attributeName="stroke-dashoffset" from="16" to="0" dur="3s" repeatCount="indefinite"/>
            </path>
            <circle cx="60" cy="6" r="1.2" fill={active.accent} opacity="0.4"><animate attributeName="opacity" values="0.2;0.6;0.2" dur="2s" repeatCount="indefinite"/></circle>
            <circle cx="40" cy="6" r="1.2" fill={active.accent} opacity="0.4"><animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite"/></circle>
          </svg>
          <div className="h-px w-8 sm:w-0 transition-all duration-500" style={{ background: `linear-gradient(to right, transparent, ${active.accent}25)` }} />
          {[0,1,2].map(i => (
            <div key={i} className="w-1.5 h-1.5 transition-all duration-500" style={{
              background: i === 1 ? `${active.accent}50` : "transparent",
              border: `1px solid ${active.accent}${i === 1 ? "60" : "20"}`,
              transform: "rotate(45deg)",
              boxShadow: i === 1 ? `0 0 6px ${active.accent}30` : "none",
            }} />
          ))}
          <div className="h-px w-8 sm:w-0 transition-all duration-500" style={{ background: `linear-gradient(to left, transparent, ${active.accent}25)` }} />
          {/* Right circuit trace SVG */}
          <svg width="80" height="12" viewBox="0 0 80 12" fill="none" className="hidden sm:block" style={{opacity:0.25}}>
            <path d="M0 6h20l2-3h8l2 3h8l2 3h8l2-3h28" stroke={active.accent} strokeWidth="0.7" fill="none" strokeDasharray="5 3">
              <animate attributeName="stroke-dashoffset" from="0" to="16" dur="3s" repeatCount="indefinite"/>
            </path>
            <circle cx="20" cy="6" r="1.2" fill={active.accent} opacity="0.4"><animate attributeName="opacity" values="0.2;0.6;0.2" dur="2s" repeatCount="indefinite"/></circle>
            <circle cx="40" cy="6" r="1.2" fill={active.accent} opacity="0.4"><animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite"/></circle>
          </svg>
        </div>

      </div>
    </section>
  );
}
