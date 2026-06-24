import { useState } from "react";
import { getLastNDays, DAILY_GOALS } from "../storage";

export default function Monthly() {
  const [tip, setTip] = useState(null);
  const [loading, setLoading] = useState(false);
  const days = getLastNDays(30);
  const tracked = days.filter(d => d.kcal > 0);

  const avg = tracked.length > 0 ? {
    kcal: Math.round(tracked.reduce((a, d) => a + d.kcal, 0) / tracked.length),
    prot: Math.round(tracked.reduce((a, d) => a + d.prot, 0) / tracked.length),
    carb: Math.round(tracked.reduce((a, d) => a + d.carb, 0) / tracked.length),
    fat: Math.round(tracked.reduce((a, d) => a + d.fat, 0) / tracked.length),
  } : { kcal: 0, prot: 0, carb: 0, fat: 0 };

  const daysOnKcal = tracked.filter(d => d.kcal >= 1600 && d.kcal <= 2200).length;
  const daysOnProt = tracked.filter(d => d.prot >= 100).length;
  const bestDay = tracked.length > 0 ? tracked.reduce((a, b) => (b.prot > a.prot ? b : a), tracked[0]) : null;

  const getTip = async () => {
    setLoading(true);
    try {
      const summary = `La usuaria tiene las siguientes metas: 2000 kcal/día y 120g proteína/día. En los últimos ${tracked.length} días registrados: promedio de ${avg.kcal} kcal y ${avg.prot}g proteína. Llegó a meta de calorías ${daysOnKcal} de ${tracked.length} días. Llegó a meta de proteína ${daysOnProt} de ${tracked.length} días. Su mejor día fue ${bestDay?.label} con ${bestDay?.prot}g proteína.`;
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: "Eres una nutrióloga concisa que da tips específicos y accionables en español mexicano casual. Máximo 3 oraciones. Sin saludos. Sin emojis. Solo el tip directo basado en los datos.",
          messages: [{ role: "user", content: `Basado en estos datos de la semana, dame 1 tip específico y accionable: ${summary}` }],
        }),
      });
      const data = await res.json();
      setTip(data.content?.[0]?.text || "No se pudo generar el tip.");
    } catch {
      setTip("Conecta internet para generar tu tip personalizado.");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "20px 16px" }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Este mes</h2>
      <p style={{ fontSize: 13, color: "#999", marginBottom: 20 }}>{tracked.length} días registrados de 30</p>

      {tracked.length === 0 && (
        <div style={{ background: "#fff", borderRadius: 14, padding: 24, textAlign: "center", color: "#bbb", fontSize: 14 }}>
          Aún no hay datos. Empieza a registrar en la pestaña Hoy.
        </div>
      )}

      {tracked.length > 0 && <>
        {/* Avg macros */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          {[
            { label: "Kcal promedio", value: avg.kcal, unit: "kcal", goal: 2000, color: "#4A9F2A" },
            { label: "Proteína promedio", value: avg.prot, unit: "g", goal: 120, color: "#2A80C0" },
            { label: "Carbs promedio", value: avg.carb, unit: "g", goal: 100, color: "#C08020" },
            { label: "Grasa promedio", value: avg.fat, unit: "g", goal: 60, color: "#C04040" },
          ].map(m => {
            const ok = m.value >= m.goal * 0.85 && m.value <= m.goal * 1.15;
            return (
              <div key={m.label} style={{ background: "#fff", borderRadius: 12, padding: "14px 14px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: 10, color: "#999", marginBottom: 4 }}>{m.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "monospace", color: ok ? m.color : "#C03030" }}>{m.value}{m.unit}</div>
                <div style={{ fontSize: 10, color: "#bbb" }}>meta {m.goal}{m.unit}</div>
              </div>
            );
          })}
        </div>

        {/* Meta days */}
        <div style={{ background: "#fff", borderRadius: 14, padding: "16px", marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Días en meta</div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "#999", marginBottom: 6 }}>Calorías ✓</div>
              <div style={{ background: "#EBEBEB", borderRadius: 6, height: 8, overflow: "hidden" }}>
                <div style={{ height: "100%", background: "#4A9F2A", borderRadius: 6, width: `${(daysOnKcal / tracked.length) * 100}%` }} />
              </div>
              <div style={{ fontSize: 12, fontFamily: "monospace", fontWeight: 600, marginTop: 4, color: "#4A9F2A" }}>{daysOnKcal}/{tracked.length}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "#999", marginBottom: 6 }}>Proteína ✓</div>
              <div style={{ background: "#EBEBEB", borderRadius: 6, height: 8, overflow: "hidden" }}>
                <div style={{ height: "100%", background: "#2A80C0", borderRadius: 6, width: `${(daysOnProt / tracked.length) * 100}%` }} />
              </div>
              <div style={{ fontSize: 12, fontFamily: "monospace", fontWeight: 600, marginTop: 4, color: "#2A80C0" }}>{daysOnProt}/{tracked.length}</div>
            </div>
          </div>
        </div>

        {/* AI Tip */}
        <div style={{ background: "#fff", borderRadius: 14, padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Tip personalizado IA</div>
          {tip && <p style={{ fontSize: 14, lineHeight: 1.6, color: "#333", margin: "0 0 12px" }}>{tip}</p>}
          {!tip && <p style={{ fontSize: 13, color: "#bbb", margin: "0 0 12px" }}>Genera tu tip semanal basado en tus datos reales.</p>}
          <button
            onClick={getTip}
            disabled={loading}
            style={{ width: "100%", padding: "12px", background: loading ? "#F0F0F0" : "#1A1A1A", color: loading ? "#bbb" : "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: loading ? "default" : "pointer" }}
          >
            {loading ? "Generando..." : tip ? "Regenerar tip" : "Generar mi tip"}
          </button>
        </div>
      </>}
    </div>
  );
}
