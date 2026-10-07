"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: "fa-solid fa-grid-2" },
  { label: "Projects", href: "/admin/projects", icon: "fa-solid fa-gamepad" },
  { label: "Portfolio", href: "/admin/portfolio", icon: "fa-solid fa-images" },
  { label: "Analytics", href: "/admin/analytics", icon: "fa-solid fa-chart-line" },
  { label: "Messages", href: "/admin/messages", icon: "fa-solid fa-envelope" },
  { label: "Settings", href: "/admin/settings", icon: "fa-solid fa-gear" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  // The login screen has its own full-page layout — skip the sidebar shell.
  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#030308] text-white flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 z-50 border-r border-white/8 backdrop-blur-2xl flex flex-col transition-transform duration-300
          lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: "rgba(5,5,15,0.95)" }}
      >
        {/* Logo */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-white/8">
          <img
            src="/logo/hak-logo.png"
            alt="BLAKASH"
            className="w-8 h-8"
            style={{ filter: "drop-shadow(0 0 8px rgba(217,74,30,0.5))" }}
          />
          <div>
            <span
              className="text-lg font-black tracking-wider font-cinzel"
              style={{
                background: "linear-gradient(135deg,#EDE6DA 0%,#C4C7C8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              BLAKASH
            </span>
            <span className="text-[10px] text-zinc-500 font-mono tracking-widest block -mt-1">
              ADMIN PANEL
            </span>
          </div>
          <button
            className="ml-auto lg:hidden text-zinc-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <i className="fa-solid fa-xmark text-lg" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? "bg-ember-500/10 text-ash-400 border border-ash-500/25"
                      : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
              >
                <i className={`${item.icon} w-5 text-center`} />
                {item.label}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-ember-400 animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-white/8 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-zinc-500 hover:text-ember-400 hover:bg-white/5 transition-all duration-200"
          >
            <i className="fa-solid fa-arrow-left w-5 text-center" />
            Back to Site
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-zinc-500 hover:text-red-400 hover:bg-white/5 transition-all duration-200 cursor-pointer"
          >
            <i className="fa-solid fa-right-from-bracket w-5 text-center" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-6 border-b border-white/8 backdrop-blur-2xl bg-[#030308]/80">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-zinc-400 hover:text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <i className="fa-solid fa-bars text-lg" />
            </button>
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/8 text-sm text-zinc-500">
              <i className="fa-solid fa-magnifying-glass text-xs" />
              <span className="font-mono text-xs">Search...</span>
              <kbd className="ml-8 px-1.5 py-0.5 rounded border border-white/10 text-[10px] font-mono text-zinc-600">
                ⌘K
              </kbd>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative text-zinc-400 hover:text-white transition-colors">
              <i className="fa-solid fa-bell" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-ember-400 animate-pulse" />
            </button>
            <div className="w-px h-6 bg-white/10" />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ash-400 to-ash-600 flex items-center justify-center text-xs font-bold">
                A
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">Arun Kumar</p>
                <p className="text-[11px] text-zinc-500 font-mono">Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
