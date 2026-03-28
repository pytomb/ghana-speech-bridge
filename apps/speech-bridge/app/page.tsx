import { getBudgetStatus } from "@/lib/budget";
import { getRegistryStatus } from "@/lib/registry";

export default function DashboardPage() {
  const budget = getBudgetStatus();
  const models = getRegistryStatus();

  const barWidth = `${budget.percentUsed}%`;
  const barColor = budget.percentUsed >= 80 ? "#ef4444" : budget.percentUsed >= 60 ? "#f59e0b" : "#22c55e";

  return (
    <main>
      <h1 style={{ marginBottom: "0.25rem" }}>🇬🇭 Ghana Speech Bridge</h1>
      <p style={{ color: "#888", marginBottom: "2rem" }}>Voice + language infrastructure — Akwaaba!</p>

      {/* Budget */}
      <section style={{ marginBottom: "2rem" }}>
        <h2>API Budget — {budget.month}</h2>
        <div style={{ background: "#1a1a1a", borderRadius: 6, height: 12, marginBottom: 8 }}>
          <div style={{ background: barColor, width: barWidth, height: "100%", borderRadius: 6, transition: "width 0.3s" }} />
        </div>
        <p>{budget.callsUsed} / {budget.callsLimit} calls used ({budget.percentUsed}%) — {budget.cacheHits} saved by cache</p>
        <table style={{ borderCollapse: "collapse", marginTop: 8 }}>
          <thead>
            <tr style={{ color: "#888" }}>
              <th style={{ textAlign: "left", paddingRight: 24 }}>Type</th>
              <th style={{ textAlign: "right" }}>Calls</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(budget.breakdown).map(([type, count]) => (
              <tr key={type}>
                <td style={{ paddingRight: 24 }}>{type}</td>
                <td style={{ textAlign: "right" }}>{count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Model Registry */}
      <section style={{ marginBottom: "2rem" }}>
        <h2>Model Registry</h2>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr style={{ color: "#888", borderBottom: "1px solid #333" }}>
              <th style={{ textAlign: "left", padding: "4px 16px 4px 0" }}>Model</th>
              <th style={{ textAlign: "left", padding: "4px 16px 4px 0" }}>Capability</th>
              <th style={{ textAlign: "left", padding: "4px 16px 4px 0" }}>Languages</th>
              <th style={{ textAlign: "left", padding: "4px 0" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {models.map((m) => {
              const statusColor = m.status === "active" ? "#22c55e" : m.status === "training" ? "#f59e0b" : "#888";
              return (
                <tr key={m.id} style={{ borderBottom: "1px solid #1a1a1a" }}>
                  <td style={{ padding: "6px 16px 6px 0", fontSize: "0.85rem" }}>{m.id}</td>
                  <td style={{ padding: "6px 16px 6px 0", color: "#aaa" }}>{m.capability}</td>
                  <td style={{ padding: "6px 16px 6px 0", color: "#aaa" }}>{m.languages.join(", ")}</td>
                  <td style={{ padding: "6px 0", color: statusColor }}>{m.status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* API Quick Reference */}
      <section>
        <h2>Endpoints</h2>
        <pre style={{ background: "#1a1a1a", padding: "1rem", borderRadius: 6, fontSize: "0.8rem", color: "#a3e635" }}>
{`POST /api/translate  { text, from, to }
POST /api/stt        multipart: audio, lang
POST /api/tts        { text, lang }
POST /api/detect     { text }
GET  /api/budget`}
        </pre>
      </section>
    </main>
  );
}
