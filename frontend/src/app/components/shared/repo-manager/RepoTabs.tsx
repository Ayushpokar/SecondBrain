import { Search } from "lucide-react";

export function RepoTabs({ tab, setTab, q, setQ, cardBg, border, text, muted }: any) {
  const TABS = [
    ["mine", "My Repos"], 
    ["connected", "Connected"], 
    ["add", "Add by URL"]
  ] as const;

  return (
    <div className="flex" style={{ borderBottom: `1px solid ${border}` }}>
      {TABS.map(([t, label]) => (
        <button key={t} onClick={() => setTab(t)}
          className="px-4 py-3 text-xs font-semibold transition-all relative"
          style={{ color: tab === t ? "#7c6ff7" : muted }}>
          {label}
          {tab === t && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: "#7c6ff7" }} />}
        </button>
      ))}
      {tab !== "add" && (
        <div className="flex-1 flex items-center px-3">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg flex-1" style={{ background: cardBg }}>
            <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: muted }} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search..." autoFocus className="flex-1 text-xs bg-transparent outline-none" style={{ color: text, fontFamily: "monospace" }} />
          </div>
        </div>
      )}
    </div>
  );
}