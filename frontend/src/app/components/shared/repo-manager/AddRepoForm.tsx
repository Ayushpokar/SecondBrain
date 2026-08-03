import { CheckCheck, Globe, Link, Loader2 } from "lucide-react";
import type { Repo } from "../../../types";

export function AddRepoForm({
  urlInput, setUrlInput, urlError, urlSuccess, handleAddUrl, isAdding, 
  repos, onToggle, cardBg, border, text, muted
}: any) {

  const exampleUrls = ["https://github.com/vercel/next.js", "https://github.com/facebook/react", "https://github.com/microsoft/TypeScript"];
  const externalRepos = repos.filter((r: Repo) => r.external);

  return (
    <div className="p-5 flex-1">
      <p className="text-sm font-medium mb-1" style={{ color: text }}>Add any public GitHub repository</p>
      <p className="text-xs mb-4" style={{ color: muted }}>Paste a GitHub URL to add any repo — yours or someone else's — to your context.</p>
      
      <div className="flex gap-2 mb-3">
        <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: cardBg, border: `1.5px solid ${urlError ? "#f04343" : urlSuccess ? "#22c55e" : border}` }}>
          <Link className="w-4 h-4 flex-shrink-0" style={{ color: muted }} />
          <input
            value={urlInput}
            onChange={e => { setUrlInput(e.target.value); }}
            onKeyDown={e => e.key === "Enter" && handleAddUrl()}
            placeholder="https://github.com/owner/repo"
            className="flex-1 text-sm bg-transparent outline-none"
            style={{ color: text, fontFamily: "monospace", fontSize: "12px" }}
            autoFocus
          />
        </div>
        <button onClick={handleAddUrl} disabled={!urlInput.trim() || isAdding} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ background: "linear-gradient(135deg,#7c6ff7,#9b8ff9)" }}>
          {isAdding ? (
          <>
            {/* 3. Show the loading animation! */}
            <Loader2 className="w-4 h-4 animate-spin" />
            Indexing Repository...
          </>
        ) : (
          "Add Repository"
        )}
        </button>
      </div>

      {urlError && <p className="text-xs" style={{ color: "#f04343", fontFamily: "monospace" }}>{urlError}</p>}
      {urlSuccess && (
        <div className="flex items-center gap-2 text-xs" style={{ color: "#22c55e" }}>
          <CheckCheck className="w-4 h-4" /> Repository added successfully!
        </div>
      )}

      <div className="mt-5 p-3 rounded-xl" style={{ background: cardBg, border: `1px solid ${border}` }}>
        <p className="text-xs font-semibold mb-2" style={{ color: text }}>Example URLs</p>
        {exampleUrls.map(url => (
          <button key={url} onClick={() => setUrlInput(url)} className="block text-xs font-mono mb-1 hover:underline transition-all" style={{ color: "#7c6ff7" }}>{url}</button>
        ))}
      </div>

      {externalRepos.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold mb-2" style={{ color: muted }}>External repos added</p>
          {externalRepos.map((r: Repo) => (
            <div key={r.id} className="flex items-center gap-2 py-2" style={{ borderBottom: `1px solid ${border}` }}>
              <Globe className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#7c6ff7" }} />
              <span className="text-xs font-mono flex-1" style={{ color: text }}>{r.owner}/{r.name}</span>
              <button onClick={() => onToggle(r.id)} className="text-xs px-2 py-1 rounded-lg" style={{ background: r.connected ? "rgba(124,111,247,0.15)" : cardBg, color: r.connected ? "#a89ff9" : muted, border: `1px solid ${border}` }}>
                {r.connected ? "Connected ✓" : "+ Add"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}