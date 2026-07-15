import { useState } from "react";
import { getLastNDays, DAILY_GOALS } from "../storage";
import { LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, ReferenceArea, ResponsiveContainer } from "recharts";

const DEFICIT_KCAL_DAY = 1566;
const MAINTENANCE_KCAL_DAY = 1816;
const DEFICIT_KCAL_WEEK = 1750;

function exportWeekData(days) {
  const lines = ["📊 MI SEMANA — REPORTE COMPLETO PARA ANÁLISIS\n"];
  lines.push(`Período: ${days[0]?.date} al ${days[days.length-1]?.date}`);
  lines.push(`Meta déficit: 1,566 kcal/día · Mantenimiento: 1,816 kcal/día · Proteína: 125g/día\n`);

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
        lines.push(`    - ${item.count > 1 ? item.count + "x " : ""}${item.name} (${Math.round(item.kcal * item.count)} kcal · ${Math.round(item.prot * item.count)}g prot)`);
      });
    });
  });

  if (trackedDays > 0) {
    const deficitGenerado = Math.round(MAINTENANCE_KCAL_DAY * trackedDays - totalKcal);
    lines.push(`\n📈 RESUMEN DE SEMANA:`);
    lines.push(`Días registrados: ${trackedDays}/7`);
    lines.push(`Promedio kcal: ${Math.round(totalKcal / trackedDays)} (meta déficit 1,566 · mantenimiento 1,816)`);
    lines.push(`Promedio proteína: ${Math.round(totalProt / trackedDays)}g (meta 125g)`);
    lines.push(`Déficit estimado generado esta semana: ${deficitGenerado} kcal de 1,750 meta`);
  }

  lines.push(`\n---`);
  lines.push(`CONTEXTO PERSONAL (no cambió, es mi perfil base):`);
  lines.push(`- Mujer, 29 años, ADHD, historial de binge`);
  lines.push(`- 70kg, 1.67m, 33% grasa corporal (~23.8kg grasa, ~46.2kg masa magra)`);
  lines.push(`- Meta médica: bajar 8kg de grasa pura → llegar a ~25.5% grasa y talla 6`);
  lines.push(`- TDEE (mantenimiento): 1,816 kcal/día. BMR: 1,513 kcal`);
  lines.push(`- Estrategia: comer 1,566 kcal/día + 30 min cardio (~250 kcal) = déficit ~500 kcal/día`);
  lines.push(`- Déficit semanal objetivo: 1,750 kcal = 0.5 lbs / 0.23 kg de grasa`);
  lines.push(`- Déficit mensual objetivo: 7,500 kcal = ~1 kg de grasa pura`);
  lines.push(`- Treat diario incluido intencionalmente para evitar ciclo restricción-binge`);
  lines.push(`- Proteína alta (125g) para preservar masa magra y elevar TEF`);
  lines.push(`- Home office, sedentaria. NEAT bajo pero con potencial de mejora`);
  lines.push(`- No tiene báscula. Progreso se mide por ropa y medidas`);

  lines.push(`\nMARCO CIENTÍFICO QUE MANEJO (úsalo para contextualizar tus tips):`);
  lines.push(`TDEE tiene 4 componentes: BMR (~70%), NEAT (~15%), TEF (~10%), EAT (~5%)`);
  lines.push(`- BMR: 1,513 kcal. Sube con más masa muscular. Grasa no quema nada en reposo.`);
  lines.push(`- NEAT: el mayor potencial de mejora. Home office lo mantiene bajo. Trucos: pararse en llamadas, alarma cada 50 min, vaso de agua chico.`);
  lines.push(`- TEF: proteína alta lo eleva (cuesta hasta 30% de sus calorías solo digerirla).`);
  lines.push(`- EAT: 30 min bici = ~250 kcal. Solo 5% del gasto pero es el empujón que completa el déficit sin tocar el treat.`);
  lines.push(`Pesas: protegen masa magra en déficit, elevan BMR a largo plazo, evitan que el NEAT se apague. Sin pesas, bajar 2kg reduce mantenimiento a ~1,790 kcal y hay riesgo de que el NEAT baje más.`);
  lines.push(`Con pesas + déficit moderado: mantenimiento se mantiene en ~1,816 o sube ligeramente porque el músculo nuevo compensa la grasa perdida.`);
  lines.push(`NEAT adaptativo con ADHD: al comer de más, el cerebro ADHD activa fidgeting inconsciente (mover pies, cambiar postura) que puede quemar 200-400 kcal extra sin notarlo. En déficit, este mecanismo se apaga, por eso el NEAT activo (trucos) es clave.`);
  lines.push(`Cuerpo no es calculadora lineal: el mantenimiento se autoajusta. No hay efecto lineal infinito. El peso se estabiliza en un nuevo equilibrio.`);
  lines.push(`Meta de recomposición: bajar grasa manteniendo/ganando músculo. Báscula puede no moverse mucho pero medidas y ropa sí cambian.`);
  lines.push(`Preworkout para pesas: carb de digestión rápida + proteína ligera 45-60 min antes (ej. 2 tortillas + jamón de pavo = ~200 kcal, 15g prot).`);

  lines.push(`\nANÁLISIS QUE NECESITO:`);
  lines.push(`Eres mi nutrióloga y coach de salud personal. Analiza detalladamente lo que comí esta semana y dame:`);
  lines.push(`1. Un análisis honesto de mis patrones (sin sugarcoating)`);
  lines.push(`2. Qué alimentos estoy repitiendo demasiado y por qué puede ser un problema`);
  lines.push(`3. Qué tiempos de comida son más débiles en proteína`);
  lines.push(`4. 2-3 cambios concretos y específicos para la próxima semana`);
  lines.push(`5. Un tip específico conectando lo que comí esta semana con el marco científico (NEAT, TEF, BMR, pesas, ADHD). Que sea algo que me ayude a entender mejor cómo mis elecciones de esta semana afectaron mi metabolismo.`);
  lines.push(`\nSé específica con los alimentos que ves, no genérica.`);

  return lines.join("\n");
}

