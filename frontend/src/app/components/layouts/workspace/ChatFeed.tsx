import { Bot, User, Copy, CheckCheck, Layers, Code2, BookOpen, GitCommit, AlertCircle, GitBranch } from "lucide-react";
import { BrainLogo } from "../../shared/BrainLogo";
import { MessageContent } from "./MessageContent";

export function ChatFeed({ active, isTyping, connected, isDark, text, card, border, muted, languageColors, repos, copyMessage, copiedMsgId, endRef, setInput, textareaRef, QUICK_STARTS }: any) {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide">
      {active && active.messages.length > 0 ? (
        <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
          {active.messages.map((msg: any) => {
            const isUser = msg.role === "user";
            return (
              <div key={msg.id} className={`flex gap-3 group ${isUser ? "flex-row-reverse" : ""}`}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: isUser ? "linear-gradient(135deg,#7c6ff7,#9b8ff9)" : isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", border: isUser ? "none" : `1px solid ${border}` }}>
                  {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4" style={{ color: "#7c6ff7" }} />}
                </div>
                <div className={`flex-1 flex flex-col gap-1.5 max-w-[78%] ${isUser ? "items-end" : "items-start"}`}>
                  {/* Repo Tags */}
                  {isUser && msg.repos && msg.repos.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {msg.repos.map((r: string) => (
                        <span key={r} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md" style={{ background: "rgba(124,111,247,0.12)", color: "#a89ff9", fontFamily: "monospace", border: "1px solid rgba(124,111,247,0.2)" }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: languageColors[repos.find((x: any) => x.name === r)?.language || ""] || "#888" }} />
                          {r}
                        </span>
                      ))}
                    </div>
                  )}
                  {/* Message Bubble */}
                  <div className="relative" style={{ maxWidth: "100%" }}>
                    <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                      style={isUser
                        ? { background: "linear-gradient(135deg,#7c6ff7,#9b8ff9)", color: "#fff", borderBottomRightRadius: "6px" }
                        : { background: card, color: text, border: `1px solid ${border}`, borderBottomLeftRadius: "6px" }}>
                      <div className="whitespace-pre-wrap"><MessageContent content={msg.content} isDark={isDark} /></div>
                    </div>
                    {/* Copy button */}
                    <button onClick={() => copyMessage(msg)} className="absolute -top-2 right-2 opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg flex items-center justify-center transition-all" style={{ background: card, border: `1px solid ${border}`, color: muted }}>
                      {copiedMsgId === msg.id ? <CheckCheck className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <span className="text-xs" style={{ color: muted, fontFamily: "monospace" }}>{msg.time}</span>
                </div>
              </div>
            );
          })}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", border: `1px solid ${border}` }}>
                <Bot className="w-4 h-4" style={{ color: "#7c6ff7" }} />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-1.5" style={{ background: card, border: `1px solid ${border}` }}>
                {[0, 1, 2].map(i => <span key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ background: "#7c6ff7", animationDelay: `${i * 0.12}s`, opacity: 0.7 }} />)}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center h-full px-8 max-w-2xl mx-auto text-center">
          <BrainLogo size={56} color="#7c6ff7" />
          <h2 className="text-2xl font-bold mt-5 mb-2" style={{ color: text }}>
            {connected.length > 0 ? "Ask anything about your code" : "Connect a repo to get started"}
          </h2>
          <p className="text-sm mb-8" style={{ color: muted }}>
            {connected.length > 0
              ? `${connected.length} repo${connected.length !== 1 ? "s" : ""} ready — pick a suggestion or type your question`
              : "Use \"Manage Repos\" above to connect your GitHub repositories"}
          </p>
          {connected.length > 0 && (
            <div className="grid grid-cols-2 gap-2.5 w-full">
              {QUICK_STARTS.map(({ icon: Icon, text: t }: any) => (
                <button key={t} onClick={() => { setInput(t); setTimeout(() => textareaRef.current?.focus(), 50); }}
                  className="flex items-center gap-3 text-left px-4 py-3.5 rounded-xl transition-all group"
                  style={{ background: card, border: `1px solid ${border}`, color: text }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(124,111,247,0.12)" }}>
                    <Icon className="w-4 h-4" style={{ color: "#7c6ff7" }} />
                  </div>
                  <span className="text-sm font-medium">{t}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}