import { X, Send } from "lucide-react";
import { RepoDropdown } from "../../shared/RepoDropdown";

export function ChatInput({ repoFilter, toggleFilter, repos, isDark, textareaRef, input, setInput, handleKey, connected, sendMessage, isTyping, card, border, inputBg, text, muted }: any) {
  return (
    <div className="px-6 py-4 flex-shrink-0" style={{ background: card, borderTop: `1px solid ${border}` }}>
      <div className="max-w-3xl mx-auto">
        {repoFilter.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
            {repoFilter.map((r: string) => (
              <span key={r} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(124,111,247,0.12)", color: "#a89ff9", border: "1px solid rgba(124,111,247,0.2)", fontFamily: "monospace" }}>
                {r}<button onClick={() => toggleFilter(r)} className="ml-0.5 hover:text-red-400 transition-colors"><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        )}
        <div className="flex items-end gap-2 rounded-2xl px-3 py-2.5" style={{ background: inputBg, border: `1.5px solid ${border}` }}>
          <div className="flex-shrink-0 self-end pb-0.5">
            <RepoDropdown repos={repos} selected={repoFilter} onToggle={toggleFilter} isDark={isDark} />
          </div>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={connected.length === 0 ? "Connect a repo first…" : "Ask anything about your code…"}
            disabled={connected.length === 0}
            rows={1}
            className="flex-1 bg-transparent text-sm outline-none resize-none scrollbar-hide leading-relaxed"
            style={{ color: text, minHeight: "28px", maxHeight: "160px" }}
          />
          <button onClick={sendMessage} disabled={!input.trim() || isTyping || connected.length === 0}
            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center self-end text-white transition-all hover:opacity-90 disabled:opacity-30"
            style={{ background: "linear-gradient(135deg,#7c6ff7,#9b8ff9)" }}>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}