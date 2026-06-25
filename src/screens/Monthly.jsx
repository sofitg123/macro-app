import { getLastNDays } from "../storage";

export default function Monthly() {
  const days = getLastNDays(30);
  const tracked = days.filter(d => d.kcal > 0);

  const avg = tracked.length > 0 ? {
    kcal: Math.round(tracked.reduce((a, d) => a + d.kcal, 0) / tracked.length),
    prot: Math.round(tracked.reduce((a, d) => a + d.prot, 0) / tracked.length),
    carb: Math.round(tracked.reduce((a, d) => a + d.carb, 0) / tracked.length),
    fat: Math.round(tracked.reduce((a, d) => a + d.fat, 0) / tracked.length),
  } : { kcal: 0, prot: 0, carb: 0, fat: 0 };

  const daysOnKcal = tracked.filter(d => d.kcal >= 1800 && d.kcal <= 2400).length;
  const daysOnProt = tracked.filter(d => d.prot >= 110).length;

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
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          {[
            { label: "Kcal promedio", value: avg.kcal, unit: "kcal", goal: 2200, color: "#4A9F2A" },
            { label: "Proteína promedio", value: avg.prot, unit: "g", goal: 125, color: "#2A80C0" },
            { label: "Carbs promedio", value: avg.carb, unit: "g", goal: 154, color: "#C08020" },
            { label: "Grasa promedio", value: avg.fat, unit: "g", goal: 65, color: "#C04040" },
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

        <div style={{ background: "#fff", borderRadius: 14, padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>¿Quieres tu análisis mensual?</div>
          <p style={{ fontSize: 13, color: "#999", lineHeight: 1.5 }}>Ve a la pantalla Semana, toca "Exportar semana para análisis con Claude", pega el texto en un chat nuevo con Claude y recibe tu análisis personalizado.</p>
        </div>
      </>}
    </div>
  );
}
