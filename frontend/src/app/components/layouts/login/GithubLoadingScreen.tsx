import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { BrainLogo } from "../../shared/BrainLogo";


export function GithubLoadingScreen({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const steps = [
    "Authenticating with GitHub…",
    "Fetching your repositories…",
    "Syncing repo metadata…",
    "Setting up your workspace…",
  ];

  useEffect(() => {
    const timers = steps.map((_, i) =>
      setTimeout(() => setStep(i + 1), (i + 1) * 500)
    );
    setTimeout(onDone, steps.length * 500 + 400);
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "#0d0d10", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-[0.06]" style={{ background: "radial-gradient(circle, #7c6ff7, transparent 70%)" }} />
      </div>
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="relative">
          <BrainLogo size={52} color="#7c6ff7" />
          <span className="absolute -right-1 -bottom-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#22c55e" }}>
            <Check className="w-3 h-3 text-white" strokeWidth={3} />
          </span>
        </div>
        <div className="text-center">
          <p className="text-white font-bold text-lg mb-1">Connecting SecondBrain</p>
          <p className="text-xs text-white/40 font-mono">github.com/devraj</p>
        </div>
        <div className="w-64 space-y-2.5">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${step > i ? "scale-100" : "scale-75 opacity-30"}`}
                style={{ background: step > i ? "#7c6ff7" : "rgba(255,255,255,0.1)" }}>
                {step > i
                  ? <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  : <span className="w-1.5 h-1.5 rounded-full bg-white/40" />}
              </div>
              <span className={`text-sm transition-all duration-300 ${step > i ? "text-white" : "text-white/25"}`}>{s}</span>
            </div>
          ))}
        </div>
        <div className="w-64 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(step / steps.length) * 100}%`, background: "linear-gradient(90deg, #7c6ff7, #9b8ff9)" }} />
        </div>
      </div>
    </div>
  );
}