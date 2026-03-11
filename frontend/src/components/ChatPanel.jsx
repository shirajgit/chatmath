import { useEffect, useRef, useState, useCallback } from "react";
import { createChatSocket } from "../api";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getInitials(name) {
  return name.slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = [
  "from-violet-500 to-indigo-500",
  "from-fuchsia-500 to-purple-600",
  "from-sky-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-500",
];

function avatarColor(name) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

function Avatar({ name }) {
  return (
    <div
      className={`w-7 h-7 rounded-full bg-gradient-to-br ${avatarColor(name)} flex items-center justify-center text-[10px] font-bold text-white shrink-0 select-none`}
    >
      {getInitials(name)}
    </div>
  );
}

// ─── System message ───────────────────────────────────────────────────────────

function SystemMsg({ text }) {
  return (
    <div className="flex justify-center my-3 msg-animate">
      <span className="inline-flex items-center gap-1.5 text-[11px] text-white/25 bg-white/[0.03] border border-white/[0.05] px-3 py-1 rounded-full">
        <span className="w-1 h-1 rounded-full bg-white/20" />
        {text}
      </span>
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function Bubble({ msg, isOwn, showAvatar, showName }) {
  return (
    <div className={`flex items-end gap-2 msg-animate ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar — always reserve space so bubbles don't shift */}
      <div className="w-7 shrink-0">
        {showAvatar && !isOwn && <Avatar name={msg.username} />}
      </div>

      <div className={`flex flex-col max-w-[72%] ${isOwn ? "items-end" : "items-start"}`}>
        {showName && !isOwn && (
          <span className="text-[11px] font-semibold text-white/40 mb-1 ml-1">
            {msg.username}
          </span>
        )}
        <div
          className={`group relative px-4 py-2.5 rounded-2xl text-sm leading-relaxed select-text ${
            isOwn
              ? "bg-indigo-600 text-white rounded-br-md"
              : "bg-[#191919] text-white/85 border border-white/[0.06] rounded-bl-md"
          }`}
        >
          {msg.text}
          {/* Timestamp tooltip on hover */}
          <span
            className={`absolute top-1/2 -translate-y-1/2 text-[10px] text-white/30 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none ${
              isOwn ? "right-full mr-2" : "left-full ml-2"
            }`}
          >
            {formatTime(msg.timestamp)}
          </span>
        </div>
      </div>

      {/* Mirror spacer for own messages */}
      <div className="w-7 shrink-0" />
    </div>
  );
}

// ─── ChatPanel ────────────────────────────────────────────────────────────────

export default function ChatPanel({ username }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const reconnectTimer = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const connect = useCallback(() => {
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    const ws = createChatSocket(username);
    socketRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setReconnecting(false);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        setMessages((prev) => [...prev, msg]);
      } catch { /* ignore */ }
    };

    ws.onclose = () => {
      setConnected(false);
      setReconnecting(true);
      reconnectTimer.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [username]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      socketRef.current?.close();
    };
  }, [connect]);

  const sendMessage = useCallback(() => {
    const text = input.trim();
    if (!text || socketRef.current?.readyState !== WebSocket.OPEN) return;
    socketRef.current.send(JSON.stringify({ text }));
    setInput("");
    inputRef.current?.focus();
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.05] shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-base">
            💬
          </div>
          <div>
            <p className="text-sm font-semibold text-white/80">Live Chat</p>
            <p className="text-[11px] text-white/25">Global room</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              connected ? "bg-emerald-400 pulse-dot" : reconnecting ? "bg-amber-400 pulse-dot" : "bg-red-500"
            }`}
          />
          <span className="text-[11px] text-white/30">
            {connected ? "Connected" : reconnecting ? "Reconnecting…" : "Offline"}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-xl">
              👋
            </div>
            <p className="text-xs text-white/25">No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            if (msg.type === "system") return <SystemMsg key={i} text={msg.text} />;
            const isOwn = msg.username === username;
            const prev = messages[i - 1];
            const sameUser = prev?.type === "message" && prev?.username === msg.username;
            return (
              <Bubble
                key={i}
                msg={msg}
                isOwn={isOwn}
                showAvatar={!sameUser}
                showName={!sameUser}
              />
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="px-4 py-4 border-t border-white/[0.05] shrink-0">
        <div className="flex gap-2 items-center bg-[#111] border border-white/[0.07] rounded-2xl px-3 py-2 focus-within:border-indigo-500/40 focus-within:ring-1 focus-within:ring-indigo-500/15 transition-all">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={connected ? "Write a message…" : "Waiting for connection…"}
            disabled={!connected}
            className="flex-1 bg-transparent text-sm text-white/80 placeholder-white/20 outline-none disabled:cursor-not-allowed"
          />
          <button
            onClick={sendMessage}
            disabled={!connected || !input.trim()}
            className="w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-90 shrink-0"
            title="Send (Enter)"
          >
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-white/15 mt-1.5 text-center">
          Press <kbd className="font-mono bg-white/[0.05] px-1 rounded">Enter</kbd> to send
        </p>
      </div>
    </div>
  );
}
