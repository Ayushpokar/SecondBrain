import { RepoManagerHeader } from "./RepoManagerHeader";
import { RepoList } from "./RepoList";
import { useAuth } from "../../../context/AuthContext";

export function RepoManager({ onClose, isDark, onRepoAdded }: {
  onClose: () => void;
  isDark: boolean;
  onRepoAdded: () => void; // <--- Just add this!
}) {
  // CSS variables for styling
  const bg     = isDark ? "#17171c" : "#ffffff";
  const cardBg = isDark ? "#1e1e25" : "#f4f4f8";
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const text   = isDark ? "#f0f0f4" : "#0d0d14";
  const muted  = isDark ? "#7a7a8a" : "#6b6b80";
   const {user} = useAuth();
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-xl flex flex-col max-h-[82vh] rounded-2xl overflow-hidden" style={{ background: bg, border: `1px solid ${border}`, boxShadow: "0 32px 80px rgba(0,0,0,0.5)" }}>
        
        {/* Header - (Note: You might need to move connectedCount calculation inside RepoManagerHeader if you haven't already, or fetch useIndexedRepos here just to get the length!) */}
        <RepoManagerHeader 
          user = {user}
          onClose={onClose} 
          isDark={isDark} border={border} text={text} muted={muted} 
        />

        {/* Pass the walkie-talkie down to RepoList! */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <RepoList 
            onRepoAdded={onRepoAdded} 
            isDark={isDark} border={border} text={text} muted={muted} cardBg={cardBg}
          />
        </div>

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