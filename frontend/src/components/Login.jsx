import { useState } from "react";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = username.trim();
    if (!name) { setError("Please enter a username."); return; }
    if (name.length < 2 || name.length > 24) { setError("Username must be 2–24 characters."); return; }
    onLogin(name);
  };

  return (
    <div className="h-full flex items-center justify-center px-4 overflow-hidden">
      {/* Ambient orbs */}
      <div className="orb absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="orb-2 absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-violet-600/10 blur-[100px] pointer-events-none" />

      {/* Fine grid */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,102,241,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.8) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative w-full max-w-[380px] fade-up">
        {/* Logo */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-2xl shadow-indigo-500/30 mb-5">
            <span className="text-white font-black text-xl tracking-tighter">AI</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-1">
            AISHI <span className="font-light text-white/40">Tech Chat</span>
          </h1>
          <p className="text-sm text-white/35 mt-2">
            Real-time chat · Math solver · No password required
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8 shadow-2xl shadow-black/50">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-semibold text-white/30 uppercase tracking-[0.12em] mb-2.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(""); }}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="e.g. alex_dev"
                autoFocus
                className="input-field text-sm"
              />
              {error && (
                <p className="mt-2 text-xs text-red-400/90 flex items-center gap-1.5">
                  <span>⚠</span> {error}
                </p>
              )}
            </div>

            <button type="submit" className="btn-primary w-full text-sm font-semibold shadow-lg shadow-indigo-500/20">
              Enter Chat Room
              <span className="ml-2 opacity-70">→</span>
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/[0.05] flex items-center justify-center gap-4">
            {[
              { icon: "⚡", text: "Instant" },
              { icon: "🔒", text: "Anonymous" },
              { icon: "∑", text: "Math AI" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-1.5">
                <span className="text-xs">{icon}</span>
                <span className="text-[11px] text-white/25">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
