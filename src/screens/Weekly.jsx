import { useState } from "react";
import { getLastNDays, DAILY_GOALS } from "../storage";
import { LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";

const DEFICIT_KCAL_DAY = 1566;
const MAINTENANCE_KCAL_DAY = 1816;
const DEFICIT_KCAL_WEEK = 10962;

function exportWeekData(days) {
  const lines = ["📊 MI SEMANA — REPORTE COMPLETO PARA ANÁLISIS\n"];
  lines.push(`Período: ${days[0]?.date} al ${days[days.length-1]?.date}`);
  lines.push(`Metas de déficit: 1,566 kcal/día · Meta de mantenimiento: 1,816 kcal/día`);
  lines.push(`Meta proteína: 125g/día · Déficit semanal objetivo: 10,962 kcal (0.5 lbs grasa)\n`);

  let trackedDays = 0;
  let totalKcal = 0, totalProt = 0;

  days.forEach(day => {
    const data = JSON.parse(localStorage.getItem("day_" + day.date) || "null");
    if (!data) {
      lines.push(`${day.label}: Sin registro`);
      return;
    }
    trackedDays++;
    totalKcal += day.kcal;
    totalProt += day.prot;

    lines.push(`\n📅 ${day.label} — ${Math.round(day.kcal)} kcal · ${Math.round(day.prot)}g prot`);

    const hungerData = JSON.parse(localStorage.getItem("hunger_" + day.date) || "{}");
    const hungerLabel = { satisfecha: "😌 Satisfecha", podria_mas: "🤔 Podría comer más", hambrienta: "😤 Me quedé hambrienta" };
    ["desayuno", "comida", "cena"].forEach(meal => {
      const mealData = data[meal] || {};
      const items = Object.values(mealData);
      if (items.length === 0) return;
      const mealLabel = { desayuno: "🌅 Desayuno", comida: "☀️ Comida", cena: "🌙 Cena" }[meal];
      const mealKcal = items.reduce((a, i) => a + i.kcal * i.count, 0);
      const mealProt = items.reduce((a, i) => a + i.prot * i.count, 0);
      const h = hungerData[meal] ? ` — ${hungerLabel[hungerData[meal]]}` : "";
      lines.push(`  ${mealLabel} (${Math.round(mealKcal)} kcal · ${Math.round(mealProt)}g prot)${h}:`);
      items.forEach(item => {
        lines.push(`    - ${item.count > 1 ? item.count + "x " : ""}${item.name} (${item.kcal * item.count} kcal · ${item.prot * item.count}g prot)`);
      });
    });
  });

  if (trackedDays > 0) {
    const deficitGenerado = MAINTENANCE_KCAL_DAY * trackedDays - totalKcal;
    lines.push(`\n📈 RESUMEN DE SEMANA:`);
    lines.push(`Días registrados: ${trackedDays}/7`);
    lines.push(`Promedio kcal: ${Math.round(totalKcal / trackedDays)} (meta déficit 1,566 · mantenimiento 1,816)`);
    lines.push(`Promedio proteína: ${Math.round(totalProt / trackedDays)}g (meta 125g)`);
    lines.push(`Total kcal semana: ${Math.round(totalKcal)} de ${DEFICIT_KCAL_WEEK} (meta déficit)`);
    lines.push(`Déficit estimado generado: ${Math.round(deficitGenerado)} kcal (~${(deficitGenerado / 7700).toFixed(2)} kg grasa)`);
  }

  lines.push(`\n---\nEres mi nutrióloga y coach de salud personal. Analiza detalladamente lo que comí esta semana y dame:`);
  lines.push(`1. Un análisis honesto de mis patrones (sin sugarcoating)`);
  lines.push(`2. Qué alimentos estoy repitiendo demasiado y por qué puede ser un problema`);
  lines.push(`3. Qué tiempos de comida son más débiles en proteína`);
  lines.push(`4. 2-3 cambios concretos y específicos para la próxima semana`);
  lines.push(`5. Un tip para mi caso específico: mujer 29 años, ADHD, historial de binge, meta bajar grasa visceral, 69kg, 33% grasa corporal, meta bajar 7kg de grasa pura. Meta de déficit: 1,566 kcal/día para perder 0.5 lbs/semana.`);
  lines.push(`\nSé específica con los alimentos que ves, no genérica.`);

  return lines.join("\n");
}

export default function Weekly({ onDayPress }) {
  const [copied, setCopied] = useState(false);
  const days = getLastNDays(7);

  const trackedDays = days.filter(d => d.kcal > 0);
  const totalKcalWeek = Math.round(trackedDays.reduce((a, d) => a + d.kcal, 0));
  const totalProtWeek = Math.round(trackedDays.reduce((a, d) => a + d.prot, 0));

  const avg = {
    kcal: trackedDays.length > 0 ? Math.round(totalKcalWeek / trackedDays.length) : 0,
    prot: trackedDays.length > 0 ? Math.round(totalProtWeek / trackedDays.length) : 0,
  };

  const pctKcalWeek = Math.min((totalKcalWeek / DEFICIT_KCAL_WEEK) * 100, 100);

  return (
    <div style={{ padding: "20px 16px" }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Esta semana</h2>
      <p style={{ fontSize: 13, color: "#999", marginBottom: 20 }}>Últimos 7 días</p>

      {/* Avg pills */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <div style={{ flex: 1, background: "#fff", borderRadius: 12, padding: "14px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 11, color: "#999", marginBottom: 4 }}>Promedio kcal</div>
          <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "monospace", color: avg.kcal >= 1400 && avg.kcal <= 1816 ? "#4A9F2A" : "#888" }}>{avg.kcal}</div>
          <div style={{ fontSize: 11, color: "#bbb" }}>déficit 1,566 · mant. 1,816</div>
        </div>
        <div style={{ flex: 1, background: "#fff", borderRadius: 12, padding: "14px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 11, color: "#999", marginBottom: 4 }}>Promedio proteína</div>
          <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "monospace", color: avg.prot >= 110 ? "#4A9F2A" : "#888" }}>{avg.prot}g</div>
          <div style={{ fontSize: 11, color: "#bbb" }}>meta 125g</div>
        </div>
      </div>

      {/* Sumatoria semanal */}
      <div style={{ background: "#fff", borderRadius: 14, padding: 16, marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Acumulado de la semana</div>
        <div style={{ fontSize: 11, color: "#999", marginBottom: 6 }}>
          {totalKcalWeek.toLocaleString()} kcal de {DEFICIT_KCAL_WEEK.toLocaleString()} meta déficit
        </div>
        <div style={{ background: "#EBEBEB", borderRadius: 6, height: 8, overflow: "hidden", marginBottom: 8 }}>
          <div style={{ height: "100%", background: "#6B9FD4", borderRadius: 6, width: `${pctKcalWeek}%`, transition: "width 0.3s" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#bbb" }}>
          <span>{trackedDays.length} días registrados</span>
          <span>{(DEFICIT_KCAL_WEEK - totalKcalWeek).toLocaleString()} kcal restantes</span>
        </div>
      </div>

      {/* Kcal chart */}
      <div style={{ background: "#fff", borderRadius: 14, padding: "16px 8px 8px", marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: 13, fontWeight: 600, paddingLeft: 8, marginBottom: 12 }}>Calorías por día</div>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={days} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis hide domain={[0, 2500]} />
            <Tooltip formatter={(v) => [`${Math.round(v)} kcal`]} labelStyle={{ fontSize: 12 }} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <ReferenceLine y={DEFICIT_KCAL_DAY} stroke="#6B9FD4" strokeDasharray="4 4" label={{ value: "déficit", fontSize: 9, fill: "#6B9FD4", position: "right" }} />
            <ReferenceLine y={MAINTENANCE_KCAL_DAY} stroke="#AAB8A8" strokeDasharray="4 4" label={{ value: "mant.", fontSize: 9, fill: "#AAB8A8", position: "right" }} />
            <Line type="monotone" dataKey="kcal" stroke="#2A80C0" strokeWidth={2} dot={(props) => {
              const { cx, cy, payload } = props;
              const color = payload.kcal === 0 ? "#ddd" : payload.kcal <= MAINTENANCE_KCAL_DAY ? "#4A9F2A" : "#888";
              return <circle key={payload.date} cx={cx} cy={cy} r={5} fill={color} stroke="#fff" strokeWidth={2} />;
            }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Protein chart */}
      <div style={{ background: "#fff", borderRadius: 14, padding: "16px 8px 8px", marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: 13, fontWeight: 600, paddingLeft: 8, marginBottom: 12 }}>Proteína por día</div>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={days} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis hide domain={[0, 160]} />
            <Tooltip formatter={(v) => [`${Math.round(v)}g prot`]} labelStyle={{ fontSize: 12 }} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <ReferenceLine y={125} stroke="#AAB8A8" strokeDasharray="4 4" />
            <Line type="monotone" dataKey="prot" stroke="#C08020" strokeWidth={2} dot={(props) => {
              const { cx, cy, payload } = props;
              const color = payload.prot >= 110 ? "#4A9F2A" : payload.prot === 0 ? "#ddd" : "#888";
              return <circle key={payload.date} cx={cx} cy={cy} r={5} fill={color} stroke="#fff" strokeWidth={2} />;
            }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Day by day */}
      <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        {days.map((day, i) => {
          const enDeficit = day.kcal > 0 && day.kcal <= MAINTENANCE_KCAL_DAY;
          const metaProt = day.prot >= 110;
          const empty = day.kcal === 0;
          return (
            <div key={day.date} onClick={() => onDayPress && onDayPress(day.date)} style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: i < days.length - 1 ? "1px solid #F5F5F5" : "none", cursor: "pointer" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: empty ? "#E0E0E0" : (enDeficit && metaProt) ? "#4A9F2A" : "#AAB8A8", marginRight: 12, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{day.label}</div>
                {!empty && <div style={{ fontSize: 11, color: "#999", marginTop: 1 }}>{Math.round(day.kcal)} kcal · {Math.round(day.prot)}g prot</div>}
                {empty && <div style={{ fontSize: 11, color: "#bbb", marginTop: 1 }}>Sin registro</div>}
              </div>
              {!empty && (
                <div style={{ display: "flex", gap: 4 }}>
                  <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 6, background: enDeficit ? "#E8F4E8" : "#F0F0F0", color: enDeficit ? "#2A7A2A" : "#888" }}>kcal</span>
                  <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 6, background: metaProt ? "#E8F4E8" : "#F0F0F0", color: metaProt ? "#2A7A2A" : "#888" }}>prot</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Export button */}
      <div style={{ margin: "0 0 8px" }}>
        <button
          onClick={() => {
            const text = exportWeekData(days);
            navigator.clipboard.writeText(text).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 3000);
            });
          }}
          style={{ width: "100%", padding: "14px", background: copied ? "#4A9F2A" : "#1A1A1A", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
        >
          {copied ? "✓ Copiado, pégalo en el chat con Claude" : "📋 Exportar semana para análisis con Claude"}
        </button>
        {copied && (
          <div style={{ fontSize: 12, color: "#4A9F2A", textAlign: "center", marginTop: 8 }}>
            Ve a Claude y pega el texto para recibir tu análisis personalizado
          </div>
        )}
      </div>
    </div>
  );
}
