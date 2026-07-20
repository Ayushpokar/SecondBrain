import { Code2, GitBranch, Lock, Sparkles } from "lucide-react";

const FEATURES = [
  { icon: Code2,       title: "Chat with any repo",      desc: "Ask questions, trace logic, find bugs across your entire codebase." },
  { icon: GitBranch,   title: "Multi-repo context",      desc: "Pull in multiple repos at once and ask cross-cutting questions." },
  { icon: Sparkles,    title: "Powered by Claude",       desc: "State-of-the-art AI that actually understands code structure." },
  { icon: Lock,        title: "Private & secure",        desc: "Your code never leaves your session. Keys stored locally." },
];

export function FeaturesGrid() {
  return (
    <div id="features" className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-2xl">
      {FEATURES.map(({ icon: Icon, title, desc }) => (
        <div key={title} className="flex flex-col items-start gap-2 p-4 rounded-2xl text-left" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(124,111,247,0.15)" }}>
            <Icon className="w-4 h-4" style={{ color: "#7c6ff7" }} />
          </div>
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="text-xs text-white/40 leading-relaxed">{desc}</p>
        </div>
      ))}
    </div>
  );
}