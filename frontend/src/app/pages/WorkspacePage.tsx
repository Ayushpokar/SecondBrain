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
import axios from "axios";
import api from "../services/api";
import { useIndexedRepos } from "../components/shared/hooks/useIndexedRepos";
import { useNavigate, useParams } from "react-router";

export function WorkspacePage() {
  const { sessionId } = useParams(); // Grabs "123" from "/c/123"
  const navigate = useNavigate();


  const [theme, setTheme] = useState<Theme>("dark");
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeId, setActiveId] = useState<string>(
    sessionId ? sessionId : "new_chat"
  );
  const [repos, setRepos] = useState<Repo[]>([]);
  const [repoFilter, setRepoFilter] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [showRepos, setShowRepos] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [historyQ, setHistoryQ] = useState("");
  const [selectedModel, setSelectedModel] = useState("claude-sonnet-4-6");
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isDark = theme === "dark";
  const active = chats.find(c => c.id === activeId);
  const connected = repos.filter(r => r.connected);

  // --- RE-ADDED ALL YOUR LOGIC FUNCTIONS ---

  useEffect(() => {
    if (sessionId) {
      // If there is an ID in the URL, make it the active chat
      setActiveId(sessionId);

    } else {
      // If the URL is just "/", prepare a new chat
      setActiveId('new_chat');
    }
  }, [sessionId]);


  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.style.setProperty("--background", "#0d0d10");
      root.style.setProperty("--foreground", "#f0f0f4");
      root.style.setProperty("--card", "#17171c");
      root.style.setProperty("--card-foreground", "#f0f0f4");
      root.style.setProperty("--muted", "#1e1e25");
      root.style.setProperty("--muted-foreground", "#7a7a8a");
      root.style.setProperty("--border", "rgba(255,255,255,0.08)");
      root.style.setProperty("--primary", "#7c6ff7");
      root.style.setProperty("--popover", "#1e1e25");
    } else {
      root.style.setProperty("--background", "#f3f4f8");
      root.style.setProperty("--foreground", "#0d0d14");
      root.style.setProperty("--card", "#ffffff");
      root.style.setProperty("--card-foreground", "#0d0d14");
      root.style.setProperty("--muted", "#eeeef4");
      root.style.setProperty("--muted-foreground", "#6b6b80");
      root.style.setProperty("--border", "rgba(0,0,0,0.08)");
      root.style.setProperty("--primary", "#6c5ce7");
      root.style.setProperty("--popover", "#ffffff");
    }
  }, [isDark]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [active?.messages, isTyping]);

  const newChat = () => {
    const c: Chat = { id: `c${Date.now()}`, title: "New conversation", preview: "", time: "just now", messages: [], pinned: false };
    setChats(prev => [c, ...prev]);
    setActiveId(c.id);
  };

  const deleteChat = async (chatIdToDelete: string) => {
    try {
      // 1. Delete from the database
      await api.delete(`/api/chats/${chatIdToDelete}`);

      // 2. Remove it from the React sidebar state instantly
      setChats(prev => prev.filter(c => c.id !== chatIdToDelete));

      // 3. IMPORTANT ROUTING FIX: 
      // If the user deleted the chat they are currently viewing, send them home!
      if (activeId === chatIdToDelete) {
        navigate("/");
        setActiveId("new_chat");
      }
      
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
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


  // 1. Fetch the sidebar list on initial load
  useEffect(() => {
    const fetchSidebar = async () => {
      try {
        const response = await api.get('/api/chats');
        // Map the backend data to match your Chat interface
        const formattedChats = response.data.map((chat: { id: any; title: any; }) => ({
          id: chat.id,
          title: chat.title,
          messages: [], // Will load when clicked
          preview: "Previous conversation...",
          time: "Past",
        }));
        setChats(formattedChats);
      } catch (error) {
        console.error("Failed to load sidebar", error);
      }
    };
    fetchSidebar();
  }, []); // Empty array = runs once on mount

  // 2. Fetch the specific chat history when activeId changes
  useEffect(() => {
    const fetchMessages = async () => {
      // Don't fetch if it's a new chat, or if we already have the messages
      const currentChat = chats.find(c => c.id === activeId);
      if (activeId === "new_chat" || (currentChat && currentChat.messages.length > 0)) {
        return;
      }

      try {
        const response = await api.get(`/api/chats/${activeId}`);
        const historyData = response.data;

        // Update the specific chat with its downloaded messages
        setChats(prev => prev.map(c =>
          c.id === activeId
            ? { ...c, messages: historyData.messages, title: historyData.title }
            : c
        ));
      } catch (error) {
        console.error("Failed to load history", error);
      }
    };

    if (activeId && chats.length > 0) {
      fetchMessages();
    }
  }, [activeId, chats.length]);


  const sendMessage = async () => {
    if (!input.trim()) return;

    const ctx = repoFilter.length > 0 ? repoFilter : connected.map(r => r.name);
    const frontendMsgId = `m${Date.now()}`; // Store this in a variable so we can replace it later

    const userMsg: Message = {
      id: frontendMsgId,
      role: "user",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      content: input.trim(),
      repos: ctx,
    };

    const tempTitle = input.trim().slice(0, 46) + (input.trim().length > 46 ? "…" : "");

    // 1. Optimistic UI: Add user message to UI immediately!
    setChats(prev => {
      const chatExists = prev.find(c => c.id === activeId);

      if (!chatExists) {
        // It's a brand new chat, so create it and inject the first message!
        return [{
          id: activeId, // This is likely "new_chat" right now
          title: tempTitle,
          messages: [userMsg],
          preview: input.trim(),
          time: "just now"
        }, ...prev];
      } else {
        // The chat already exists, just append the new message
        return prev.map(c =>
          c.id === activeId
            ? { ...c, messages: [...c.messages, userMsg], preview: input.trim(), time: "just now" }
            : c
        );
      }
    });

    // 2. Clear the input box IMMEDIATELY
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "28px";
    setIsTyping(true);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "28px";
    setIsTyping(true);

    try {
      // 2. Call Backend
      const payloadSessionId = activeId === "new_chat" ? null : activeId;
      const response = await api.post('/api/search', {
        userMsg: userMsg,
        session_id: payloadSessionId
      });

      const data = response.data;
      console.log(data)
      let finalAnswer = data.ai_message.content || "Could not generate an answer.";
      const repo = connected[Math.floor(Math.random() * connected.length)];

      const aiMsg: Message = {
        id: data.ai_message.id,
        role: "assistant",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        content: "", // Empty for typewriter
        repos: [repo?.name || "your-repo"],
      };

      // 3. FIX THE SIDEBAR & URL WITH REAL DATABASE DATA
      if (data.is_new_session) {
        navigate(`/c/${data.session_id}`, { replace: true });
        setActiveId(data.session_id); // Update the active ID state!
      }

      setChats(prev => prev.map(c => {
        // Find the chat we are currently talking in (it might still be labeled "new_chat" in this prev state)
        if (c.id === activeId || c.id === "new_chat") {
          const updatedMessages = c.messages.map(m =>
            m.id === frontendMsgId ? { ...m, id: data.user_db_id } : m
          );

          return {
            ...c,
            id: data.session_id, // The Sidebar item gets the REAL UUID
            title: data.is_new_session ? data.title : c.title, // The Sidebar gets the AI Name!
            messages: [...updatedMessages, aiMsg]
          };
        }
        return c;
      }));

      setIsTyping(false);

      // 7. TYPEWRITER EFFECT
      let currentIndex = 0;
      const typingInterval = setInterval(() => {
        currentIndex += 2;
        const currentText = finalAnswer.slice(0, currentIndex);

        setChats(prev => prev.map(c => {
          // Note: we check against data.session_id now, in case the ID just got upgraded
          if (c.id !== activeId && c.id !== data.session_id) return c;

          const updatedMessages = c.messages.map(m =>
            m.id === data.ai_message.id ? { ...m, content: currentText } : m
          );

          return { ...c, messages: updatedMessages };
        }));

        if (currentIndex >= finalAnswer.length) {
          clearInterval(typingInterval);
        }
      }, 15);

    } catch (error) {
      console.error(error);
      setIsTyping(false);
    }
  };



  const handleKey = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const toggleFilter = (name: string) => {
    setRepoFilter(prev => prev.includes(name) ? prev.filter(r => r !== name) : [...prev, name]);
  };


  // --- STYLING CONSTANTS ---

  const bg = isDark ? "#0d0d10" : "#f3f4f8";
  const card = isDark ? "#17171c" : "#ffffff";
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const text = isDark ? "#f0f0f4" : "#0d0d14";
  const muted = isDark ? "#7a7a8a" : "#6b6b80";
  const inputBg = isDark ? "#1e1e25" : "#eeeef4";

  const shownChats = chats.filter(c => !historyQ || c.title.toLowerCase().includes(historyQ.toLowerCase()));
  const pinnedChats = shownChats.filter(c => c.pinned);
  const unpinnedChats = shownChats.filter(c => !c.pinned);

  const modelLabel = AI_MODELS.find(m => m.id === selectedModel)?.name.split(" ").slice(-2).join(" ") || "Sonnet";
  const { indexedRepos, loading, refetch } = useIndexedRepos();
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: bg, color: text, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

      <Sidebar
        isDark={isDark} setTheme={setTheme} newChat={() => { navigate("/"); setActiveId("new_chat"); }}
        repos={indexedRepos.length} chats={chats}
        historyQ={historyQ} setHistoryQ={setHistoryQ}
        pinnedChats={pinnedChats} unpinnedChats={unpinnedChats} shownChats={chats}
        activeId={activeId} setActiveId={setActiveId} deleteChat={deleteChat} togglePin={togglePin}
        setShowRepos={setShowRepos} connected={connected} setShowSettings={setShowSettings}
        modelLabel={modelLabel} bg={bg} card={card} border={border} text={text} muted={muted} inputBg={inputBg}
      />

      <main className="flex-1 flex flex-col min-w-0">
        <ChatHeader
          active={active} isTyping={isTyping} connected={indexedRepos}
          exportChat={exportChat} setShowRepos={setShowRepos} setShowSettings={setShowSettings}
          card={card} border={border} text={text} muted={muted} inputBg={inputBg}
        />

        <ChatFeed
          active={active} isTyping={isTyping} connected={indexedRepos} isDark={isDark}
          text={text} card={card} border={border} muted={muted} languageColors={LANG_COLOR}
          repos={repos} copyMessage={copyMessage} copiedMsgId={copiedMsgId} endRef={endRef}
          setInput={setInput} textareaRef={textareaRef} QUICK_STARTS={QUICK_STARTS}
        />

        <ChatInput
          indexedRepos={indexedRepos} loading={loading} repoFilter={repoFilter} toggleFilter={toggleFilter} repos={repos} isDark={isDark}
          textareaRef={textareaRef} input={input} setInput={setInput} handleKey={handleKey}
          connected={connected} sendMessage={sendMessage} isTyping={isTyping}
          card={card} border={border} inputBg={inputBg} text={text} muted={muted}
        />
      </main>

      {showRepos && (
        <RepoManager
          // 1. Keep these two:
          onClose={() => setShowRepos(false)}
          isDark={isDark}

          // 2. Add the Walkie-Talkie!
          onRepoAdded={refetch}
        />
      )}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)} repos={indexedRepos.length} isDark={isDark} theme={theme} selectedModel={selectedModel} onModelChange={setSelectedModel}
          onThemeToggle={() => setTheme((t: Theme) => t === "dark" ? "light" : "dark")}
        />
      )}
    </div>
  );
}