import { useState, useEffect } from "react";
import Login from "./components/Login";
import ChatPanel from "./components/ChatPanel";
import MathSolver from "./components/MathSolver";

const LS_KEY = "aishi_username";

function Avatar({ name, size = "sm" }) {
  const initials = name.slice(0, 2).toUpperCase();
  const colors = [
    "from-violet-500 to-indigo-500",
    "from-fuchsia-500 to-purple-500",
    "from-sky-500 to-blue-500",
    "from-emerald-500 to-teal-500",
    "from-rose-500 to-pink-500",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  const sz = size === "sm" ? "w-7 h-7 text-[10px]" : "w-9 h-9 text-xs";
  return (
    <div
      className={`${sz} rounded-full bg-gradient-to-br ${color} flex items-center justify-center font-bold text-white shrink-0 select-none`}
    >
      {initials}
    </div>
  );
}

export { Avatar };

export default function App() {
  const [username, setUsername] = useState(() => localStorage.getItem(LS_KEY) || null);

  const handleLogin = (name) => {
    localStorage.setItem(LS_KEY, name);
    setUsername(name);
  };

  const handleLeave = () => {
    localStorage.removeItem(LS_KEY);
    setUsername(null);
  };

  if (!username) {
    return (
      <div className="h-screen w-screen bg-[#0a0a0a] relative overflow-hidden">
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#0a0a0a] flex flex-col overflow-hidden">
      {/* Navbar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-white/[0.05] shrink-0 bg-[#0a0a0a]/90 backdrop-blur-md z-10">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <span className="text-white font-black text-xs tracking-tight">AI</span>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0a0a0a] pulse-dot" />
          </div>
          <div>
            <span className="text-sm font-bold text-white tracking-tight">AISHI</span>
            <span className="text-sm font-light text-white/40 ml-1 tracking-tight">Tech Chat</span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <Avatar name={username} size="sm" />
            <span className="text-xs text-white/50">
              <span className="text-white/80 font-medium">{username}</span>
            </span>
          </div>
          <button
            onClick={handleLeave}
            className="text-xs text-white/30 hover:text-white/70 transition-colors px-2 py-1.5 rounded-lg hover:bg-white/[0.04]"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex flex-1 overflow-hidden">
        <section className="flex flex-col w-[58%] border-r border-white/[0.05] overflow-hidden">
          <ChatPanel username={username} />
        </section>
        <section className="flex flex-col w-[42%] overflow-hidden">
          <MathSolver />
        </section>
      </main>
    </div>
  );
}
