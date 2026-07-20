import { Cpu, Check, Zap } from "lucide-react";

const AI_MODELS = [
  { id: "claude-sonnet-4-6", name: "Claude Sonnet 4.6", desc: "Fast, balanced — recommended", badge: "Default" },
  { id: "claude-opus-4-8", name: "Claude Opus 4.8", desc: "Most capable, slower", badge: "Best" },
  { id: "claude-haiku-4-5", name: "Claude Haiku 4.5", desc: "Fastest, lightweight", badge: "Fast" },
];

export function ModelSettings({ selectedModel, onModelChange, isDark, text, muted, cardBg, border }: any) {
  return (
    <>
      <p className="text-xs" style={{ color: muted }}>Choose the AI model used for all conversations.</p>
      <div className="space-y-2">
        {AI_MODELS.map(m => (
          <button key={m.id} onClick={() => onModelChange(m.id)}
            className="w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition-all"
            style={{ background: selectedModel === m.id ? "rgba(124,111,247,0.12)" : cardBg, border: `1.5px solid ${selectedModel === m.id ? "rgba(124,111,247,0.4)" : border}` }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: selectedModel === m.id ? "rgba(124,111,247,0.2)" : isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}>
              <Cpu className="w-4 h-4" style={{ color: selectedModel === m.id ? "#7c6ff7" : muted }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold" style={{ color: text }}>{m.name}</p>
                <span className="text-xs px-1.5 py-0.5 rounded-md font-mono" style={{ background: "rgba(124,111,247,0.15)", color: "#a89ff9" }}>{m.badge}</span>
              </div>
              <p className="text-xs" style={{ color: muted }}>{m.desc}</p>
            </div>
            {selectedModel === m.id && <Check className="w-4 h-4 flex-shrink-0" style={{ color: "#7c6ff7" }} />}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: cardBg }}>
        <Zap className="w-4 h-4 flex-shrink-0" style={{ color: "#eab308" }} />
        <div>
          <p className="text-xs font-medium" style={{ color: text }}>Usage this month</p>
          <p className="text-xs" style={{ color: muted }}>124,500 tokens · ~$0.37</p>
        </div>
      </div>
    </>
  );
}