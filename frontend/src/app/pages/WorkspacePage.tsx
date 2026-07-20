import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { Sidebar } from "../components/layouts/workspace/Sidebar";
import { ChatHeader } from "../components/layouts/workspace/ChatHeader";
import { ChatFeed } from "../components/layouts/workspace/ChatFeed";
import { ChatInput } from "../components/layouts/workspace/ChatInput";

// Updated imports based on your new folder tree!
import { RepoManager } from "../components/shared/repo-manager/RepoManager";
import { SettingsModal } from "../components/shared/settings-modal/SettingsModal";
import { AI_MODELS, ALL_REPOS, INITIAL_CHATS, LANG_COLOR, QUICK_STARTS } from "../data/mockData";
import type { Chat, Message, Repo, Theme } from "../types";

export function WorkspacePage() {
  const [theme, setTheme]             = useState<Theme>("dark");
  const [chats, setChats]             = useState<Chat[]>(INITIAL_CHATS);
  const [activeId, setActiveId]       = useState("c1");
  const [repos, setRepos]             = useState<Repo[]>(ALL_REPOS);
  const [repoFilter, setRepoFilter]   = useState<string[]>([]);
  const [input, setInput]             = useState("");
  const [showRepos, setShowRepos]     = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isTyping, setIsTyping]       = useState(false);
  const [historyQ, setHistoryQ]       = useState("");
  const [selectedModel, setSelectedModel] = useState("claude-sonnet-4-6");
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  
  const endRef      = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isDark    = theme === "dark";
  const active    = chats.find(c => c.id === activeId);
  const connected = repos.filter(r => r.connected);

  // --- RE-ADDED ALL YOUR LOGIC FUNCTIONS ---
  
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.style.setProperty("--background",       "#0d0d10");
      root.style.setProperty("--foreground",       "#f0f0f4");
      root.style.setProperty("--card",             "#17171c");
      root.style.setProperty("--card-foreground",  "#f0f0f4");
      root.style.setProperty("--muted",            "#1e1e25");
      root.style.setProperty("--muted-foreground", "#7a7a8a");
      root.style.setProperty("--border",           "rgba(255,255,255,0.08)");
      root.style.setProperty("--primary",          "#7c6ff7");
      root.style.setProperty("--popover",          "#1e1e25");
    } else {
      root.style.setProperty("--background",       "#f3f4f8");
      root.style.setProperty("--foreground",       "#0d0d14");
      root.style.setProperty("--card",             "#ffffff");
      root.style.setProperty("--card-foreground",  "#0d0d14");
      root.style.setProperty("--muted",            "#eeeef4");
      root.style.setProperty("--muted-foreground", "#6b6b80");
      root.style.setProperty("--border",           "rgba(0,0,0,0.08)");
      root.style.setProperty("--primary",          "#6c5ce7");
      root.style.setProperty("--popover",          "#ffffff");
    }
  }, [isDark]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [active?.messages, isTyping]);

  const newChat = () => {
    const c: Chat = { id: `c${Date.now()}`, title: "New conversation", preview: "", time: "just now", messages: [], pinned: false };
    setChats(prev => [c, ...prev]);
    setActiveId(c.id);
  };

  const deleteChat = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    const rest = chats.filter(c => c.id !== id);
    setChats(rest);
    if (activeId === id) setActiveId(rest[0]?.id ?? "");
  };

  const togglePin = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    setChats(prev => prev.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c));
  };

  const exportChat = () => {
    if (!active) return;
    const md = `# ${active.title}\n\n` + active.messages.map(m => `**${m.role === "user" ? "You" : "AI"}** (${m.time})\n\n${m.content}`).join("\n\n---\n\n");
    const blob = new Blob([md], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${active.title.replace(/\s+/g, "-").toLowerCase()}.md`;
    a.click();
  };

  const copyMessage = (msg: Message) => {
    navigator.clipboard?.writeText(msg.content);
    setCopiedMsgId(msg.id);
    setTimeout(() => setCopiedMsgId(null), 1500);
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    const ctx = repoFilter.length > 0 ? repoFilter : connected.map(r => r.name);
    const userMsg: Message = {
      id: `m${Date.now()}`, role: "user",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      content: input.trim(), repos: ctx,
    };
    const title = input.trim().slice(0, 46) + (input.trim().length > 46 ? "…" : "");
    setChats(prev => prev.map(c =>
      c.id === activeId
        ? { ...c, messages: [...c.messages, userMsg], preview: input.trim(), time: "just now", title: c.title === "New conversation" ? title : c.title }
        : c
    ));
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "28px";
    setIsTyping(true);
    setTimeout(() => {
      const repo = connected[Math.floor(Math.random() * connected.length)];
      const name = repo?.name || "your-repo";
      const aiMsg: Message = {
        id: `m${Date.now() + 1}`, role: "assistant",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        content: [
          `Analyzed \`${name}\` — the codebase follows a service-layer pattern. Controllers stay thin, business logic lives in services.\n\nEntry point:\n\n\`\`\`typescript\n// src/services/core.service.ts\nexport class CoreService {\n  constructor(private readonly db: PrismaClient) {}\n\n  async handle(input: ValidatedInput) {\n    return this.db.$transaction(async tx => {\n      return tx.record.create({ data: input });\n    });\n  }\n}\n\`\`\`\n\nWant me to trace a specific call chain?`,
          `Scanned \`${name}\` — found ${Math.floor(Math.random() * 5) + 4} relevant files. Architecture is consistent throughout.\n\nError handling is centralized — domain errors map to HTTP codes in a single middleware, keeping route handlers clean.\n\nAnything specific you want to dig into?`,
          `Based on \`${name}\`:\n\n**Architecture:** Service layer with DI container\n**Entry:** \`src/index.ts\` bootstraps via dependency injection\n**Routes:** ${Math.floor(Math.random() * 8) + 6} endpoints in \`src/routes/\`\n**Data:** Typed repository pattern over Prisma\n\nI spotted some stale TODO comments in \`src/utils/\` — want me to surface those?`,
        ][Math.floor(Math.random() * 3)],
      };
      setChats(prev => prev.map(c => c.id === activeId ? { ...c, messages: [...c.messages, aiMsg] } : c));
      setIsTyping(false);
    }, 1200 + Math.random() * 600);
  };

  const handleKey = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const toggleFilter = (name: string) => {
    setRepoFilter(prev => prev.includes(name) ? prev.filter(r => r !== name) : [...prev, name]);
  };

  const addExternalRepo = (url: string) => {
    const match = url.match(/github\.com\/([^/]+)\/([^/\s]+)/);
    if (!match) return;
    const [, owner, name] = match;
    const clean = name.replace(/\.git$/, "");
    if (repos.find(r => r.name === clean && r.owner === owner)) return;
    const newRepo: Repo = {
      id: `ext-${Date.now()}`, name: clean, owner,
      language: "Unknown", stars: 0, private: false,
      connected: true, description: `External repo from ${owner}`,
      url, external: true,
    };
    setRepos(prev => [...prev, newRepo]);
  };

  // --- STYLING CONSTANTS ---

  const bg      = isDark ? "#0d0d10" : "#f3f4f8";
  const card    = isDark ? "#17171c" : "#ffffff";
  const border  = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const text    = isDark ? "#f0f0f4" : "#0d0d14";
  const muted   = isDark ? "#7a7a8a" : "#6b6b80";
  const inputBg = isDark ? "#1e1e25" : "#eeeef4";

  const shownChats = chats.filter(c => !historyQ || c.title.toLowerCase().includes(historyQ.toLowerCase()));
  const pinnedChats   = shownChats.filter(c => c.pinned);
  const unpinnedChats = shownChats.filter(c => !c.pinned);
  
  const modelLabel = AI_MODELS.find(m => m.id === selectedModel)?.name.split(" ").slice(-2).join(" ") || "Sonnet";

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: bg, color: text, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      
      <Sidebar 
        isDark={isDark} setTheme={setTheme} newChat={newChat} 
        historyQ={historyQ} setHistoryQ={setHistoryQ} 
        pinnedChats={pinnedChats} unpinnedChats={unpinnedChats} shownChats={shownChats}
        activeId={activeId} setActiveId={setActiveId} deleteChat={deleteChat} togglePin={togglePin} 
        setShowRepos={setShowRepos} connected={connected} setShowSettings={setShowSettings} 
        modelLabel={modelLabel} bg={bg} card={card} border={border} text={text} muted={muted} inputBg={inputBg}
      />

      <main className="flex-1 flex flex-col min-w-0">
        <ChatHeader 
          active={active} isTyping={isTyping} connected={connected} 
          exportChat={exportChat} setShowRepos={setShowRepos} setShowSettings={setShowSettings}
          card={card} border={border} text={text} muted={muted} inputBg={inputBg}
        />

        <ChatFeed 
          active={active} isTyping={isTyping} connected={connected} isDark={isDark} 
          text={text} card={card} border={border} muted={muted} languageColors={LANG_COLOR} 
          repos={repos} copyMessage={copyMessage} copiedMsgId={copiedMsgId} endRef={endRef} 
          setInput={setInput} textareaRef={textareaRef} QUICK_STARTS={QUICK_STARTS}
        />

        <ChatInput 
          repoFilter={repoFilter} toggleFilter={toggleFilter} repos={repos} isDark={isDark} 
          textareaRef={textareaRef} input={input} setInput={setInput} handleKey={handleKey} 
          connected={connected} sendMessage={sendMessage} isTyping={isTyping} 
          card={card} border={border} inputBg={inputBg} text={text} muted={muted}
        />
      </main>

      {showRepos && (
        <RepoManager 
          repos={repos} onClose={() => setShowRepos(false)} onAddExternal={addExternalRepo} isDark={isDark}
          onToggle={id => setRepos((prev: Repo[]) => prev.map(r => r.id === id ? { ...r, connected: !r.connected } : r))} 
        />
      )}
      
      {showSettings && (
        <SettingsModal 
          onClose={() => setShowSettings(false)} isDark={isDark} theme={theme} selectedModel={selectedModel} onModelChange={setSelectedModel}
          onThemeToggle={() => setTheme((t: Theme) => t === "dark" ? "light" : "dark")} 
        />
      )}
    </div>
  );
}