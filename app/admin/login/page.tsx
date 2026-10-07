"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginForm />
    </Suspense>
  );
}

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Incorrect password.");
        setLoading(false);
        return;
      }
      const next = searchParams.get("next") || "/admin";
      router.push(next);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030308] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <img src="/logo/hak-logo.png" alt="BLAKASH" className="w-8 h-8" style={{ filter: "drop-shadow(0 0 8px rgba(217,74,30,0.5))" }} />
          <div>
            <span className="text-lg font-black tracking-wider font-cinzel"
              style={{
                background: "linear-gradient(135deg,#EDE6DA 0%,#C4C7C8 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
              BLAKASH
            </span>
            <span className="text-[10px] text-zinc-500 font-mono tracking-widest block -mt-1">ADMIN PANEL</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border border-white/10 p-8" style={{ background: "rgba(255,255,255,0.02)" }}>
          <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-2.5">
            Admin Password
          </label>
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600
              focus:outline-none focus:border-ember-500/50 focus:shadow-[0_0_20px_rgba(217,74,30,0.06)] transition-all duration-300"
          />
          {error && <p className="text-red-400 text-xs font-mono mt-3">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 flex items-center justify-center gap-3 bg-black/50 border border-ash-500/50 hover:border-ember-400/70
              px-6 py-3 font-bold text-bone text-sm uppercase tracking-widest transition-all duration-300 cursor-pointer disabled:opacity-50"
            style={{ borderRadius: "10px" }}
          >
            {loading ? "Checking..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
