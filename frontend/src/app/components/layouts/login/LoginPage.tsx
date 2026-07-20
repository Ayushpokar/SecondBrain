import { Github, Sparkles } from "lucide-react";
import { useState } from "react";
import { LoginNavbar } from "./LoginNavbar";
import { TerminalPreview } from "./TerminalPreview";
import { FeaturesGrid } from "./FeaturesGrid";
import axios from 'axios';
import { GithubLoadingScreen } from "./GithubLoadingScreen";
import { useSearchParams } from "react-router";

export function LoginPage({ onLogin }: { onLogin: () => void }) {
  const handleLogin = async () => {
    window.location.href = "http://localhost:8000/auth/login/github";
    const [searchParams] = useSearchParams();

    const error = searchParams.get("error");

    return (
        <>
            {error && (
                <p style={{ color: "red" }}>
                    GitHub login failed. Please try again.
                </p>
            )}

            <button onClick={handleLogin}>
                Login with GitHub
            </button>
        </>
    );
  };

  
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0d0d10", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[30%] w-[600px] h-[600px] rounded-full opacity-[0.07]" style={{ background: "radial-gradient(circle, #7c6ff7, transparent 70%)" }} />
        <div className="absolute bottom-[-10%] right-[20%] w-[400px] h-[400px] rounded-full opacity-[0.05]" style={{ background: "radial-gradient(circle, #9b8ff9, transparent 70%)" }} />
      </div>

      <LoginNavbar onLogin={handleLogin} />

      {/* Hero */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-8 pb-20 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8 text-xs font-semibold" style={{ background: "rgba(124,111,247,0.15)", color: "#a89ff9", border: "1px solid rgba(124,111,247,0.25)" }}>
          <Sparkles className="w-3 h-3" />
          Powered by Claude AI · Built for developers
        </div>

        {/* Heading */}
        <h1 className="text-5xl sm:text-6xl font-extrabold text-white mb-5 leading-tight tracking-tight max-w-2xl">
          Your codebase,{" "}
          <span className="relative inline-block">
            <span style={{ color: "#a89ff9" }}>understood.</span>
            <svg className="absolute -bottom-1 left-0 w-full" height="4" viewBox="0 0 200 4" fill="none" preserveAspectRatio="none">
              <path d="M0 2 Q50 0 100 2 Q150 4 200 2" stroke="#7c6ff7" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </svg>
          </span>
        </h1>

        <p className="text-lg text-white/50 max-w-lg mb-10 leading-relaxed">
          Connect your GitHub repos and chat with your code. Trace logic, find bugs, understand architecture — all in plain English.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleLogin}
            className="flex items-center gap-3 px-6 py-3.5 rounded-2xl text-white font-semibold text-base transition-all hover:opacity-90 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #7c6ff7, #9b8ff9)", minWidth: "220px" }}
          >
            <Github className="w-5 h-5" />
            Continue with GitHub
          </button>
          <p className="text-xs text-white/30">Free to use · No credit card</p>
        </div>

        <TerminalPreview />
        <FeaturesGrid />
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center pb-8">
        <p className="text-xs text-white/20">© 2025 SecondBrain · Built for developers, by developers</p>
      </div>
    </div>
  );
}