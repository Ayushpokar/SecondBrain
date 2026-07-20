export function MessageContent({ content, isDark }: { content: string; isDark: boolean }) {
  const parts = content.split(/(```[\s\S]*?```)/g);
  
  return (
    <>
      {parts.map((part, i) => {
        // Handle Multi-line Code Blocks
        if (part.startsWith("```")) {
          const lines = part.slice(3, -3).split("\n");
          const lang = lines[0].trim();
          const code = lines.slice(1).join("\n");
          
          return (
            <div key={i} className="my-3 rounded-xl overflow-hidden" style={{ background: isDark ? "#0d0d10" : "#1a1a24" }}>
              <div className="flex items-center justify-between px-4 py-2" style={{ background: isDark ? "#17171c" : "#22222e" }}>
                <span className="text-xs font-mono opacity-50 text-white uppercase tracking-widest">{lang || "code"}</span>
                <button 
                  onClick={() => navigator.clipboard?.writeText(code)} 
                  className="text-xs font-mono text-white/40 hover:text-white/80 transition-colors"
                >
                  copy
                </button>
              </div>
              <pre className="px-4 py-3 text-xs font-mono overflow-x-auto leading-relaxed text-[#c9d1d9] scrollbar-hide">
                <code>{code}</code>
              </pre>
            </div>
          );
        }
        
        // Handle Normal Text & Inline Code
        return (
          <span key={i}>
            {part.split(/(`[^`]+`)/g).map((seg, j) =>
              seg.startsWith("`") && seg.endsWith("`")
                ? <code key={j} className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ background: "rgba(124,111,247,0.15)", color: "#a89ff9" }}>{seg.slice(1, -1)}</code>
                : <span key={j}>{seg}</span>
            )}
          </span>
        );
      })}
    </>
  );
}