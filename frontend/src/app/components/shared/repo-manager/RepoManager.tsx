import { useState } from "react";
import { RepoManagerHeader } from "./RepoManagerHeader";
import { RepoTabs } from "./RepoTabs";
import { RepoList } from "./RepoList";
import { AddRepoForm } from "./AddRepoForm";
import { Repo } from "../../../types";

export function RepoManager({ repos, onToggle, onClose, onAddExternal, isDark }: {
  repos: Repo[]; onToggle: (id: string) => void; onClose: () => void;
  onAddExternal: (url: string) => void; isDark: boolean;
}) {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"mine" | "connected" | "add">("mine");
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState("");
  const [urlSuccess, setUrlSuccess] = useState(false);

  // CSS variables for styling
  const bg     = isDark ? "#17171c" : "#ffffff";
  const cardBg = isDark ? "#1e1e25" : "#f4f4f8";
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const text   = isDark ? "#f0f0f4" : "#0d0d14";
  const muted  = isDark ? "#7a7a8a" : "#6b6b80";

  // Filtered logic for RepoList
  const shown = repos.filter(r =>
    (tab === "connected" ? r.connected : true) &&
    (!q || r.name.toLowerCase().includes(q.toLowerCase()) || r.description.toLowerCase().includes(q.toLowerCase()))
  );

  const connectedCount = repos.filter(r => r.connected).length;

  // Handler logic
  const handleAddUrl = () => {
    setUrlError("");
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    const ghMatch = trimmed.match(/github\.com\/([^/]+)\/([^/\s]+)/);
    if (!ghMatch) { 
      setUrlError("Enter a valid GitHub URL, e.g. https://github.com/owner/repo"); 
      return; 
    }
    onAddExternal(trimmed);
    setUrlInput("");
    setUrlSuccess(true);
    setTimeout(() => setUrlSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-xl flex flex-col max-h-[82vh] rounded-2xl overflow-hidden" style={{ background: bg, border: `1px solid ${border}`, boxShadow: "0 32px 80px rgba(0,0,0,0.5)" }}>
        
        <RepoManagerHeader 
          connectedCount={connectedCount} onClose={onClose} 
          isDark={isDark} border={border} text={text} muted={muted} 
        />

        <RepoTabs 
          tab={tab} setTab={setTab} q={q} setQ={setQ} 
          cardBg={cardBg} border={border} text={text} muted={muted} 
        />

        {tab === "add" ? (
          <AddRepoForm 
            urlInput={urlInput} setUrlInput={(v: string) => { setUrlInput(v); setUrlError(""); }} 
            urlError={urlError} urlSuccess={urlSuccess} handleAddUrl={handleAddUrl} 
            repos={repos} onToggle={onToggle} 
            cardBg={cardBg} border={border} text={text} muted={muted} 
          />
        ) : (
          <RepoList 
            shown={shown} onToggle={onToggle} 
            isDark={isDark} border={border} text={text} muted={muted} 
          />
        )}

        {/* Footer */}
        <div className="flex items-center justify-end px-5 py-3.5" style={{ borderTop: `1px solid ${border}` }}>
          <button onClick={onClose} className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ background: "#7c6ff7" }}>
            Done
          </button>
        </div>

      </div>
    </div>
  );
}