"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";

const categories = [
  {
    id: "creators",
    label: "Creators",
    icon: "✦",
    desc: "Artists & content creators",
    longDesc: "You create content — videos, streams, reviews, tutorials, or social media — and want to partner with BLAKASH to showcase our games or co-create original content.",
    fields: [
      { name: "channel", label: "Channel / Platform", placeholder: "YouTube, Twitch, Instagram, etc.", type: "text", required: true },
      { name: "audience", label: "Audience Size", placeholder: "e.g. 50K subscribers", type: "text" },
      { name: "content_type", label: "Content Type", placeholder: "Gameplay, reviews, tutorials, streams...", type: "text" },
      { name: "proposal", label: "Collaboration Idea", placeholder: "Tell us what you'd like to create together...", type: "textarea", required: true },
    ],
  },
  {
    id: "artists",
    label: "Artists",
    icon: "◈",
    desc: "2D, 3D & concept artists",
    longDesc: "You're a 2D, 3D, or concept artist looking for freelance, contract, or full-time collaboration on characters, environments, creatures, props, or visual development.",
    fields: [
      { name: "specialty", label: "Art Specialty", placeholder: "Character art, environment, VFX, UI...", type: "text" },
      { name: "tools", label: "Primary Tools", placeholder: "ZBrush, Blender, Maya, Substance...", type: "text" },
      { name: "portfolio_link", label: "Portfolio Link", placeholder: "ArtStation, Behance, personal site...", type: "url", required: true },
      { name: "availability", label: "Availability", placeholder: "Full-time, freelance, contract...", type: "text" },
      { name: "message", label: "About Your Work", placeholder: "Describe your style, experience, and what excites you...", type: "textarea", required: true },
    ],
  },
  {
    id: "developers",
    label: "Developers",
    icon: "⚙",
    desc: "Game & web engineers",
    longDesc: "You're a game developer, web engineer, or technical artist who wants to contribute to BLAKASH projects — from gameplay programming to tools, networking, or web platform work.",
    fields: [
      { name: "role", label: "Developer Role", placeholder: "Gameplay programmer, tools dev, web dev...", type: "text" },
      { name: "tech_stack", label: "Tech Stack", placeholder: "Unreal C++, Blueprint, React, Node...", type: "text" },
      { name: "experience", label: "Years of Experience", placeholder: "e.g. 3 years", type: "text" },
      { name: "github", label: "GitHub / Portfolio", placeholder: "Link to your work or repositories...", type: "url", required: true },
      { name: "interest", label: "What Interests You", placeholder: "Which BLAKASH project excites you and why...", type: "textarea", required: true },
    ],
  },
  {
    id: "studios",
    label: "Studios",
    icon: "⬡",
    desc: "Indie & AA studios",
    longDesc: "You represent an indie or AA studio and are interested in co-development, asset sharing, knowledge exchange, joint ventures, or cross-promotional partnerships.",
    fields: [
      { name: "studio_name", label: "Studio Name", placeholder: "Your studio or company name", type: "text", required: true },
      { name: "website", label: "Studio Website", placeholder: "https://...", type: "url" },
      { name: "team_size", label: "Team Size", placeholder: "e.g. 5-10 people", type: "text" },
      { name: "current_project", label: "Current Project", placeholder: "Brief description of what you're working on...", type: "text" },
      { name: "collab_type", label: "Collaboration Type", placeholder: "Co-dev, asset sharing, cross-promo...", type: "text" },
      { name: "proposal", label: "Partnership Proposal", placeholder: "Tell us about the collaboration you envision...", type: "textarea", required: true },
    ],
  },
  {
    id: "publishers",
    label: "Publishers",
    icon: "▲",
    desc: "Game publishers & labels",
    longDesc: "You're a publisher, investor, or label interested in publishing, funding, marketing, or distributing BLAKASH titles across platforms and regions.",
    fields: [
      { name: "company", label: "Company / Label", placeholder: "Publisher or label name", type: "text", required: true },
      { name: "website", label: "Company Website", placeholder: "https://...", type: "url" },
      { name: "titles_published", label: "Notable Titles", placeholder: "Games you've published or funded...", type: "text" },
      { name: "platforms", label: "Target Platforms", placeholder: "PC, Console, Mobile, Cloud...", type: "text" },
      { name: "interest", label: "Which BLAKASH Title", placeholder: "Mr. Edward", type: "text" },
      { name: "proposal", label: "Publishing Proposal", placeholder: "Describe the deal structure or partnership you're proposing...", type: "textarea", required: true },
    ],
  },
  {
    id: "other",
    label: "Other",
    icon: "✳",
    desc: "Anything else",
    longDesc: "Not quite a creator, artist, developer, studio, or publisher? Tell us what you have in mind — licensing, events, community, or anything else — and we'll figure out the right fit together.",
    fields: [
      { name: "interest_area", label: "Area of Interest", placeholder: "e.g. licensing, merchandising, events, community...", type: "text" },
      { name: "background", label: "Your Background", placeholder: "Tell us a bit about yourself or your organization...", type: "text" },
      { name: "proposal", label: "Your Proposal", placeholder: "Describe what you have in mind and how we might work together...", type: "textarea", required: true },
    ],
  },
];

