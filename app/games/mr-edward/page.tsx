import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import ScrollToTop from "@/components/ScrollToTop";

const TITLE = "Mr. Edward";
const DESCRIPTION =
  "Mr. Edward is BLAKASH's upcoming story-driven action game, where science, morality, and survival collide. Coming soon.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "https://www.blakash.com/games/mr-edward" },
  openGraph: {
    type: "website",
    url: "https://www.blakash.com/games/mr-edward",
    siteName: "BLAKASH",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/projects/primeval.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/projects/primeval.png"],
  },
};

export default function MrEdwardPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="relative pt-32 sm:pt-40 pb-20 sm:pb-28 overflow-hidden" style={{ background: "#0a0806" }}>
        <div className="absolute inset-0 pointer-events-none">
          <img src="/projects/primeval.png" alt="" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a0806 0%, rgba(10,8,6,0.75) 40%, #0a0806 100%)" }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <span className="font-mono text-xs tracking-[0.35em] uppercase text-ash-400/70 block mb-5">Upcoming Game</span>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black font-space mb-4 text-bone">Mr. Edward</h1>
          <p className="font-space font-bold text-lg sm:text-xl text-ash-300 uppercase tracking-wide mb-6">Science Has A Cost.</p>
          <span className="font-mono text-xs tracking-widest uppercase text-ash-400/60 block mb-10">
            Action | Survival | Story Rich
          </span>

          <div className="inline-flex items-center gap-3 mb-10 px-6 py-3 rounded-full border border-ash-500/30 bg-black/50 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-ember-400 animate-pulse" />
            <span className="text-sm font-bold uppercase tracking-widest text-ash-300">Coming Soon</span>
          </div>

          <p className="text-zinc-400 leading-8 text-lg max-w-2xl mx-auto mb-4">
            A story-driven action experience where experiments, morality, and survival collide.
          </p>
          <p className="text-zinc-500 leading-7 max-w-xl mx-auto mb-14">
            Mr. Edward is currently in development. Full details, screenshots, and a release
            window will be announced as the project progresses.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
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
        </div>
      </section>

      <ScrollToTop />
    </main>
  );
}
