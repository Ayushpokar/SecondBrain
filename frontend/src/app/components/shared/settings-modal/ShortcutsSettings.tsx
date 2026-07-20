const SHORTCUTS = [
  { keys: ["⌘", "N"],         desc: "New chat"           },
  { keys: ["⌘", "K"],         desc: "Search chats"       },
  { keys: ["⌘", "⇧", "R"],   desc: "Open repo manager"  },
  { keys: ["⌘", "⇧", "S"],   desc: "Open settings"      },
  { keys: ["↵"],              desc: "Send message"        },
  { keys: ["⇧", "↵"],        desc: "New line"            },
  { keys: ["⌘", "⇧", "C"],   desc: "Copy last message"  },
  { keys: ["⌘", "⇧", "E"],   desc: "Export chat"        },
];

export function ShortcutsSettings({ text, muted, cardBg, border }: any) {
  return (
    <div className="space-y-1">
      {SHORTCUTS.map(({ keys, desc }) => (
        <div key={desc} className="flex items-center justify-between py-2.5" style={{ borderBottom: `1px solid ${border}` }}>
          <span className="text-sm" style={{ color: text }}>{desc}</span>
          <div className="flex items-center gap-1">
            {keys.map((k, i) => (
              <span key={i} className="px-2 py-0.5 rounded-md text-xs font-mono" style={{ background: cardBg, border: `1px solid ${border}`, color: muted }}>{k}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}