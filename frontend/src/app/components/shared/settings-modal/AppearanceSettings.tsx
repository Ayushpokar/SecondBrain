import { useState } from "react";
import { Moon, Sun, Check } from "lucide-react";
import { Theme } from "../../../types";

export function AppearanceSettings({ isDark, theme, onThemeToggle, text, muted, cardBg, border }: any) {
  const [notifs, setNotifs] = useState({ suggestions: true, updates: false });

  return (
    <>
      <div>
        <p className="text-xs font-semibold mb-2" style={{ color: muted }}>Theme</p>
        <div className="grid grid-cols-2 gap-2">
          {(["dark", "light"] as Theme[]).map(t => (
            <button key={t} onClick={() => t !== theme && onThemeToggle()}
              className="flex items-center gap-2.5 p-3 rounded-xl transition-all capitalize"
              style={{ background: theme === t ? "rgba(124,111,247,0.12)" : cardBg, border: `1.5px solid ${theme === t ? "rgba(124,111,247,0.4)" : border}`, color: theme === t ? "#a89ff9" : muted }}>
              {t === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              <span className="text-sm font-medium">{t}</span>
              {theme === t && <Check className="w-3.5 h-3.5 ml-auto" />}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold mb-2" style={{ color: muted }}>Notifications</p>
        {[["AI response suggestions", "suggestions"], ["Product updates", "updates"]].map(([label, key]) => (
          <div key={key} className="flex items-center justify-between py-2.5" style={{ borderBottom: `1px solid ${border}` }}>
            <p className="text-sm" style={{ color: text }}>{label}</p>
            <button onClick={() => setNotifs(n => ({ ...n, [key]: !n[key as keyof typeof n] }))}
              className="w-9 h-5 rounded-full transition-all relative"
              style={{ background: notifs[key as keyof typeof notifs] ? "#7c6ff7" : isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)" }}>
              <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
                style={{ left: notifs[key as keyof typeof notifs] ? "calc(100% - 18px)" : "2px" }} />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}