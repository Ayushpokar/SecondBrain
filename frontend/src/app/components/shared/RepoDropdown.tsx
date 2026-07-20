import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, GitBranch, Globe, Search, X } from "lucide-react";
import type { Repo } from "../../types";

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3b82f6", Rust: "#f97316", Python: "#a855f7", Go: "#06b6d4",
  HCL: "#8b5cf6", JavaScript: "#eab308", Shell: "#22c55e", Ruby: "#e11d48", Swift: "#f97316",
};

type RepoDropdownProps = {
  repos: Repo[];
  selected: string[];
  onToggle: (name: string) => void;
  isDark: boolean;
};

export function RepoDropdown({ repos, selected, onToggle, isDark }: RepoDropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const filtered = repos.filter(repo => repo.connected && (!query || repo.name.toLowerCase().includes(query.toLowerCase())));
  const bg = isDark ? "#1e1e25" : "#ffffff";
  const border = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const hover = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";
  const text = isDark ? "#f0f0f4" : "#0d0d14";
  const muted = isDark ? "#7a7a8a" : "#6b6b80";
  const selectedBackground = isDark ? "rgba(124,111,247,0.15)" : "rgba(108,92,231,0.08)";

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 40);
  }, [open]);

  return (
    <div ref={dropdownRef} className="relative flex-shrink-0">
      <button onClick={() => setOpen(value => !value)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all" style={{ background: selected.length ? "rgba(124,111,247,0.2)" : isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)", color: selected.length ? "#a89ff9" : muted, border: `1px solid ${selected.length ? "rgba(124,111,247,0.3)" : border}` }}>
        <GitBranch className="w-3.5 h-3.5" />
        <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{selected.length === 0 ? "repos" : selected.length === 1 ? selected[0] : `${selected.length} repos`}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="absolute bottom-full left-0 mb-2 w-72 rounded-xl overflow-hidden z-50" style={{ background: bg, border: `1px solid ${border}`, boxShadow: isDark ? "0 20px 60px rgba(0,0,0,0.6)" : "0 20px 60px rgba(0,0,0,0.15)" }}>
        <div className="flex items-center gap-2 px-3 py-2.5" style={{ borderBottom: `1px solid ${border}` }}>
          <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: muted }} />
          <input ref={inputRef} value={query} onChange={event => setQuery(event.target.value)} placeholder="Search repos..." className="flex-1 text-sm outline-none bg-transparent" style={{ color: text, fontFamily: "'JetBrains Mono', monospace", fontSize: "12px" }} />
          {query && <button onClick={() => setQuery("")} style={{ color: muted }}><X className="w-3.5 h-3.5" /></button>}
        </div>
        <div className="max-h-56 overflow-y-auto scrollbar-hide py-1">
          {filtered.length === 0 ? <p className="px-4 py-5 text-xs text-center" style={{ color: muted, fontFamily: "monospace" }}>No repos found</p> : filtered.map(repo => {
            const isSelected = selected.includes(repo.name);
            return <button key={repo.id} onClick={() => onToggle(repo.name)} className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors" style={{ background: isSelected ? selectedBackground : "transparent" }} onMouseEnter={event => { if (!isSelected) event.currentTarget.style.background = hover; }} onMouseLeave={event => event.currentTarget.style.background = isSelected ? selectedBackground : "transparent"}>
              <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all" style={{ border: `1.5px solid ${isSelected ? "#7c6ff7" : border}`, background: isSelected ? "#7c6ff7" : "transparent" }}>{isSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}</div>
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: LANGUAGE_COLORS[repo.language] || "#888" }} />
              <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate" style={{ color: text }}>{repo.name}</p><p className="text-xs" style={{ color: muted, fontFamily: "monospace" }}>{repo.owner} · {repo.language}</p></div>
              {repo.external && <Globe className="w-3 h-3 flex-shrink-0" style={{ color: muted }} />}
            </button>;
          })}
        </div>
        <div className="flex items-center justify-between px-3 py-2" style={{ borderTop: `1px solid ${border}`, background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}><span className="text-xs" style={{ color: muted, fontFamily: "monospace" }}>{selected.length} selected</span>{selected.length > 0 && <button onClick={() => selected.forEach(onToggle)} className="text-xs font-medium" style={{ color: "#7c6ff7" }}>Clear all</button>}</div>
      </div>}
    </div>
  );
}
