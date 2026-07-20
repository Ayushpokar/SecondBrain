import type { ElementType } from "react";
import { SettingsSection } from "../../../types";

export function SettingsSidebar({ 
  sections, section, setSection, sideBg, border, muted 
}: { 
  sections: readonly { id: SettingsSection; label: string; icon: ElementType }[];
  section: SettingsSection;
  setSection: (id: SettingsSection) => void;
  sideBg: string; border: string; muted: string;
}) {
  return (
    <div className="w-44 flex-shrink-0 flex flex-col py-4" style={{ background: sideBg, borderRight: `1px solid ${border}` }}>
      <p className="px-4 text-xs font-bold uppercase tracking-widest mb-3" style={{ color: muted }}>Settings</p>
      {sections.map(s => (
        <button key={s.id} onClick={() => setSection(s.id)}
          className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-all mx-2 rounded-xl"
          style={{ background: section === s.id ? "rgba(124,111,247,0.15)" : "transparent", color: section === s.id ? "#a89ff9" : muted }}>
          <s.icon className="w-4 h-4 flex-shrink-0" />
          {s.label}
        </button>
      ))}
    </div>
  );
}