import { Bot, User } from "lucide-react";

export function TerminalPreview() {
  return (
    <div className="mt-16 w-full max-w-2xl rounded-2xl overflow-hidden text-left" style={{ background: "#17171c", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 40px 100px rgba(0,0,0,0.6)" }}>
      {/* Terminal bar */}
      <div className="flex items-center gap-2 px-4 py-3" style={{ background: "#111116", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <span className="w-3 h-3 rounded-full" style={{ background: "#ff5f57" }} />
        <span className="w-3 h-3 rounded-full" style={{ background: "#febc2e" }} />
        <span className="w-3 h-3 rounded-full" style={{ background: "#28c840" }} />
        <span className="flex-1 text-center text-xs font-mono text-white/20">secondbrain · next-commerce</span>
      </div>
      {/* Fake chat */}
      <div className="p-5 space-y-4">
        <div className="flex gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <User className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="px-4 py-2.5 rounded-2xl rounded-bl-md text-sm text-white/90" style={{ background: "rgba(124,111,247,0.3)" }}>
            Where does the order get created after payment succeeds?
          </div>
        </div>
        <div className="flex gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <Bot className="w-3.5 h-3.5" style={{ color: "#7c6ff7" }} />
          </div>
          <div className="flex-1">
            <div className="px-4 py-3 rounded-2xl rounded-bl-md text-sm text-white/80 leading-relaxed" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              After <code className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ background: "rgba(124,111,247,0.2)", color: "#a89ff9" }}>payment_intent.succeeded</code> fires, the webhook handler in{" "}
              <code className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ background: "rgba(124,111,247,0.2)", color: "#a89ff9" }}>app/api/webhooks/stripe/route.ts</code>{" "}
              calls <code className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ background: "rgba(124,111,247,0.2)", color: "#a89ff9" }}>OrderService.createFromPayment()</code> which inserts the order and sends the confirmation email.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}