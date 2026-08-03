import { useState } from "react";
import { User, Cpu, Key, Palette, Keyboard, X } from "lucide-react";
import type { SettingsSection, Theme } from "../../../types";

// Import our new modules
import { SettingsSidebar } from "./SettingsSidebar";
import { ProfileSettings } from "./ProfileSettings";
import { ModelSettings } from "./ModelSettings";
import { ApiKeysSettings } from "./ApiKeysSettings";
import { AppearanceSettings } from "./AppearanceSettings";
import { ShortcutsSettings } from "./ShortcutsSettings";
import { useAuth } from "../../../context/AuthContext";

export function SettingsModal({ onClose,repos, isDark, theme, onThemeToggle, selectedModel, onModelChange }: {
  onClose: () => void; repos:number; isDark: boolean; theme: Theme;
  onThemeToggle: () => void; selectedModel: string; onModelChange: (m: string) => void;
}) {
  const [section, setSection] = useState<SettingsSection>("profile");

  // CSS variables for styling
  const bg     = isDark ? "#17171c" : "#ffffff";
  const sideBg = isDark ? "#111116" : "#f4f4f8";
  const cardBg = isDark ? "#1e1e25" : "#f0f0f6";
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const text   = isDark ? "#f0f0f4" : "#0d0d14";
  const muted  = isDark ? "#7a7a8a" : "#6b6b80";

  const sections = [
    { id: "profile",    label: "Profile",    icon: User      },
    // { id: "model",      label: "AI Model",   icon: Cpu       },
    // { id: "apikeys",    label: "API Keys",   icon: Key       },
    // { id: "appearance", label: "Appearance", icon: Palette   },
    { id: "shortcuts",  label: "Shortcuts",  icon: Keyboard  },
  ] as const;
const {user} = useAuth()
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-2xl h-[520px] rounded-2xl overflow-hidden flex" style={{ background: bg, border: `1px solid ${border}`, boxShadow: "0 32px 80px rgba(0,0,0,0.5)" }}>

        <SettingsSidebar 
          sections={sections} section={section} setSection={setSection} 
          sideBg={sideBg} border={border} muted={muted} 
        />

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${border}` }}>
            <p className="font-semibold text-sm" style={{ color: text }}>{sections.find(s => s.id === section)?.label}</p>
            <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ color: muted }}
              onMouseEnter={e => (e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Dynamic Tab Content */}
          <div className="flex-1 overflow-y-auto scrollbar-hide p-5 space-y-4">
            {section === "profile" && <ProfileSettings user={user} repos={repos} text={text} muted={muted} cardBg={cardBg} border={border} />}
            
            {/* {section === "model" && <ModelSettings selectedModel={selectedModel} onModelChange={onModelChange} isDark={isDark} text={text} muted={muted} cardBg={cardBg} border={border} />} */}
            
            {/* {section === "apikeys" && <ApiKeysSettings text={text} muted={muted} cardBg={cardBg} border={border} />} */}
            
            {/* {section === "appearance" && <AppearanceSettings isDark={isDark} theme={theme} onThemeToggle={onThemeToggle} text={text} muted={muted} cardBg={cardBg} border={border} />} */}
            
            {section === "shortcuts" && <ShortcutsSettings text={text} muted={muted} cardBg={cardBg} border={border} />}
          </div>
        </div>
      </div>
    </div>
  );
}