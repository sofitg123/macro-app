import { getLastNDays } from "../storage";

const MAINTENANCE_KCAL_DAY = 1816;
const DEFICIT_MENSUAL_GRASA = 7500;

export default function Monthly() {
  const days = getLastNDays(30);
  const tracked = days.filter(d => d.kcal > 0);

  const totalKcalMes = Math.round(tracked.reduce((a, d) => a + d.kcal, 0));

  const avg = tracked.length > 0 ? {
    kcal: Math.round(totalKcalMes / tracked.length),
    prot: Math.round(tracked.reduce((a, d) => a + d.prot, 0) / tracked.length),
    carb: Math.round(tracked.reduce((a, d) => a + d.carb, 0) / tracked.length),
    fat: Math.round(tracked.reduce((a, d) => a + d.fat, 0) / tracked.length),
  } : { kcal: 0, prot: 0, carb: 0, fat: 0 };

  const daysOnKcal = tracked.filter(d => d.kcal >= 1400 && d.kcal <= MAINTENANCE_KCAL_DAY).length;
  const daysOnProt = tracked.filter(d => d.prot >= 110).length;

  const deficitGenerado = Math.round(MAINTENANCE_KCAL_DAY * tracked.length - totalKcalMes);
  const logroDeficit = deficitGenerado >= DEFICIT_MENSUAL_GRASA;
  const pctDeficit = Math.min((deficitGenerado / DEFICIT_MENSUAL_GRASA) * 100, 100);
  const grasaEstimada = (deficitGenerado / 7700 * 1000).toFixed(0);

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

        {/* Promedios */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          {[
            { label: "Kcal promedio", value: avg.kcal, unit: "kcal", ok: avg.kcal >= 1400 && avg.kcal <= MAINTENANCE_KCAL_DAY, color: "#6B9FD4", ref: "1,566–1,816" },
            { label: "Proteína promedio", value: avg.prot, unit: "g", ok: avg.prot >= 110, color: "#2A80C0", ref: "meta 125g" },
            { label: "Carbs promedio", value: avg.carb, unit: "g", ok: avg.carb >= 100 && avg.carb <= 154, color: "#C08020", ref: "meta 154g" },
            { label: "Grasa promedio", value: avg.fat, unit: "g", ok: avg.fat >= 40 && avg.fat <= 65, color: "#C04040", ref: "meta 65g" },
          ].map(m => (
            <div key={m.label} style={{ background: "#fff", borderRadius: 12, padding: "14px 14px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: 10, color: "#999", marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "monospace", color: m.ok ? m.color : "#888" }}>{m.value}{m.unit}</div>
              <div style={{ fontSize: 10, color: "#bbb" }}>{m.ref}</div>
            </div>
          ))}
        </div>

        {/* Días en meta */}
        <div style={{ background: "#fff", borderRadius: 14, padding: "16px", marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Días en meta</div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "#999", marginBottom: 6 }}>Kcal en zona ✓</div>
              <div style={{ background: "#EBEBEB", borderRadius: 6, height: 8, overflow: "hidden" }}>
                <div style={{ height: "100%", background: "#6B9FD4", borderRadius: 6, width: `${(daysOnKcal / tracked.length) * 100}%` }} />
              </div>
              <div style={{ fontSize: 12, fontFamily: "monospace", fontWeight: 600, marginTop: 4, color: "#6B9FD4" }}>{daysOnKcal}/{tracked.length}</div>
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

        {/* Déficit mensual */}
        <div style={{ background: "#fff", borderRadius: 14, padding: 16, marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Déficit del mes</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
            <span style={{ fontSize: 22, fontWeight: 700, fontFamily: "monospace", color: logroDeficit ? "#4A9F2A" : "#6B9FD4" }}>
              {deficitGenerado > 0 ? deficitGenerado.toLocaleString() : 0} kcal
            </span>
            <span style={{ fontSize: 11, color: "#bbb" }}>meta: 7,500 kcal</span>
          </div>
          <div style={{ background: "#EBEBEB", borderRadius: 6, height: 7, overflow: "hidden", marginBottom: 8 }}>
            <div style={{ height: "100%", background: logroDeficit ? "#4A9F2A" : "#6B9FD4", borderRadius: 6, width: `${pctDeficit}%`, transition: "width 0.3s" }} />
          </div>
          <div style={{ fontSize: 12, color: logroDeficit ? "#4A9F2A" : "#888", fontWeight: logroDeficit ? 600 : 400 }}>
            {logroDeficit
              ? `✓ Meta lograda — ~${grasaEstimada}g de grasa pura perdida`
              : `~${grasaEstimada}g de grasa pura estimada · meta: ~1,000g al mes`}
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
