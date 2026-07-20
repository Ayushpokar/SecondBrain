import { Github } from "lucide-react";
import { BrainLogo } from "../../shared/BrainLogo";

export function LoginNavbar({ onLogin }: { onLogin: () => void }) {
  return (
    <nav className="relative z-10 flex items-center justify-between px-8 py-5">
      <div className="flex items-center gap-2.5">
        <BrainLogo size={32} color="#7c6ff7" />
        <span className="text-white font-bold text-base">SecondBrain</span>
      </div>
      <div className="flex items-center gap-3">
        <a href="#features" className="text-sm text-white/50 hover:text-white transition-colors hidden sm:block">Features</a>
        <button
          onClick={onLogin}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white border border-white/10 hover:border-white/25 transition-all"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <Github className="w-4 h-4" />Sign in
        </button>
      </div>
    </nav>
  );
}