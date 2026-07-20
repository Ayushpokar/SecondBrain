import { Github, X } from "lucide-react";

export function RepoManagerHeader({ connectedCount, onClose, isDark, border, text, muted }: any) {
  return (
    <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${border}` }}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(124,111,247,0.15)" }}>
          <Github className="w-5 h-5" style={{ color: "#7c6ff7" }} />
        </div>
        <div>
          <p className="font-semibold text-sm" style={{ color: text }}>Repositories</p>
          <p className="text-xs" style={{ color: muted, fontFamily: "monospace" }}>devraj · {connectedCount} connected</p>
        </div>
      </div>
      <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ color: muted }}
        onMouseEnter={e => (e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)")}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}