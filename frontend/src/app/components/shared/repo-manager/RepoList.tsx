import { useState, useMemo } from "react";
import { RepoTabs } from "./RepoTabs";
import { AddRepoForm } from "./AddRepoForm";
import { ExternalLink, Lock, Check, Plus, Loader2 } from "lucide-react";
import { useGithubRepos } from "../hooks/useGithubRepos";
import { useIndexedRepos } from "../hooks/useIndexedRepos";
import api from "../../../services/api"; // Make sure your API import is here!

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3b82f6", Rust: "#f97316", Python: "#a855f7", Go: "#06b6d4",
  HCL: "#8b5cf6", JavaScript: "#eab308", Shell: "#22c55e", Ruby: "#e11d48", Swift: "#f97316",
};

export function RepoList({ onAddExternal, isDark, border, text, muted, cardBg = "rgba(255,255,255,0.05)" }: any) {
  // 1. DATA HOOKS
  const { githubRepos, loading: githubLoading } = useGithubRepos();
  const { indexedRepos, loading: indexedLoading, refetch } = useIndexedRepos();

  // 2. STATES
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"mine" | "connected" | "add">("mine");
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState("");
  const [urlSuccess, setUrlSuccess] = useState(false);
  
  // RESTORED: Loading state for individual repo buttons
  const [indexingIds, setIndexingIds] = useState<Set<number>>(new Set());
  const [isAddingUrl, setIsAddingUrl] = useState(false);

  // 3. IDENTIFY CONNECTED REPOS
  const indexedIds = useMemo(() => {
    return new Set(indexedRepos.map((r: any) => r.github_repo_id || r.id));
  }, [indexedRepos]);

  // 4. FILTER REPOS
  const filteredRepos = useMemo(() => {
    return githubRepos.filter((repo: any) => {
      const isConnected = indexedIds.has(repo.id);

      if (tab === "connected" && !isConnected) return false;
      if (tab === "mine" && isConnected) return false;

      if (q.trim()) {
        const searchLower = q.toLowerCase();
        return repo.name.toLowerCase().includes(searchLower) || 
               (repo.description && repo.description.toLowerCase().includes(searchLower));
      }
      return true;
    });
  }, [githubRepos, indexedIds, tab, q]);

  // RESTORED: The actual toggle logic
  const onToggle = async (repo: any) => {
    if (indexingIds.has(repo.id)) return;
    
    setIndexingIds(prev => new Set(prev).add(repo.id));

    try {
      await api.post('/api/fetch-repo', {
        repo_id:        repo.id,
        repo_url:       repo.url,
        owner:          repo.owner.login,
        repo_name:      repo.name,
        description:    repo.description,
        stars:          repo.stargazers_count,
        forks:          repo.forks_count,
        visibility:     repo.visibility,
        default_branch: repo.default_branch,
        last_commit:    repo.updated_at,
        language:       repo.language,
      });
      if (refetch) await refetch(); // Instantly update UI
    } catch (err) {
      console.error(err);
      alert(`Failed to index ${repo.name}`);
    } finally {
      setIndexingIds(prev => {
        const next = new Set(prev);
        next.delete(repo.id);
        return next;
      });
    }
  };

  // 5. ADD URL HANDLER
  const handleAddUrl = async () => {
    
    setUrlError("");
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    
    const ghMatch = trimmed.match(/github\.com\/([^/]+)\/([^/\s]+)/);
    if (!ghMatch) { 
      setUrlError("Enter a valid GitHub URL"); 
      return; 
    }

    setIsAddingUrl(true);
    // / 2. Send the URL to your new Python backend endpoint
    const response = await api.post('/api/fetch-external-repo', { 
      url: trimmed 
    });
    
    setIsAddingUrl(false);

    onAddExternal(trimmed);
    setUrlInput("");
    setUrlSuccess(true);
    setTimeout(() => setUrlSuccess(false), 2500);

  };

  if (githubLoading || indexedLoading) {
    return (
      <div className="flex justify-center items-center p-8 h-full">
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#7c6ff7" }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <RepoTabs tab={tab} setTab={setTab} q={q} setQ={setQ} cardBg={cardBg} border={border} text={text} muted={muted} />

      <div className="flex-1 overflow-y-auto scrollbar-hide py-2">
        {tab === "add" ? (
          <AddRepoForm 
            urlInput={urlInput} setUrlInput={(v: string) => { setUrlInput(v); setUrlError(""); }} 
            isAdding={isAddingUrl}
            urlError={urlError} urlSuccess={urlSuccess} handleAddUrl={handleAddUrl} 
            repos={filteredRepos} onToggle={onToggle} 
            cardBg={cardBg} border={border} text={text} muted={muted} 
          />
        ) : filteredRepos.length === 0 ? (
          <div className="text-center py-8 text-sm" style={{ color: muted }}>
            No repositories found.
          </div>
        ) : (
          filteredRepos.map((repo: any) => {
            const isConnected = indexedIds.has(repo.id);
            const isIndexing = indexingIds.has(repo.id); // Check if this specific repo is loading

            return (
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
                  </div>
                  <p className="text-xs truncate" style={{ color: muted }}>{repo.description || "No description provided."}</p>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a href={repo.url} target="_blank" rel="noreferrer" className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors" style={{ color: muted }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#7c6ff7")} onMouseLeave={e => (e.currentTarget.style.color = muted)}>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  
                  {/* RESTORED: Loading states on the button */}
                  <button
                    onClick={() => onToggle(repo)}
                    disabled={isIndexing || isConnected} 
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:cursor-not-allowed"
                    style={
                      isConnected
                        ? { background: "rgba(124,111,247,0.15)", color: "#a89ff9", border: "1px solid rgba(124,111,247,0.25)" }
                        : isIndexing
                          ? { background: "rgba(124,111,247,0.08)", color: "#a89ff9", border: "1px solid rgba(124,111,247,0.2)" }
                          : { background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", color: muted, border: `1px solid ${border}` }
                    }
                  >
                    {isConnected ? (
                      <><Check className="w-3 h-3" /> Connected</>
                    ) : isIndexing ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Indexing</span>
                        <span className="flex gap-0.5 ml-0.5">
                          {[0, 1, 2].map(i => (
                            <span key={i} className="w-0.5 h-0.5 rounded-full bg-current animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                          ))}
                        </span>
                      </>
                    ) : (
                      <><Plus className="w-3 h-3" /> Add</> 
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}