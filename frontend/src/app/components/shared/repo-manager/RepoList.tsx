import { ExternalLink, Lock, Star, Globe } from "lucide-react";
import { Repo } from "../../../types";

// Extracted from original file
const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3b82f6", Rust: "#f97316", Python: "#a855f7", Go: "#06b6d4",
  HCL: "#8b5cf6", JavaScript: "#eab308", Shell: "#22c55e", Ruby: "#e11d48", Swift: "#f97316",
};

export function RepoList({ shown, onToggle, isDark, border, text, muted }: any) {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide py-2">
      {shown.map((repo: Repo) => (
        <div key={repo.id} className="flex items-center gap-3 px-5 py-3 transition-colors" style={{ borderBottom: `1px solid ${border}` }}
          onMouseEnter={e => (e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${LANGUAGE_COLORS[repo.language] || "#888"}20` }}>
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: LANGUAGE_COLORS[repo.language] || "#888" }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-sm font-medium truncate" style={{ color: text }}>{repo.name}</span>
              {repo.private && <span className="text-xs px-1.5 py-0.5 rounded-md flex items-center gap-1" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", color: muted }}><Lock className="w-2.5 h-2.5" />private</span>}
              {repo.external && <span className="text-xs px-1.5 py-0.5 rounded-md flex items-center gap-1" style={{ background: "rgba(124,111,247,0.1)", color: "#a89ff9" }}><Globe className="w-2.5 h-2.5" />external</span>}
            </div>
            <p className="text-xs truncate" style={{ color: muted }}>{repo.description}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <a href={repo.url} target="_blank" rel="noreferrer" className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors" style={{ color: muted }}
              onMouseEnter={e => (e.currentTarget.style.color = "#7c6ff7")} onMouseLeave={e => (e.currentTarget.style.color = muted)}>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <span className="text-xs font-mono flex items-center gap-1" style={{ color: muted }}><Star className="w-3 h-3" />{repo.stars.toLocaleString()}</span>
            <button onClick={() => onToggle(repo.id)} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={repo.connected
                ? { background: "rgba(124,111,247,0.15)", color: "#a89ff9", border: "1px solid rgba(124,111,247,0.25)" }
                : { background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", color: muted, border: `1px solid ${border}` }}>
              {repo.connected ? "Connected ✓" : "+ Add"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}