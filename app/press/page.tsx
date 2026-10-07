import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import ScrollToTop from "@/components/ScrollToTop";

const TITLE = "Press Kit";
const DESCRIPTION = "BLAKASH Press Kit — studio fact sheet, logos, and game assets for Mr. Edward and Doodle Tow.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "https://www.blakash.com/press" },
  openGraph: {
    type: "website",
    url: "https://www.blakash.com/press",
    siteName: "BLAKASH",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/Image/hak-hero-v1.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/Image/hak-hero-v1.png"],
  },
};

const sectionClass = "max-w-5xl mx-auto px-6";
const h2Class = "text-xl sm:text-2xl font-bold font-space mt-16 mb-6 text-bone";

const factSheet = [
  { label: "Studio Name", value: "BLAKASH Game Studio" },
  { label: "Founded", value: "2026" },
  { label: "Founder", value: "Arun Kumar – Founder & Game Director, BLAKASH Game Studio" },
  { label: "Location", value: "Chennai, India" },
  { label: "Website", value: "blakash.com" },
  { label: "Contact", value: "blakashstudio@gmail.com" },
];

const logos = [
  { src: "/logo/Logo%20header.png", label: "Icon Mark", light: false },
  { src: "/logo/HomePage_Logo.png", label: "Full Wordmark", light: false },
];

export default function PressKitPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="pt-32 sm:pt-40 pb-24">
        <div className={sectionClass}>
          <span className="font-mono text-xs tracking-[0.35em] uppercase text-ash-400/70 block mb-4">Press Kit</span>
          <h1 className="text-4xl sm:text-5xl font-bold font-space mb-4 text-bone">BLAKASH Press Kit</h1>
          <p className="text-zinc-400 leading-7 max-w-2xl">
            Studio fact sheet, logos, and game assets for press, press coverage, and partner use.
          </p>

          {/* Fact sheet */}
          <h2 className={h2Class}>Fact Sheet</h2>
          <div className="rounded-xl border border-white/8 divide-y divide-white/8" style={{ background: "rgba(255,255,255,0.02)" }}>
            {factSheet.map((row) => (
              <div key={row.label} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 px-6 py-4">
                <span className="font-mono text-xs uppercase tracking-widest text-ash-400/70 sm:w-40 shrink-0">{row.label}</span>
                <span className="text-zinc-300">{row.value}</span>
              </div>
            ))}
          </div>

          {/* Logos */}
          <h2 className={h2Class}>Logos</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {logos.map((logo) => (
              <div key={logo.src} className="rounded-xl border border-white/8 p-8 flex flex-col items-center gap-4"
                style={{ background: logo.light ? "#f4f4f2" : "rgba(255,255,255,0.02)" }}>
                <img src={logo.src} alt={`BLAKASH ${logo.label}`} className="h-20 w-auto object-contain" />
                <span className={`font-mono text-xs uppercase tracking-widest ${logo.light ? "text-zinc-600" : "text-zinc-500"}`}>{logo.label}</span>
              </div>
            ))}
          </div>

          {/* Mr. Edward */}
          <h2 className={h2Class}>Mr. Edward</h2>
          <div className="grid md:grid-cols-2 gap-8 items-center rounded-xl border border-white/8 overflow-hidden" style={{ background: "rgba(255,255,255,0.02)" }}>
            <img src="/projects/primeval.png" alt="Mr. Edward" className="w-full h-full object-cover min-h-[260px]" />
            <div className="p-8">
              <h3 className="text-2xl font-bold font-space mb-2 text-bone">Mr. Edward</h3>
              <p className="font-mono text-xs tracking-widest uppercase text-ash-400/60 mb-4">Action | Survival | Story Rich</p>
              <p className="text-zinc-400 leading-7">
                A story-driven action experience where experiments, morality, and survival
                collide. Science has a cost.
              </p>
            </div>
          </div>

          {/* Doodle Tow */}
          <h2 className={h2Class}>Doodle Tow</h2>
          <div className="rounded-xl border border-white/8 p-8" style={{ background: "rgba(255,255,255,0.02)" }}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
              <div className="w-20 h-20 rounded-2xl shrink-0 overflow-hidden border border-white/10">
                <img src="/Games/Mobile_Games/DoodleTow/Gameicon.png" alt="Doodle Tow icon" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-2xl font-bold font-space mb-2 text-bone">Doodle Tow</h3>
                <p className="font-mono text-xs tracking-widest uppercase text-ash-400/60 mb-3">Mobile | 2D | Coming Soon To Google Play</p>
                <p className="text-zinc-400 leading-7 max-w-xl">
                  Draw the road while you drive — 200 levels in 4 doodle worlds, boss fights,
                  the endless Doodle Run, daily challenges and 10 vehicles with special powers.
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {["WIP2.jpeg", "WIP1.jpeg", "WIP3.jpeg"].map((f) => (
                <div key={f} className="rounded-lg overflow-hidden border border-white/10">
                  <img src={`/Games/Mobile_Games/DoodleTow/${f}`} alt="Doodle Tow screenshot" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          <p className="text-zinc-500 text-sm leading-7 mt-12">
            For interviews, assets, or other press inquiries, contact us at{" "}
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=blakashstudio@gmail.com" target="_blank" rel="noopener noreferrer"
              className="text-ash-300 hover:text-ember-400 underline transition-colors duration-300">
              blakashstudio@gmail.com
            </a>.
          </p>
        </div>
      </section>

      <ScrollToTop />
    </main>
  );
}
