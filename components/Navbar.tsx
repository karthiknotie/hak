"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

type NavItem = { label: string; id: string } | { label: string; href: string };

const navItems: NavItem[] = [
  { label: "Studio", id: "about" },
  { label: "Vision", id: "vision" },
  { label: "Game", id: "featured" },
  { label: "Contact", id: "contact" },
  { label: "Careers", href: "/careers" },
];

// Shared site navigation. On the homepage, links are in-page anchors with a
// scroll-spy active state; on every other route they become cross-page
// anchors back to "/". Kept deliberately minimal — no status indicators,
// no terminal language.
export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    if (!isHome) return;
    const ids = ["home", "featured", "about", "vision", "contact"];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-80px 0px -65% 0px", threshold: 0 }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [isHome]);

  const hrefFor = (id: string) => (isHome ? `#${id}` : `/#${id}`);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-black/40"
      style={{ borderBottom: "1px solid rgba(142,147,149,0.14)" }}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between md:grid md:grid-cols-[1fr_auto_1fr]">
        <a href={isHome ? "#home" : "/"} className="flex items-center py-2 pr-4 justify-self-start">
          <img
            src="/logo/Logo%20header.png"
            alt="BLAKASH"
            className="w-12 h-12 sm:w-14 sm:h-14"
          />
        </a>

        <div className="hidden md:flex gap-10 justify-self-center">
          {navItems.map((item) => {
            const isActive = "id" in item ? isHome && activeSection === item.id : pathname === item.href;
            const href = "id" in item ? hrefFor(item.id) : item.href;
            return (
              <a
                key={item.label}
                href={href}
                className={`relative text-sm tracking-wide transition-colors duration-300 group py-1 ${
                  isActive ? "text-bone" : "text-zinc-400 hover:text-bone"
                }`}
              >
                {item.label}
                <span
                  className={`absolute bottom-0 left-0 h-px transition-all duration-300 ${
                    isActive ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                  style={{ background: "#8E9395" }}
                />
              </a>
            );
          })}
        </div>

        <div className="flex items-center gap-3 justify-self-end">
          <a
            href="/collaborate"
            className="hidden md:flex items-center px-6 py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-ash-300 hover:text-bone border border-ash-500/40 hover:border-ember-400/60 transition-all duration-300"
            style={{ borderRadius: "8px" }}
          >
            Let&apos;s Collaborate
          </a>
          <button
            className="md:hidden text-bone text-2xl w-10 h-10 flex items-center justify-center"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden backdrop-blur-2xl bg-black/90" style={{ borderTop: "1px solid rgba(142,147,149,0.1)" }}>
          {navItems.map((item) => (
            <a
              key={item.label}
              href={"id" in item ? hrefFor(item.id) : item.href}
              className="block px-6 py-4 text-sm tracking-wide uppercase text-zinc-300 hover:text-bone transition-colors"
              style={{ borderBottom: "1px solid rgba(142,147,149,0.08)" }}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <a
            href="/collaborate"
            className="block px-6 py-4 text-sm tracking-wide uppercase text-ash-300 font-bold"
            onClick={() => setMenuOpen(false)}
          >
            Let&apos;s Collaborate
          </a>
        </div>
      )}
    </nav>
  );
}
