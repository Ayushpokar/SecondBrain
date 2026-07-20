import { useState } from "react";
import { Cpu, Github, Copy, CheckCheck } from "lucide-react";

export function ApiKeysSettings({ text, muted, cardBg, border }: any) {
  const [apiKey, setApiKey] = useState("sk-ant-••••••••••••••••••••••");
  const [copied, setCopied] = useState(false);

  return (
    <>
      <p className="text-xs" style={{ color: muted }}>Manage API keys for AI providers and integrations.</p>
      {[{ label: "Anthropic API Key", value: apiKey, onChange: setApiKey, icon: Cpu },
        { label: "GitHub Token",       value: "ghp_••••••••••••••••", onChange: () => {}, icon: Github }].map(({ label, value, onChange, icon: Icon }) => (
        <div key={label}>
          <p className="text-xs font-semibold mb-1.5" style={{ color: muted }}>{label}</p>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: muted }} />
              <input value={value} onChange={e => onChange(e.target.value)} type="password" className="flex-1 text-xs font-mono bg-transparent outline-none" style={{ color: text }} />
            </div>
            <button onClick={() => { navigator.clipboard?.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
              className="w-10 rounded-xl flex items-center justify-center transition-colors" style={{ background: cardBg, border: `1px solid ${border}`, color: muted }}>
              {copied ? <CheckCheck className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      ))}
      <div className="p-3 rounded-xl" style={{ background: "rgba(124,111,247,0.08)", border: "1px solid rgba(124,111,247,0.2)" }}>
        <p className="text-xs" style={{ color: "#a89ff9" }}>Keys are stored locally and never sent to our servers.</p>
      </div>
    </>
  );
}