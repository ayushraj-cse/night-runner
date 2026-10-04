"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";

const ROLES = [
  { value: "student", label: "Student" },
  { value: "runner", label: "Runner" },
];

const DEMO_ACCOUNTS = [
  { label: "Rahul", username: "rahul_demo", password: "demo1234" },
  { label: "Priya", username: "priya_demo", password: "demo1234" },
  { label: "Runner", username: "runner_demo", password: "demo1234" },
];

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", username: "", password: "", role: "student" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Make sure the fixed demo accounts exist as soon as the login page loads,
  // so they're ready to use without signing up by hand.
  useEffect(() => {
    fetch("/api/dev/seed", { method: "POST" }).catch(() => {});
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function useDemo(acc) {
    setMode("login");
    setError("");
    setForm((f) => ({ ...f, username: acc.username, password: acc.password }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const url = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const payload =
        mode === "login" ? { username: form.username, password: form.password } : form;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl border border-line rounded-sm overflow-hidden flex flex-col md:flex-row bg-white">
        {/* Dark panel — the brand, the one sentence, a glimpse of the real feature */}
        <div className="md:flex-[1.15] bg-night text-white px-8 sm:px-12 py-12 flex flex-col justify-between min-h-[260px] md:min-h-[560px]">
          <div className="flex items-center gap-2.5">
            <Logo size={20} className="text-canvas" />
            <span className="text-[15px] font-semibold tracking-tight font-display">
              Night Canteen Runner
            </span>
          </div>

          <div className="my-10 md:my-0">
            <h1 className="font-display text-[28px] sm:text-[34px] leading-[1.15] font-semibold tracking-tight mb-4">
              One runner.
              <br />
              Every order accounted for.
            </h1>
            <p className="text-[15px] leading-relaxed text-night-soft max-w-sm">
              Group orders go to a single runner, one delivery at a time. Each
              person&apos;s outcome is recorded the moment food changes hands.
            </p>
          </div>

          <div className="flex items-center gap-2.5 text-[12.5px] text-night-soft border-t border-white/10 pt-5">
            <span className="h-1.5 w-1.5 rounded-full bg-lamp shrink-0" />
            <span>Runner status, requests, and history all update live.</span>
          </div>
        </div>

        {/* Light panel — the actual task */}
        <div className="flex-1 px-8 sm:px-12 py-12 flex flex-col justify-center">
          <p className="text-[12.5px] text-sub mb-2">Hostel ops desk</p>

          <div className="flex mb-7 rounded-sm bg-canvas border border-line p-1 text-sm font-medium w-fit">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`rounded-sm px-4 py-1.5 transition ${
                mode === "login" ? "bg-white shadow-sm text-ink" : "text-sub"
              }`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`rounded-sm px-4 py-1.5 transition ${
                mode === "signup" ? "bg-white shadow-sm text-ink" : "text-sub"
              }`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4 max-w-sm">
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-medium text-sub mb-1.5">Full name</label>
                <input
                  className="w-full rounded-sm border border-line px-3 py-2.5 text-sm focus:outline-none focus:border-night"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-sub mb-1.5">Username</label>
              <input
                className="w-full rounded-sm border border-line px-3 py-2.5 text-sm focus:outline-none focus:border-night"
                value={form.username}
                onChange={(e) => update("username", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-sub mb-1.5">Password</label>
              <input
                type="password"
                className="w-full rounded-sm border border-line px-3 py-2.5 text-sm focus:outline-none focus:border-night"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                required
              />
            </div>
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-medium text-sub mb-1.5">Role</label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => update("role", r.value)}
                      className={`rounded-sm border px-2 py-1.5 text-sm transition ${
                        form.role === r.value
                          ? "border-night bg-canvas text-ink font-medium"
                          : "border-line text-sub"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
                {form.role === "runner" && (
                  <p className="text-xs text-sub mt-1.5">
                    This desk supports exactly one runner account. If one already exists, use it
                    instead of signing up again.
                  </p>
                )}
              </div>
            )}

            {error && <p className="text-sm text-sleeping">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-sm bg-night text-white py-2.5 text-sm font-medium hover:bg-night/90 transition disabled:opacity-60"
            >
              {loading ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
            </button>
          </form>

          <div className="mt-7 max-w-sm">
            <p className="text-[11px] text-sub mb-2">
              Demo accounts — password <span className="font-mono">demo1234</span>
            </p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.username}
                  type="button"
                  onClick={() => useDemo(acc)}
                  className="rounded-sm border border-line bg-white px-2.5 py-2 text-left hover:border-night/40 transition"
                >
                  <p className="text-xs font-semibold text-ink">{acc.label}</p>
                  <p className="text-[11px] text-sub truncate">{acc.username}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
