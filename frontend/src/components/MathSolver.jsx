import { useState, useRef } from "react";
import { solveMath } from "../api";

const EXAMPLES = [
  { label: "Arithmetic",       expr: "12 + 8 * 3",       icon: "＋" },
  { label: "Square root",      expr: "sqrt(144)",         icon: "√" },
  { label: "Linear equation",  expr: "2x + 5 = 15",      icon: "x" },
  { label: "Quadratic",        expr: "x**2 - 5*x + 6 = 0", icon: "x²" },
  { label: "Power",            expr: "2**10",             icon: "^" },
  { label: "Fraction",         expr: "355/113",           icon: "÷" },
];

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button
      onClick={handle}
      className="text-[10px] text-white/25 hover:text-white/60 transition-colors px-2 py-0.5 rounded-md hover:bg-white/[0.05]"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export default function MathSolver() {
  const [problem, setProblem] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const inputRef = useRef(null);

  const handleSolve = async (expr) => {
    const p = (expr ?? problem).trim();
    if (!p) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const data = await solveMath(p);
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data.result);
        setHistory((h) => [{ problem: p, result: data.result }, ...h].slice(0, 8));
      }
    } catch {
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSolve();
  };

  const loadExample = (expr) => {
    setProblem(expr);
    setResult(null);
    setError(null);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-white/[0.05] shrink-0">
        <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-base">
          ∑
        </div>
        <div>
          <p className="text-sm font-semibold text-white/80">Math Solver</p>
          <p className="text-[11px] text-white/25">Powered by SymPy</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

        {/* Input block */}
        <div className="space-y-3">
          <label className="block text-[11px] font-semibold text-white/25 uppercase tracking-[0.12em]">
            Expression
          </label>
          <div className="flex gap-2 items-center bg-[#111] border border-white/[0.07] rounded-2xl px-3 py-2 focus-within:border-indigo-500/40 focus-within:ring-1 focus-within:ring-indigo-500/15 transition-all">
            <span className="text-white/20 font-mono text-sm select-none">f(x)</span>
            <input
              ref={inputRef}
              type="text"
              value={problem}
              onChange={(e) => { setProblem(e.target.value); setResult(null); setError(null); }}
              onKeyDown={handleKeyDown}
              placeholder="e.g. 2x + 5 = 15"
              className="flex-1 bg-transparent text-sm text-white/80 placeholder-white/20 outline-none font-mono"
            />
            {problem && (
              <button
                onClick={() => { setProblem(""); setResult(null); setError(null); inputRef.current?.focus(); }}
                className="text-white/20 hover:text-white/50 transition-colors text-xs"
              >✕</button>
            )}
          </div>

          <button
            onClick={() => handleSolve()}
            disabled={loading || !problem.trim()}
            className="btn-primary w-full text-sm font-semibold shadow-lg shadow-indigo-500/15 disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Solving…
              </span>
            ) : (
              <span>Solve <span className="opacity-50 ml-1">↵</span></span>
            )}
          </button>
        </div>

        {/* Result */}
        {(result !== null || error) && (
          <div className={`rounded-2xl border p-4 msg-animate ${error ? "border-red-500/20 bg-red-500/[0.04]" : "border-indigo-500/20 bg-indigo-500/[0.04]"}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0 mt-0.5 ${error ? "bg-red-500/10 text-red-400" : "bg-indigo-500/15 text-indigo-400"}`}>
                  {error ? "!" : "="}
                </div>
                <div>
                  <p className={`text-[10px] uppercase tracking-[0.12em] font-semibold mb-1 ${error ? "text-red-400/70" : "text-indigo-400/70"}`}>
                    {error ? "Error" : "Result"}
                  </p>
                  <p className={`font-mono text-base leading-relaxed ${error ? "text-red-300" : "text-white/90"}`}>
                    {error || result}
                  </p>
                </div>
              </div>
              {!error && <CopyButton text={result} />}
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-white/20 uppercase tracking-[0.12em] mb-2">Recent</p>
            <div className="space-y-1">
              {history.map((h, i) => (
                <button
                  key={i}
                  onClick={() => { setProblem(h.problem); setResult(h.result); setError(null); }}
                  className="flex items-center justify-between w-full px-3 py-2 rounded-xl hover:bg-white/[0.03] transition-colors group text-left"
                >
                  <span className="font-mono text-xs text-white/35 group-hover:text-white/60 transition-colors truncate">{h.problem}</span>
                  <span className="font-mono text-xs text-indigo-400/50 group-hover:text-indigo-400 transition-colors ml-2 shrink-0">= {h.result}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Examples */}
        <div>
          <p className="text-[11px] font-semibold text-white/20 uppercase tracking-[0.12em] mb-3">Examples</p>
          <div className="grid grid-cols-2 gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex.expr}
                onClick={() => loadExample(ex.expr)}
                className="flex flex-col gap-1 px-3 py-3 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:border-indigo-500/30 hover:bg-indigo-500/[0.04] transition-all duration-150 group text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-indigo-400/50 group-hover:text-indigo-400 font-mono transition-colors w-5">{ex.icon}</span>
                  <span className="text-[11px] text-white/30 group-hover:text-white/60 transition-colors font-medium">{ex.label}</span>
                </div>
                <span className="font-mono text-[11px] text-white/20 group-hover:text-white/50 transition-colors ml-7">{ex.expr}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
