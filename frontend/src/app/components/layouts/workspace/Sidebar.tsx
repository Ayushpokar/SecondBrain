import { Plus, Search, Sun, Moon, Github, Settings } from "lucide-react";
import { BrainLogo } from "../../shared/BrainLogo";
import { ChatRow } from "./ChatRow";
import type { Chat } from "../../../types";

export function Sidebar({
  isDark, setTheme, newChat, historyQ, setHistoryQ, pinnedChats, unpinnedChats, 
  shownChats, activeId, setActiveId, deleteChat, togglePin, setShowRepos, 
  connected, setShowSettings, modelLabel, bg, card, border, text, muted, inputBg
}: any) {
  return (
    <aside className="w-60 flex-shrink-0 flex flex-col" style={{ background: card, borderRight: `1px solid ${border}` }}>
      <div className="flex items-center justify-between px-4 py-4" style={{ borderBottom: `1px solid ${border}` }}>
        <div className="flex items-center gap-2.5">
          <BrainLogo size={32} color="#7c6ff7" />
          <div>
            <p className="text-sm font-bold leading-none" style={{ color: text }}>SecondBrain</p>
            <p className="text-xs mt-0.5" style={{ color: muted, fontFamily: "monospace" }}>for devs</p>
          </div>
        </div>
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
          style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", color: muted }}
        >
          {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div className="px-3 pt-3 pb-2 space-y-2">
        <button onClick={newChat} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ background: "linear-gradient(135deg,#7c6ff7,#9b8ff9)" }}>
          <Plus className="w-4 h-4" />New Chat
        </button>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: inputBg }}>
          <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: muted }} />
          <input value={historyQ} onChange={e => setHistoryQ(e.target.value)} placeholder="Search chats..." className="flex-1 text-xs bg-transparent outline-none" style={{ color: text }} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-2 pb-3">
        {pinnedChats.length > 0 && (
          <>
            <p className="text-xs px-2 pb-1 pt-1 font-semibold uppercase tracking-widest" style={{ color: muted }}>Pinned</p>
            {pinnedChats.map((chat: Chat) => <ChatRow key={chat.id} chat={chat} isActive={chat.id === activeId} isDark={isDark} text={text} muted={muted} onSelect={() => setActiveId(chat.id)} onDelete={deleteChat} onTogglePin={togglePin} />)}
          </>
        )}
        <p className="text-xs px-2 pb-1 pt-2 font-semibold uppercase tracking-widest" style={{ color: muted }}>Recent</p>
        {unpinnedChats.map((chat: Chat) => <ChatRow key={chat.id} chat={chat} isActive={chat.id === activeId} isDark={isDark} text={text} muted={muted} onSelect={() => setActiveId(chat.id)} onDelete={deleteChat} onTogglePin={togglePin} />)}
        {shownChats.length === 0 && <p className="text-xs text-center py-6" style={{ color: muted }}>No chats found</p>}
      </div>

      <div className="px-3 py-3 space-y-1" style={{ borderTop: `1px solid ${border}` }}>
        <button onClick={() => setShowRepos(true)} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors" style={{ color: muted }}>
          <Github className="w-4 h-4 flex-shrink-0" />
          <span>Repositories</span>
          <span className="ml-auto text-xs font-mono px-1.5 py-0.5 rounded-md" style={{ background: "rgba(124,111,247,0.15)", color: "#a89ff9" }}>{connected.length}</span>
        </button>
        <button onClick={() => setShowSettings(true)} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors" style={{ color: muted }}>
          <Settings className="w-4 h-4 flex-shrink-0" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}