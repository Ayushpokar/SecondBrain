import { MessageSquare, Pin, PinOff, Trash2 } from "lucide-react";
import type { MouseEvent } from "react";
import type { Chat } from "../../../types"; // Adjust path to your types file

type ChatRowProps = {
  chat: Chat;
  isActive: boolean;
  isDark: boolean;
  text: string;
  muted: string;
  onSelect: () => void;
  onDelete: (id: string, event: MouseEvent) => void;
  onTogglePin: (id: string, event: MouseEvent) => void;
};

export function ChatRow({ chat, isActive, isDark, text, muted, onSelect, onDelete, onTogglePin }: ChatRowProps) {
  return (
    <div onClick={onSelect} className="group flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-all mb-0.5"
      style={{ background: isActive ? isDark ? "rgba(124,111,247,0.15)" : "rgba(108,92,231,0.1)" : "transparent", border: `1px solid ${isActive ? "rgba(124,111,247,0.25)" : "transparent"}` }}
      onMouseEnter={event => { if (!isActive) event.currentTarget.style.background = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"; }}
      onMouseLeave={event => { if (!isActive) event.currentTarget.style.background = "transparent"; }}>
      <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" style={{ color: isActive ? "#7c6ff7" : muted }} />
      <span className="flex-1 text-xs font-medium truncate" style={{ color: isActive ? isDark ? "#a89ff9" : "#6c5ce7" : text }}>{chat.title}</span>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
        <button onClick={event => onTogglePin(chat.id, event)} className="w-5 h-5 rounded flex items-center justify-center transition-colors" style={{ color: chat.pinned ? "#7c6ff7" : muted }} onMouseEnter={event => event.currentTarget.style.color = "#7c6ff7"} onMouseLeave={event => event.currentTarget.style.color = chat.pinned ? "#7c6ff7" : muted}>
          {chat.pinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
        </button>
        <button onClick={event => {event.stopPropagation(); onDelete(chat.id, event)}} className="w-5 h-5 rounded flex items-center justify-center transition-colors" style={{ color: muted }} onMouseEnter={event => event.currentTarget.style.color = "#f04343"} onMouseLeave={event => event.currentTarget.style.color = muted}>
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}