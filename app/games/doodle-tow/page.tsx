import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import ScrollToTop from "@/components/ScrollToTop";

const TITLE = "Doodle Tow";
const DESCRIPTION =
  "Doodle Tow is BLAKASH's upcoming hand-drawn 2D mobile puzzle game — draw the road while you drive through 200 levels in 4 doodle worlds. Coming soon to Google Play.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "https://www.blakash.com/games/doodle-tow" },
  openGraph: {
    type: "website",
    url: "https://www.blakash.com/games/doodle-tow",
    siteName: "BLAKASH",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/Games/Mobile_Games/DoodleTow/WIP2.jpeg"],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/Games/Mobile_Games/DoodleTow/WIP2.jpeg"],
  },
};

const screenshots = [
  { src: "/Games/Mobile_Games/DoodleTow/WIP2.jpeg", alt: "Doodle Tow main menu" },
  { src: "/Games/Mobile_Games/DoodleTow/WIP1.jpeg", alt: "Doodle Tow world select" },
  { src: "/Games/Mobile_Games/DoodleTow/WIP3.jpeg", alt: "Doodle Tow level select" },
];

export default function DoodleTowPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="relative pt-32 sm:pt-40 pb-20 sm:pb-28 overflow-hidden" style={{ background: "#0a0806" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 60% at 50% 20%, rgba(142,147,149,0.06) 0%, transparent 70%)" }} />

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl mx-auto mb-8 overflow-hidden border border-white/10">
            <img src="/Games/Mobile_Games/DoodleTow/Gameicon.png" alt="Doodle Tow icon" className="w-full h-full object-cover" />
          </div>

          <span className="font-mono text-xs tracking-[0.35em] uppercase text-ash-400/70 block mb-5">Also In Development</span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black font-space mb-2 text-bone">
            Doodle Tow
          </h1>
          <span className="font-mono text-xs tracking-widest uppercase text-ash-400/60 block mb-10 mt-6">
            Mobile | 2D | Google Play
          </span>

          <div className="inline-flex items-center gap-3 mb-10 px-6 py-3 rounded-full border border-ash-500/30 bg-black/50 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-ember-400 animate-pulse" />
            <span className="text-sm font-bold uppercase tracking-widest text-ash-300">Coming Soon To Google Play</span>
          </div>

          <p className="text-zinc-400 leading-8 text-lg max-w-xl mx-auto mb-4">
            Draw the road while you drive — 200 levels in 4 doodle worlds, boss fights, the
            endless Doodle Run, daily challenges and 10 vehicles with special powers.
          </p>
          <p className="text-zinc-500 leading-7 max-w-xl mx-auto mb-14">
            Doodle Tow is currently in development for Google Play; a release date will follow
            as the project nears launch.
          </p>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 mb-14">
          <div className="grid sm:grid-cols-3 gap-5">
            {screenshots.map((s) => (
              <div key={s.src} className="rounded-xl overflow-hidden border border-white/10">
                <img src={s.src} alt={s.alt} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-6 flex flex-wrap justify-center gap-4">
          <a href="/#featured"
            className="inline-flex items-center h-14 px-10 font-bold text-sm uppercase tracking-widest border border-ash-500/50 text-ash-300 hover:text-bone hover:border-ember-400/60 transition-all duration-300"
            style={{ borderRadius: "8px" }}>
            ← Back to Home
          </a>
          <a href="/collaborate"
            className="inline-flex items-center gap-2 h-14 px-10 font-bold text-sm uppercase tracking-widest text-bone transition-all duration-300 hover:shadow-[0_0_40px_rgba(217,74,30,0.4)]"
            style={{
              borderRadius: "8px",
              background: "linear-gradient(135deg, rgba(217,74,30,0.9), rgba(156,51,21,0.9))",
              boxShadow: "0 0 30px rgba(217,74,30,0.25)",
            }}>
            Interested In Publishing? <span>→</span>
          </a>
        </div>
      </section>

      <ScrollToTop />
    </main>
  );
}
