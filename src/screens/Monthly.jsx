import { getLastNDays } from "../storage";

const DEFICIT_KCAL_DAY = 1566;
const MAINTENANCE_KCAL_DAY = 1816;
const DEFICIT_KCAL_MONTH = 46980;
const MAINTENANCE_KCAL_MONTH = 54480;
const DEFICIT_MENSUAL_GRASA = 7500;

export default function Monthly() {
  const days = getLastNDays(30);
  const tracked = days.filter(d => d.kcal > 0);

  const totalKcalMes = Math.round(tracked.reduce((a, d) => a + d.kcal, 0));
  const totalProtMes = Math.round(tracked.reduce((a, d) => a + d.prot, 0));

  const avg = tracked.length > 0 ? {
    kcal: Math.round(totalKcalMes / tracked.length),
    prot: Math.round(totalProtMes / tracked.length),
    carb: Math.round(tracked.reduce((a, d) => a + d.carb, 0) / tracked.length),
    fat: Math.round(tracked.reduce((a, d) => a + d.fat, 0) / tracked.length),
  } : { kcal: 0, prot: 0, carb: 0, fat: 0 };

  const daysOnKcal = tracked.filter(d => d.kcal <= MAINTENANCE_KCAL_DAY).length;
  const daysOnProt = tracked.filter(d => d.prot >= 110).length;

  // Déficit estimado real vs objetivo
  const deficitGenerado = MAINTENANCE_KCAL_DAY * tracked.length - totalKcalMes;
  const deficitObjetivoProrrateado = DEFICIT_MENSUAL_GRASA * (tracked.length / 30);
  const pctDeficit = Math.min((deficitGenerado / DEFICIT_MENSUAL_GRASA) * 100, 100);

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

        {/* Acumulado mensual */}
        <div style={{ background: "#fff", borderRadius: 14, padding: 16, marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Acumulado del mes</div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#999", marginBottom: 5 }}>
              <span>Calorías en déficit</span>
              <span>{totalKcalMes.toLocaleString()} de {DEFICIT_KCAL_MONTH.toLocaleString()}</span>
            </div>
            <div style={{ background: "#EBEBEB", borderRadius: 6, height: 7, overflow: "hidden" }}>
              <div style={{ height: "100%", background: "#6B9FD4", borderRadius: 6, width: `${Math.min((totalKcalMes / DEFICIT_KCAL_MONTH) * 100, 100)}%` }} />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#999", marginBottom: 5 }}>
              <span>Calorías de mantenimiento</span>
              <span>{totalKcalMes.toLocaleString()} de {MAINTENANCE_KCAL_MONTH.toLocaleString()}</span>
            </div>
            <div style={{ background: "#EBEBEB", borderRadius: 6, height: 7, overflow: "hidden" }}>
              <div style={{ height: "100%", background: "#AAB8A8", borderRadius: 6, width: `${Math.min((totalKcalMes / MAINTENANCE_KCAL_MONTH) * 100, 100)}%` }} />
            </div>
          </div>

          <div style={{ borderTop: "1px solid #F5F5F5", paddingTop: 12, marginTop: 4 }}>
            <div style={{ fontSize: 11, color: "#999", marginBottom: 5 }}>
              Déficit estimado generado ({tracked.length} días registrados)
            </div>
            <div style={{ background: "#EBEBEB", borderRadius: 6, height: 7, overflow: "hidden", marginBottom: 6 }}>
              <div style={{ height: "100%", background: "#4A9F2A", borderRadius: 6, width: `${pctDeficit}%` }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
              <span style={{ color: "#4A9F2A", fontWeight: 600 }}>{Math.round(deficitGenerado).toLocaleString()} kcal generadas</span>
              <span style={{ color: "#bbb" }}>meta: {DEFICIT_MENSUAL_GRASA.toLocaleString()} kcal (~1 kg grasa)</span>
            </div>
          </div>
        </div>

        {/* Promedios */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          {[
            { label: "Kcal promedio", value: avg.kcal, unit: "kcal", ref1: DEFICIT_KCAL_DAY, ref2: MAINTENANCE_KCAL_DAY, color: "#6B9FD4" },
            { label: "Proteína promedio", value: avg.prot, unit: "g", ref1: 110, ref2: 125, color: "#2A80C0" },
            { label: "Carbs promedio", value: avg.carb, unit: "g", ref1: 120, ref2: 154, color: "#C08020" },
            { label: "Grasa promedio", value: avg.fat, unit: "g", ref1: 50, ref2: 65, color: "#C04040" },
          ].map(m => {
            const ok = m.value >= m.ref1 && m.value <= m.ref2;
            return (
              <div key={m.label} style={{ background: "#fff", borderRadius: 12, padding: "14px 14px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: 10, color: "#999", marginBottom: 4 }}>{m.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "monospace", color: ok ? m.color : "#888" }}>{m.value}{m.unit}</div>
                <div style={{ fontSize: 10, color: "#bbb" }}>déficit {m.ref1} · mant. {m.ref2}</div>
              </div>
            );
          })}
        </div>

        {/* Días en meta */}
        <div style={{ background: "#fff", borderRadius: 14, padding: "16px", marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Días en meta</div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "#999", marginBottom: 6 }}>Kcal en rango ✓</div>
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

        <div style={{ background: "#fff", borderRadius: 14, padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>¿Quieres tu análisis mensual?</div>
          <p style={{ fontSize: 13, color: "#999", lineHeight: 1.5 }}>Ve a la pantalla Semana, toca "Exportar semana para análisis con Claude", pega el texto en un chat nuevo con Claude y recibe tu análisis personalizado.</p>
        </div>
      </>}
    </div>
  );
}
