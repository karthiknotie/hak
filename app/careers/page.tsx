import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import ScrollToTop from "@/components/ScrollToTop";

const TITLE = "Careers";
const DESCRIPTION =
  "Careers at BLAKASH. No open positions right now, but we're always open to hearing from talented developers, artists, and creators.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "https://www.blakash.com/careers" },
  openGraph: {
    type: "website",
    url: "https://www.blakash.com/careers",
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

export default function CareersPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="relative pt-32 sm:pt-40 pb-20 sm:pb-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 60% at 50% 20%, rgba(142,147,149,0.06) 0%, transparent 70%)" }} />

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <span className="font-mono text-xs tracking-[0.35em] uppercase text-ash-400/70 block mb-5">Careers</span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-space mb-8 text-bone">
            Build Worlds With Us
          </h1>

          <div className="inline-flex items-center gap-3 mb-10 px-6 py-3 rounded-full border border-white/10 bg-black/50 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-zinc-500" />
            <span className="text-sm font-bold uppercase tracking-widest text-zinc-400">No Open Positions Right Now</span>
          </div>

          <p className="text-zinc-400 leading-8 text-lg max-w-xl mx-auto mb-4">
            We don&apos;t have any specific roles open at the moment. BLAKASH is still a small,
            early-stage studio — but we&apos;re always excited to hear from talented developers,
            artists, and creators who want to be part of what we&apos;re building.
          </p>
          <p className="text-zinc-500 leading-7 max-w-xl mx-auto mb-14">
            If that&apos;s you, reach out through our collaboration form — tell us about your
            work, and we&apos;ll keep you in mind as the studio grows.
          </p>

          <a href="/collaborate"
            className="inline-flex items-center gap-2 h-14 px-10 font-bold text-sm uppercase tracking-widest text-bone transition-all duration-300 hover:shadow-[0_0_40px_rgba(217,74,30,0.4)]"
            style={{
              borderRadius: "8px",
              background: "linear-gradient(135deg, rgba(217,74,30,0.9), rgba(156,51,21,0.9))",
              boxShadow: "0 0 30px rgba(217,74,30,0.25)",
            }}>
            Get In Touch <span>→</span>
          </a>

          <p className="text-[11px] font-mono text-zinc-600 mt-8 max-w-md mx-auto">
            Your submission is kept confidential and used only to evaluate your inquiry. We retain it
            for as long as reasonably needed to respond — see our{" "}
            <a href="/privacy" className="text-ash-400 hover:text-ember-400 underline transition-colors duration-300">Privacy Policy</a>.
          </p>
        </div>
      </section>

      <ScrollToTop />
    </main>
  );
}