export default function Weekly({ onDayPress }) {
  const [copied, setCopied] = useState(false);
  const days = getLastNDays(7);

  const trackedDays = days.filter(d => d.kcal > 0);
  const totalKcalWeek = Math.round(trackedDays.reduce((a, d) => a + d.kcal, 0));
  const totalProtWeek = Math.round(trackedDays.reduce((a, d) => a + d.prot, 0));
  const deficitGenerado = Math.round(MAINTENANCE_KCAL_DAY * trackedDays.length - totalKcalWeek);

  const avg = {
    kcal: trackedDays.length > 0 ? Math.round(totalKcalWeek / trackedDays.length) : 0,
    prot: trackedDays.length > 0 ? Math.round(totalProtWeek / trackedDays.length) : 0,
  };

  return (
    <div style={{ padding: "20px 16px" }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Esta semana</h2>
      <p style={{ fontSize: 13, color: "#999", marginBottom: 20 }}>Últimos 7 días</p>

      {/* Avg pills */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <div style={{ flex: 1, background: "#fff", borderRadius: 12, padding: "14px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 11, color: "#999", marginBottom: 4 }}>Promedio kcal</div>
          <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "monospace", color: avg.kcal >= 1400 && avg.kcal <= MAINTENANCE_KCAL_DAY ? "#4A9F2A" : "#888" }}>{avg.kcal}</div>
          <div style={{ fontSize: 11, color: "#bbb" }}>déficit 1,566 · mant. 1,816</div>
        </div>
        <div style={{ flex: 1, background: "#fff", borderRadius: 12, padding: "14px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 11, color: "#999", marginBottom: 4 }}>Promedio proteína</div>
          <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "monospace", color: avg.prot >= 110 ? "#4A9F2A" : "#888" }}>{avg.prot}g</div>
          <div style={{ fontSize: 11, color: "#bbb" }}>meta 125g</div>
        </div>
      </div>

      {/* Déficit semanal acumulado */}
      <div style={{ background: "#fff", borderRadius: 14, padding: 16, marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Déficit acumulado esta semana</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
          <span style={{ fontSize: 22, fontWeight: 700, fontFamily: "monospace", color: deficitGenerado >= DEFICIT_KCAL_WEEK ? "#4A9F2A" : "#6B9FD4" }}>
            {deficitGenerado > 0 ? deficitGenerado.toLocaleString() : 0} kcal
          </span>
          <span style={{ fontSize: 11, color: "#bbb" }}>meta: 1,750 kcal</span>
        </div>
        <div style={{ background: "#EBEBEB", borderRadius: 6, height: 7, overflow: "hidden", marginBottom: 8 }}>
          <div style={{ height: "100%", background: deficitGenerado >= DEFICIT_KCAL_WEEK ? "#4A9F2A" : "#6B9FD4", borderRadius: 6, width: `${Math.min((deficitGenerado / DEFICIT_KCAL_WEEK) * 100, 100)}%`, transition: "width 0.3s" }} />
        </div>
        <div style={{ fontSize: 11, color: "#bbb", lineHeight: 1.5 }}>
          1,750 kcal = 0.23 kg grasa · 3,500 kcal = 0.45 kg grasa
        </div>
      </div>

      {/* Kcal chart con zona ok */}
      <div style={{ background: "#fff", borderRadius: 14, padding: "16px 8px 8px", marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: 13, fontWeight: 600, paddingLeft: 8, marginBottom: 4 }}>Calorías por día</div>
        <div style={{ fontSize: 11, color: "#bbb", paddingLeft: 8, marginBottom: 12 }}>Zona verde = entre 1,566 y 1,816</div>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={days} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis hide domain={[0, 2800]} />
            <Tooltip formatter={(v) => [`${Math.round(v)} kcal`]} labelStyle={{ fontSize: 12 }} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <ReferenceArea y1={DEFICIT_KCAL_DAY} y2={MAINTENANCE_KCAL_DAY} fill="#E8F4E8" fillOpacity={0.6} />
            <ReferenceLine y={DEFICIT_KCAL_DAY} stroke="#A8C8A8" strokeDasharray="3 3" />
            <ReferenceLine y={MAINTENANCE_KCAL_DAY} stroke="#A8C8A8" strokeDasharray="3 3" />
            <Line type="monotone" dataKey="kcal" stroke="#2A80C0" strokeWidth={2} dot={(props) => {
              const { cx, cy, payload } = props;
              const inZone = payload.kcal >= DEFICIT_KCAL_DAY && payload.kcal <= MAINTENANCE_KCAL_DAY;
              const color = payload.kcal === 0 ? "#ddd" : inZone ? "#4A9F2A" : "#888";
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
            <ReferenceArea y1={110} y2={125} fill="#E8F4E8" fillOpacity={0.6} />
            <ReferenceLine y={125} stroke="#A8C8A8" strokeDasharray="3 3" />
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
          const inZone = day.kcal >= DEFICIT_KCAL_DAY && day.kcal <= MAINTENANCE_KCAL_DAY;
          const metaProt = day.prot >= 110;
          const empty = day.kcal === 0;
          return (
            <div key={day.date} onClick={() => onDayPress && onDayPress(day.date)} style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: i < days.length - 1 ? "1px solid #F5F5F5" : "none", cursor: "pointer" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: empty ? "#E0E0E0" : (inZone && metaProt) ? "#4A9F2A" : "#CCCCCC", marginRight: 12, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{day.label}</div>
                {!empty && <div style={{ fontSize: 11, color: "#999", marginTop: 1 }}>{Math.round(day.kcal)} kcal · {Math.round(day.prot)}g prot</div>}
                {empty && <div style={{ fontSize: 11, color: "#bbb", marginTop: 1 }}>Sin registro</div>}
              </div>
              {!empty && (
                <div style={{ display: "flex", gap: 4 }}>
                  <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 6, background: inZone ? "#E8F4E8" : "#F0F0F0", color: inZone ? "#2A7A2A" : "#999" }}>kcal</span>
                  <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 6, background: metaProt ? "#E8F4E8" : "#F0F0F0", color: metaProt ? "#2A7A2A" : "#999" }}>prot</span>
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
