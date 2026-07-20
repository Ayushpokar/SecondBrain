import { Download, Github } from "lucide-react";

export function ChatHeader({ active, isTyping, connected, exportChat, setShowRepos, card, border, text, muted, inputBg }: any) {
  return (
    <header className="flex items-center justify-between px-6 py-3.5 flex-shrink-0" style={{ background: card, borderBottom: `1px solid ${border}` }}>
      <div className="min-w-0">
        <h1 className="text-base font-bold truncate" style={{ color: text }}>
          {active?.title || "New Conversation"}
        </h1>
        {isTyping
          ? <p className="text-xs mt-0.5 flex items-center gap-1.5" style={{ color: "#7c6ff7", fontFamily: "monospace" }}>AI is thinking…</p>
          : <p className="text-xs mt-0.5 flex items-center gap-2" style={{ color: muted, fontFamily: "monospace" }}>
              <span>{connected.length} repo{connected.length !== 1 ? "s" : ""} connected</span>
              {active?.messages.length ? <span>· {active.messages.length} messages</span> : null}
            </p>
        }
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
        {active?.messages.length ? (
          <button onClick={exportChat} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all" style={{ background: inputBg, color: muted, border: `1px solid ${border}` }}>
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        ) : null}
        <button onClick={() => setShowRepos(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all" style={{ background: inputBg, color: muted, border: `1px solid ${border}` }}>
          <Github className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Repos</span>
        </button>
      </div>
    </header>
  );
}