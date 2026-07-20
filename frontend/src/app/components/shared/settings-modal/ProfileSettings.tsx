export function ProfileSettings({ text, muted, cardBg, border }: any) {
  return (
    <>
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0" style={{ background: "linear-gradient(135deg,#7c6ff7,#5b8def)" }}>D</div>
        <div>
          <p className="font-semibold" style={{ color: text }}>devraj</p>
          <p className="text-sm" style={{ color: muted }}>devraj@example.com</p>
          <p className="text-xs mt-1 font-mono" style={{ color: "#7c6ff7" }}>github.com/devraj</p>
        </div>
      </div>
      {[["Display Name", "devraj"], ["Email", "devraj@example.com"]].map(([label, val]) => (
        <div key={label}>
          <p className="text-xs font-semibold mb-1.5" style={{ color: muted }}>{label}</p>
          <input defaultValue={val} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ background: cardBg, border: `1px solid ${border}`, color: text }} />
        </div>
      ))}
      <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: cardBg }}>
        <div>
          <p className="text-sm font-medium" style={{ color: text }}>GitHub Connected</p>
          <p className="text-xs" style={{ color: muted }}>6 repos synced</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg" style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />Connected
        </span>
      </div>
    </>
  );
}