export default function CollaboratePage() {
  return (
    <Suspense>
      <CollaborateContent />
    </Suspense>
  );
}

function CollaborateContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";
  const [selected, setSelected] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialCategory) {
      const match = categories.find((c) => c.id === initialCategory);
      if (match) setSelected(match.id);
    }
  }, [initialCategory]);

  useEffect(() => {
    if (selected && formRef.current) {
      setTimeout(() => {
        const el = formRef.current;
        if (!el) return;
        const lenis = (window as unknown as Record<string, { scrollTo: (target: HTMLElement, opts?: Record<string, unknown>) => void; resize: () => void }>).__lenis;
        if (lenis) {
          lenis.resize();
          lenis.scrollTo(el, { offset: -100, duration: 1.2 });
        } else {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 200);
    }
  }, [selected]);

  const activeCategory = categories.find((c) => c.id === selected);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!activeCategory) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/collaborate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: activeCategory.id,
          name: formData.name || "",
          email: formData.email || "",
          data: formData,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setSubmitError(body.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      setSubmitted(true);
    } catch {
      setSubmitError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelect = (id: string) => {
    setSelected(id);
    setFormData({});
    setSubmitted(false);
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <style>{`
        @keyframes floatUp {
          0%,100% { transform: translateY(0px); }
          50%     { transform: translateY(-6px); }
        }
        @keyframes neonFlicker {
          0%,19%,21%,23%,25%,54%,56%,100% { opacity:1; text-shadow:0 0 8px rgba(217,74,30,.9),0 0 20px rgba(217,74,30,.5); }
          20%,24%,55% { opacity:.55; text-shadow:none; }
        }
        @keyframes scanMove {
          0%   { top: -4px; }
          100% { top: 100%; }
        }
        @keyframes bgDriftSlow {
          0%,100% { transform:translate(0,0) scale(1); }
          33% { transform:translate(30px,-20px) scale(1.05); }
          66% { transform:translate(-20px,15px) scale(0.98); }
        }
        @keyframes cardGlow {
          0%,100% { box-shadow: 0 0 0 0 rgba(217,74,30,0); }
          50% { box-shadow: 0 0 30px 0 rgba(217,74,30,0.08); }
        }
        @keyframes successPulse {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes checkDraw {
          0% { stroke-dashoffset: 30; }
          100% { stroke-dashoffset: 0; }
        }
      `}</style>

      <Navbar />

      {/* ══ HERO ══ */}
      <section className="relative pt-28 sm:pt-32 pb-12 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 20%, rgba(142,147,149,0.06) 0%, transparent 70%)" }} />
        <div className="absolute pointer-events-none" style={{ top: "10%", right: "15%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(142,147,149,0.04) 0%, transparent 60%)", animation: "bgDriftSlow 20s ease-in-out infinite" }} />
        <div className="absolute pointer-events-none" style={{ bottom: "10%", left: "10%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(142,147,149,0.04) 0%, transparent 60%)", animation: "bgDriftSlow 25s ease-in-out infinite 3s" }} />

        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2.5 mb-8 px-5 py-2 rounded-full border border-ash-500/25 bg-black/50 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-ash-400" />
            <span className="text-[11px] font-mono text-zinc-400 tracking-widest uppercase">
              Open for Collaboration
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black font-cinzel mb-6">
            <span style={{
              background: "linear-gradient(160deg, #E5E5E0 0%, #A8ACAE 32%, #626668 58%, #D0D2D2 78%, #E5E5E0 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              Let&apos;s Build
            </span>
            <br />
            <span className="text-white">Something Epic</span>
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto text-base sm:text-lg leading-8 mb-4">
            Choose your role below. Each category has a tailored form so we can
            understand exactly how we can work together.
          </p>
          <p className="text-ash-400/50 font-mono text-xs tracking-widest uppercase">
            Select your category to begin
          </p>
        </div>
      </section>

      {/* ══ CATEGORY SELECTOR ══ */}
      <section className="pb-8 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
            {categories.map((cat) => {
              const isActive = selected === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelect(cat.id)}
                  className={`group relative flex flex-col items-center text-center p-5 sm:p-8 rounded-2xl border backdrop-blur-sm
                    transition-all duration-400 cursor-pointer overflow-hidden
                    ${isActive
                      ? "border-ash-400/60 -translate-y-2 shadow-[0_8px_50px_rgba(217,74,30,0.12)]"
                      : "border-white/8 hover:border-ember-400/30 hover:-translate-y-2 hover:shadow-[0_8px_40px_rgba(217,74,30,0.06)]"
                    }`}
                  style={{ background: isActive ? "rgba(217,74,30,0.05)" : "rgba(255,255,255,0.03)" }}
                >

                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: "linear-gradient(135deg,rgba(217,74,30,0.06) 0%,transparent 60%)" }} />

                  <span className={`text-3xl mb-4 transition-all duration-300 relative z-10
                    ${isActive ? "text-ash-400 scale-110" : "text-ash-400/60 group-hover:text-ember-400"}`}
                    style={isActive ? { filter: "drop-shadow(0 0 12px rgba(217,74,30,0.6))", animation: "floatUp 3s ease-in-out infinite" } : {}}>
                    {cat.icon}
                  </span>
                  <h3 className={`font-bold text-sm uppercase tracking-wider mb-2 transition-colors duration-300 relative z-10
                    ${isActive ? "text-ash-300" : "text-white group-hover:text-ember-300"}`}>
                    {cat.label}
                  </h3>
                  <p className={`text-xs font-mono transition-colors duration-300 relative z-10
                    ${isActive ? "text-zinc-400" : "text-zinc-600 group-hover:text-zinc-400"}`}>
                    {cat.desc}
                  </p>

                  {isActive && (
                    <div className="absolute -bottom-px left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-ember-400 to-transparent" />
                  )}
                  {!isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-px scale-x-0 group-hover:scale-x-100 transition-transform duration-500
                      bg-gradient-to-r from-transparent via-ember-400/50 to-transparent" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ FORM SECTION ══ */}
      {activeCategory && (
        <section ref={formRef} className="py-16 relative">
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(142,147,149,0.05) 0%, transparent 70%)" }} />

          <div className="max-w-3xl mx-auto px-6 relative z-10">
            {/* Category header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-ash-400/50" />
                <span className="text-3xl" style={{ filter: "drop-shadow(0 0 10px rgba(142,147,149,0.5))" }}>
                  {activeCategory.icon}
                </span>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-ash-400/50" />
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold font-cinzel mb-4">
                Collaborate as{" "}
                <span style={{
                  background: "linear-gradient(135deg,#C4C7C8,#8E9395)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                }}>
                  {activeCategory.label === "Studios" ? "a Studio" :
                   activeCategory.label === "Publishers" ? "a Publisher" :
                   activeCategory.label === "Other" ? "Something Else" :
                   `${activeCategory.label.endsWith("s") ? activeCategory.label.slice(0, -1) : activeCategory.label}`}
                </span>
              </h2>
              <p className="text-zinc-400 max-w-xl mx-auto leading-7 text-sm sm:text-base">
                {activeCategory.longDesc}
              </p>
            </div>

            {/* Form card */}
            {!submitted ? (
              <form onSubmit={handleSubmit}>
                <div
                  className="rounded-2xl border border-white/10 p-6 sm:p-10 backdrop-blur-xl overflow-hidden relative"
                  style={{ background: "rgba(5,5,15,0.8)" }}
                >
                  {/* Form header */}
                  <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/8">
                    <span className="font-mono text-[10px] text-zinc-600 tracking-widest uppercase">
                      Collaboration Form
                    </span>
                    <div className="h-px flex-1 bg-ash-500/15" />
                  </div>

                  {/* Common fields */}
                  <div className="grid sm:grid-cols-2 gap-5 mb-6">
                    <div>
                      <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-2.5">
                        Full Name <span className="text-ash-400">*</span>
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="Your full name"
                        value={formData.name || ""}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600
                          focus:outline-none focus:border-ember-500/50 focus:shadow-[0_0_20px_rgba(217,74,30,0.06)] transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-2.5">
                        Email Address <span className="text-ash-400">*</span>
                      </label>
                      <input
                        required
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email || ""}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600
                          focus:outline-none focus:border-ember-500/50 focus:shadow-[0_0_20px_rgba(217,74,30,0.06)] transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* Category-specific fields */}
                  <div className="space-y-5">
                    {activeCategory.fields.map((field) => (
                      <div key={field.name}>
                        <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-2.5">
                          {field.label} {field.required && <span className="text-ash-400">*</span>}
                        </label>
                        {field.type === "textarea" ? (
                          <textarea
                            required={field.required}
                            placeholder={field.placeholder}
                            value={formData[field.name] || ""}
                            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                            rows={5}
                            className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 resize-none
                              focus:outline-none focus:border-ember-500/50 focus:shadow-[0_0_20px_rgba(217,74,30,0.06)] transition-all duration-300"
                          />
                        ) : (
                          <input
                            required={field.required}
                            type={field.type}
                            placeholder={field.placeholder}
                            value={formData[field.name] || ""}
                            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                            className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600
                              focus:outline-none focus:border-ember-500/50 focus:shadow-[0_0_20px_rgba(217,74,30,0.06)] transition-all duration-300"
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Submit */}
                  <div className="mt-10 pt-6 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[11px] font-mono text-zinc-600">
                      {submitError ? <span className="text-red-400">{submitError}</span> : "We typically respond within 48 hours."}
                    </p>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full sm:w-auto flex items-center justify-center gap-3 bg-black/50 border border-ash-500/50 hover:border-ember-400/70
                        px-10 py-3.5 font-bold text-bone text-sm uppercase tracking-widest transition-all duration-300 cursor-pointer
                        hover:shadow-[0_0_30px_rgba(217,74,30,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ borderRadius: "10px" }}
                    >
                      {submitting ? "Sending..." : <>Submit Request <span>→</span></>}
                    </button>
                  </div>
                  <p className="text-[11px] font-mono text-zinc-600 text-center mt-5">
                    Your submission is kept confidential and used only to evaluate your inquiry. We retain it
                    for as long as reasonably needed to respond — see our{" "}
                    <a href="/privacy" className="text-ash-400 hover:text-ember-400 underline transition-colors duration-300">Privacy Policy</a>.
                  </p>
                </div>
              </form>
            ) : (
              /* Success state */
              <div
                className="rounded-2xl border border-ash-500/30 p-10 sm:p-16 backdrop-blur-xl text-center relative overflow-hidden"
                style={{ background: "rgba(142,147,149,0.04)" }}
              >
                <div className="mb-6" style={{ animation: "successPulse 0.6s ease-out forwards" }}>
                  <div className="w-20 h-20 mx-auto rounded-full border-2 border-ash-400 flex items-center justify-center"
                    style={{ boxShadow: "0 0 40px rgba(142,147,149,0.25)" }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-ash-400">
                      <polyline points="20 6 9 17 4 12" style={{ strokeDasharray: 30, animation: "checkDraw 0.5s ease-out 0.3s forwards", strokeDashoffset: 30 }} />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold font-cinzel mb-3">
                  Request Sent!
                </h3>
                <p className="text-zinc-400 max-w-md mx-auto mb-8 leading-7">
                  Thanks for reaching out as{" "}
                  <span className="text-ash-400 font-medium">
                    {activeCategory.label === "Studios" ? "a Studio" :
                     activeCategory.label === "Publishers" ? "a Publisher" :
                     activeCategory.label === "Other" ? "something else" :
                     `${activeCategory.label.endsWith("s") ? activeCategory.label.slice(0, -1) : activeCategory.label}`}
                  </span>
                  . We&apos;ll review your submission and get back to you within 48 hours.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => { setSubmitted(false); setFormData({}); }}
                    className="px-6 py-3 text-xs font-bold uppercase tracking-widest border border-ash-500/40 text-ash-400
                      hover:bg-ember-500/10 transition-all duration-300 cursor-pointer"
                    style={{ borderRadius: "10px" }}
                  >
                    Submit Another
                  </button>
                  <Link
                    href="/"
                    className="px-6 py-3 text-xs font-bold uppercase tracking-widest border border-white/10 text-zinc-400
                      hover:bg-white/5 hover:text-white transition-all duration-300 text-center"
                    style={{ borderRadius: "10px" }}
                  >
                    Back to Home
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ══ FOOTER ══ */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-[11px] font-mono text-zinc-700">
          <span>BLAKASH · Collaborate</span>
          <span>&copy; 2026 BLAKASH</span>
        </div>
      </footer>
    </main>
  );
}
