import ReactMarkdown from 'react-markdown';

export function MessageContent({ content, isDark }: { content: string; isDark: boolean }) {
  return (
    // The 'prose' class helps style standard markdown elements like lists and headers beautifully.
    <div className={`prose prose-sm max-w-none ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
      <ReactMarkdown
        components={{
          // This intercepts any Markdown code element (both inline `code` and block ```code```)
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const lang = match ? match[1] : '';
            
            // 1. Handle Multi-line Code Blocks
            if (!inline && match) {
              const codeString = String(children).replace(/\n$/, '');
              
              return (
                <div className="my-3 rounded-xl overflow-hidden not-prose" style={{ background: isDark ? "#0d0d10" : "#1a1a24" }}>
                  <div className="flex items-center justify-between px-4 py-2" style={{ background: isDark ? "#17171c" : "#22222e" }}>
                    <span className="text-xs font-mono opacity-50 text-white uppercase tracking-widest">{lang || "code"}</span>
                    <button 
                      onClick={() => navigator.clipboard?.writeText(codeString)} 
                      className="text-xs font-mono text-white/40 hover:text-white/80 transition-colors"
                    >
                      copy
                    </button>
                  </div>
                  <pre className="px-4 py-3 text-xs font-mono overflow-x-auto leading-relaxed text-[#c9d1d9] scrollbar-hide m-0 border-none bg-transparent">
                    <code>{codeString}</code>
                  </pre>
                </div>
              );
            }
            
            // 2. Handle Normal Inline Code
            return (
              <code className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ background: "rgba(124,111,247,0.15)", color: "#a89ff9" }} {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}