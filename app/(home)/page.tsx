"use client";
import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import ScrollToTop from "@/components/ScrollToTop";
import AnimatedSection from "@/components/AnimatedSection";
import LogoAshEffect from "@/components/LogoAshEffect";

const visionCards = [
  { icon: "fa-solid fa-gamepad",            title: "Game Development",  desc: "Building and launching original games, from concept to release." },
  { icon: "fa-solid fa-vr-cardboard",       title: "AR · VR · XR",      desc: "Building interactive experiences beyond traditional screens and dimensions." },
  { icon: "fa-solid fa-screwdriver-wrench", title: "Studio Services",   desc: "Contract development, art, and technical work for other studios, built to your requirements." },
  { icon: "fa-solid fa-people-group",       title: "Collaboration",     desc: "Partnering with other studios, creators, and publishers who share the vision." },
];

const featured = { image: "/projects/primeval.png" };

export default function Home() {
  const aboutRef = useRef<HTMLElement>(null);
  const [aboutVisible, setAboutVisible] = useState(false);
  const logoAreaRef = useRef<HTMLDivElement>(null);

  const [displayText, setDisplayText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const fullText = "We Build Worlds.";

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setAboutVisible(true); },
      { threshold: 0.3 }
    );
    if (aboutRef.current) observer.observe(aboutRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!aboutVisible) return;
    let i = 0;
    const timer = setInterval(() => {
      if (i < fullText.length) { setDisplayText(fullText.slice(0, i + 1)); i++; }
      else clearInterval(timer);
    }, 60);
    return () => clearInterval(timer);
  }, [aboutVisible]);

  useEffect(() => {
    const t = setInterval(() => setShowCursor(p => !p), 530);
    return () => clearInterval(t);
  }, []);

  return (
    <main className="min-h-screen bg-black text-white">
      <style>{`
        html { scroll-padding-top: 80px; }

        @keyframes floatUp {
          0%,100% { transform: translateY(0px); }
          50%     { transform: translateY(-6px); }
        }
      `}</style>

      <Navbar />

      {/* ══ HERO ══ */}
      <section id="home"
        className="relative min-h-screen flex items-center bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: "url('/Image/hak-hero-v1.png')" }}>

        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 62% 68% at 50% 46%, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 52%, transparent 84%)" }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 55% 38% at 50% 112%, rgba(217,74,30,0.1) 0%, transparent 72%)" }} />
        <div className="absolute inset-x-0 bottom-0 h-40 pointer-events-none z-5" style={{ background: "linear-gradient(to top, #000, transparent)" }} />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 text-center">
          <span className="font-mono text-xs sm:text-sm tracking-[0.4em] uppercase text-ash-400/70 block mb-5">Indie Game Studio</span>
          <img
            src="/logo/HomePage_Logo.png"
            alt="BLAKASH Game Studio"
            className="w-full max-w-[380px] sm:max-w-[560px] md:max-w-[720px] lg:max-w-[860px] h-auto mx-auto drop-shadow-[0_0_60px_rgba(0,0,0,0.8)]"
          />
          <p className="font-cinzel font-medium uppercase text-ash-300 mt-4 sm:mt-5"
            style={{ fontSize: "clamp(1rem, 2.4vw, 2rem)", letterSpacing: "0.55em" }}>
            Game Studio
          </p>

          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-3 sm:gap-5 mt-10 mb-7">
              <div className="h-px w-8 sm:w-16 shrink-0" style={{ background: "linear-gradient(to right, transparent, #8E9395)" }} />
              <span className="text-ash-300 text-sm sm:text-lg tracking-[0.25em] sm:tracking-[0.4em] uppercase font-light whitespace-nowrap">Ideas Never Die</span>
              <div className="h-px w-8 sm:w-16 shrink-0" style={{ background: "linear-gradient(to left, transparent, #8E9395)" }} />
            </div>

            <p className="text-zinc-300 max-w-md sm:max-w-xl mx-auto text-base sm:text-xl leading-8 mb-12">
              An indie game studio crafting original worlds, immersive gameplay, and unforgettable experiences.
            </p>

            <div className="flex flex-wrap justify-center gap-5">
              <a href="#featured"
                className="inline-flex items-center gap-2 h-12 px-10 font-bold text-sm uppercase tracking-widest text-bone transition-all duration-300 hover:shadow-[0_0_40px_rgba(217,74,30,0.4)] hover:-translate-y-0.5"
                style={{
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, rgba(217,74,30,0.9), rgba(156,51,21,0.9))",
                  boxShadow: "0 0 30px rgba(217,74,30,0.25)",
                }}>
                Our Game <span>→</span>
              </a>
              <a href="#about"
                className="inline-flex items-center h-12 px-10 font-bold text-sm uppercase tracking-widest border border-ash-500/50 text-ash-300 hover:text-bone hover:border-ember-400/60 transition-all duration-300"
                style={{ borderRadius: "8px" }}>
                The Studio
              </a>
            </div>
          </div>
        </div>

        <div className="absolute bottom-9 left-6 sm:left-10 flex items-center gap-3 text-ash-400/70 text-xs tracking-[0.3em] uppercase">
          <span className="w-6 h-6 rounded-full border border-ash-500/40 flex items-center justify-center text-sm leading-none">+</span>
          Scroll
        </div>
      </section>

      {/* ══ ABOUT ══ */}
      <section id="about" ref={aboutRef}
        className="py-16 sm:py-20 md:py-24 relative overflow-hidden"
        style={{ backgroundImage: "url('/Image/About_Me.png')", backgroundSize: "cover", backgroundPosition: "center" }}>

        <div className="absolute inset-0 bg-black/88 z-0" />
        <div className="absolute inset-x-0 top-0 h-40 pointer-events-none z-5" style={{ background: "linear-gradient(to bottom, #000, transparent)" }} />
        <div className="absolute inset-x-0 bottom-0 h-40 pointer-events-none z-5" style={{ background: "linear-gradient(to top, #000, transparent)" }} />

        <AnimatedSection>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">

            <div ref={logoAreaRef} className="relative flex justify-center items-center min-h-[300px] md:min-h-[440px] overflow-hidden md:order-2">
              <LogoAshEffect containerRef={logoAreaRef} />
              <div className="absolute w-40 h-40 md:w-72 md:h-72 rounded-full bg-ash-500/10 blur-2xl md:blur-3xl animate-pulse pointer-events-none" />
              <img
                src="/logo/hak-logo.png"
                alt="BLAKASH"
                className="w-60 md:w-72 relative z-10 drop-shadow-[0_0_32px_rgba(217,74,30,0.4)]"
                style={{ animation: "floatUp 4s ease-in-out infinite" }}
              />
            </div>

            <div className="md:order-1">
              <span className="font-mono text-[11px] tracking-[0.3em] uppercase text-ash-400/70">The Studio</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-space mt-3 mb-8 min-h-14 text-bone">
                {displayText}
                <span className="text-ash-400 ml-0.5" style={{ opacity: showCursor ? 1 : 0, transition: "opacity 0.1s" }}>_</span>
              </h2>
              <p className="text-zinc-300 leading-8 text-lg mb-5">
                BLAKASH is an indie game studio founded by Arun Kumar — focused on building
                immersive worlds, original game IPs, and pushing the boundaries of interactive entertainment.
              </p>
              <p className="text-zinc-400 leading-8 mb-5">
                Our debut title, Mr. Edward, is a story-driven action experience where science,
                morality, and survival collide — crafted with care and creative obsession.
              </p>
              <p className="text-zinc-400 leading-8 mb-8">
                Beyond our own titles, we also build AR/VR/XR experiences and take on
                collaborative and contract work with other studios.
              </p>
              <p className="font-mono text-xs tracking-widest uppercase text-ash-400/60 mb-8">
                Founded 2026 · One Original Title In Development
              </p>
              <a href="#vision"
                className="inline-flex items-center gap-2 w-fit text-sm font-bold uppercase tracking-widest text-ash-300 hover:text-ember-400 border-b border-ash-500/40 hover:border-ember-400/60 pb-1 transition-colors duration-300">
                Our Story <span>→</span>
              </a>
            </div>
          </div>
        </div>
        </AnimatedSection>
      </section>

      {/* ══ VISION ══ */}
      <AnimatedSection>
      <section id="vision" className="py-16 sm:py-20 md:py-24 relative overflow-hidden" style={{ background: "#080808" }}>
        <div className="absolute inset-x-0 top-0 h-32 pointer-events-none z-5" style={{ background: "linear-gradient(to bottom, #000, transparent)" }} />
        <div className="absolute inset-x-0 bottom-0 h-32 pointer-events-none z-5" style={{ background: "linear-gradient(to top, #000, transparent)" }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center mb-12 md:mb-14">
            <div>
              <span className="font-mono text-[11px] tracking-[0.3em] uppercase text-ash-400/70">Vision</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-space mt-3 text-bone">One Vision. Endless Possibilities.</h2>
              <p className="text-zinc-400 mt-6 leading-7 mb-8">
                BLAKASH builds original games and immersive AR/VR/XR experiences — and partners
                with other studios on collaboration and contract work, turning ambitious ideas into
                real, playable worlds.
              </p>
              <a href="#featured"
                className="inline-flex items-center gap-2 w-fit text-sm font-bold uppercase tracking-widest text-ash-300 hover:text-ember-400 border-b border-ash-500/40 hover:border-ember-400/60 pb-1 transition-colors duration-300">
                Our Vision <span>→</span>
              </a>
            </div>

            <div className="relative min-h-[280px] md:min-h-[380px] overflow-hidden">
              <img src="/Image/Vision.png" alt="BLAKASH Vision" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 pointer-events-none" style={{ background: `
                linear-gradient(90deg, #080808 0%, transparent 14%, transparent 86%, #080808 100%),
                linear-gradient(180deg, #080808 0%, transparent 16%, transparent 84%, #080808 100%),
                radial-gradient(ellipse 75% 75% at 50% 50%, transparent 45%, #080808 100%)
              ` }} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-x-10 gap-y-12">
            {visionCards.map(({ icon, title, desc }) => (
              <div key={title} className="group">
                <i className={`${icon} text-2xl text-ash-400 mb-4 block transition-colors duration-300 group-hover:text-ember-400`} />
                <h3 className="text-lg font-bold text-bone mb-2">{title}</h3>
                <p className="text-zinc-500 text-sm leading-6">{desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>
      </AnimatedSection>

      {/* ══ OUR GAMES ══ */}
      <AnimatedSection>
      <section id="featured" className="relative py-16 sm:py-20 md:py-24 overflow-hidden" style={{ background: "#0a0806" }}>
        <div className="absolute inset-x-0 top-0 h-32 pointer-events-none z-5" style={{ background: "linear-gradient(to bottom, #000, transparent)" }} />
        <div className="absolute inset-x-0 bottom-0 h-32 pointer-events-none z-5" style={{ background: "linear-gradient(to top, #000, transparent)" }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center mb-16 md:mb-20">

            <div className="relative min-h-[320px] md:min-h-[480px] overflow-hidden">
              <img src={featured.image} alt="Mr. Edward" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 pointer-events-none" style={{ background: `
                linear-gradient(90deg, #0a0806 0%, transparent 14%, transparent 86%, #0a0806 100%),
                linear-gradient(180deg, #0a0806 0%, transparent 16%, transparent 84%, #0a0806 100%),
                radial-gradient(ellipse 75% 75% at 50% 50%, transparent 45%, #0a0806 100%)
              ` }} />
            </div>

            <div>
              <span className="font-mono text-[11px] tracking-[0.3em] uppercase text-ash-400/70">Upcoming Game</span>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black font-space mt-3 mb-4 text-bone">Mr. Edward</h2>
              <p className="font-space font-bold text-lg sm:text-xl text-ash-300 uppercase tracking-wide mb-6">Science Has A Cost.</p>
              <span className="font-mono text-xs tracking-widest uppercase text-ash-400/60 block mb-6">
                Action | Survival | Story Rich
              </span>
              <p className="text-zinc-400 leading-7 max-w-md mb-10">
                A story-driven action experience where experiments, morality, and survival collide.
              </p>
              <a href="/games/mr-edward"
                className="inline-flex items-center gap-2 w-fit text-sm font-bold uppercase tracking-widest text-ash-300 hover:text-ember-400 border-b border-ash-500/40 hover:border-ember-400/60 pb-1 transition-colors duration-300 whitespace-nowrap">
                View Details <span>→</span>
              </a>
            </div>

          </div>

          {/* Secondary title */}
          <div className="border-t border-white/8 pt-12 md:pt-16">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-10">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shrink-0 overflow-hidden border border-white/10">
                <img src="/Games/Mobile_Games/DoodleTow/Gameicon.png" alt="Doodle Tow icon" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <span className="font-mono text-[11px] tracking-[0.3em] uppercase text-ash-400/70">Also In Development</span>
                <h3 className="text-2xl sm:text-3xl font-bold font-space mt-2 mb-2 text-bone">
                  Doodle Tow
                </h3>
                <span className="font-mono text-xs tracking-widest uppercase text-ash-400/60 block mb-3">
                  Mobile · 2D · Coming Soon To Google Play
                </span>
                <p className="text-zinc-400 leading-7 max-w-md mb-4">
                  Draw the road while you drive — 200 levels in 4 doodle worlds, boss fights,
                  the endless Doodle Run, daily challenges and 10 vehicles with special powers.
                </p>
                <a href="/games/doodle-tow"
                  className="inline-flex items-center gap-2 w-fit text-sm font-bold uppercase tracking-widest text-ash-300 hover:text-ember-400 border-b border-ash-500/40 hover:border-ember-400/60 pb-1 transition-colors duration-300 whitespace-nowrap">
                  View Details <span>→</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      </AnimatedSection>

      {/* ══ CLOSING CTA ══ */}
      <AnimatedSection>
      <section id="contact" className="py-16 sm:py-24 md:py-28 relative text-center overflow-hidden" style={{ background: "linear-gradient(180deg,#050403 0%,#080806 100%)" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(142,147,149,0.05) 0%, transparent 70%)" }} />
        <div className="absolute inset-x-0 top-0 h-32 pointer-events-none z-5" style={{ background: "linear-gradient(to bottom, #000, transparent)" }} />
        <div className="absolute inset-x-0 bottom-0 h-32 pointer-events-none z-5" style={{ background: "linear-gradient(to top, #000, transparent)" }} />
        <div className="max-w-2xl mx-auto px-6 relative z-10">
          <span className="font-mono text-[11px] tracking-[0.3em] uppercase text-ash-400/70">Get In Touch</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-space mt-4 mb-6 text-bone">
            Let&apos;s Collaborate
          </h2>
          <p className="text-zinc-400 leading-7 mb-10">
            Interested in partnerships, publishing, collaboration, or contract work? We&apos;d love to hear from you.
          </p>
          <a href="/collaborate"
            className="inline-flex items-center gap-2 h-12 px-10 font-bold text-sm uppercase tracking-widest border border-ash-500/50 text-ash-300 hover:text-bone hover:border-ember-400/60 hover:shadow-[0_0_24px_rgba(217,74,30,0.2)] transition-all duration-300"
            style={{ borderRadius: "8px" }}>
            Get In Touch
          </a>
        </div>
      </section>
      </AnimatedSection>

      {/* ══ FOOTER ══ */}
      <footer className="relative" style={{ borderTop: "1px solid rgba(142,147,149,0.12)", background: "#050403" }}>
        <div className="max-w-6xl mx-auto px-6">

          {/* Brand block */}
          <div className="py-10 flex flex-col items-center text-center gap-4" style={{ borderBottom: "1px solid rgba(142,147,149,0.1)" }}>
            <div className="flex items-center gap-3">
              <img src="/logo/Logo%20header.png" alt="BLAKASH" className="w-8 h-8" />
            </div>
            <p className="text-ash-400/70 text-xs tracking-[0.3em] uppercase">Ideas Never Die</p>
          </div>

          {/* Link row */}
          <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-6" style={{ borderBottom: "1px solid rgba(142,147,149,0.1)" }}>
            <div className="flex items-center gap-8">
              {[
                { label: "Studio", href: "#about" },
                { label: "Vision", href: "#vision" },
                { label: "Game", href: "#featured" },
                { label: "Careers", href: "/careers" },
                { label: "Press", href: "/press" },
              ].map((item) => (
                <a key={item.label} href={item.href}
                  className="text-sm tracking-wide text-zinc-400 hover:text-bone transition-colors duration-300">
                  {item.label}
                </a>
              ))}
            </div>
            <div className="flex items-center gap-5">
              {[
                { label: "Email", href: "https://mail.google.com/mail/?view=cm&fs=1&to=blakashstudio@gmail.com", icon: "fa-solid fa-envelope" },
                { label: "Instagram", href: "https://www.instagram.com/blakashstudio/", icon: "fa-brands fa-instagram" },
                { label: "X", href: "https://x.com/blakashstudio", icon: "fa-brands fa-x-twitter" },
                { label: "LinkedIn", href: "https://www.linkedin.com/company/blakash/", icon: "fa-brands fa-linkedin-in" },
                { label: "ArtStation", href: "https://www.artstation.com/blakashstudio3", icon: "fa-brands fa-artstation" },
                { label: "YouTube", href: "https://www.youtube.com/@blakashstudio", icon: "fa-brands fa-youtube" },
              ].map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  className="text-zinc-500 hover:text-ember-400 transition-colors duration-300 text-lg">
                  <i className={s.icon} />
                </a>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="py-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
            <p className="text-zinc-600 text-xs font-mono tracking-widest">© 2026 BLAKASH Game Studio. All Rights Reserved.</p>
            <div className="flex items-center gap-4">
              <a href="/privacy" className="text-zinc-600 text-xs font-mono tracking-widest hover:text-zinc-400 transition-colors duration-300">
                Privacy
              </a>
              <a href="/terms" className="text-zinc-600 text-xs font-mono tracking-widest hover:text-zinc-400 transition-colors duration-300">
                Terms
              </a>
            </div>
          </div>

        </div>
      </footer>

      <ScrollToTop />
    </main>
  );
}
