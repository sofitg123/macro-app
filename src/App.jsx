import { useState, useEffect } from "react";
import Tracker from "./screens/Tracker";
import Weekly from "./screens/Weekly";
import Monthly from "./screens/Monthly";
import { loadDay, saveDay, getTodayKey } from "./storage";

const NAV = [
  { id: "tracker", label: "Hoy", emoji: "🍽️" },
  { id: "weekly", label: "Semana", emoji: "📊" },
  { id: "monthly", label: "Mes", emoji: "📅" },
];

export default function App() {
  const [screen, setScreen] = useState("tracker");
  const [todayData, setTodayData] = useState(() => loadDay(getTodayKey()) || { desayuno: {}, comida: {}, cena: {} });

  useEffect(() => {
    saveDay(getTodayKey(), todayData);
  }, [todayData]);

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: "#F7F5F0", minHeight: "100vh", width: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 70 }}>
        {screen === "tracker" && <Tracker data={todayData} setData={setTodayData} />}
        {screen === "weekly" && <Weekly />}
        {screen === "monthly" && <Monthly />}
      </div>
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%",  background: "#fff", borderTop: "1px solid #EBEBEB", display: "flex", zIndex: 100, paddingBottom: "env(safe-area-inset-bottom)" }}>
        {NAV.map(n => (
          <div key={n.id} onClick={() => setScreen(n.id)} style={{ flex: 1, padding: "10px 4px 8px", textAlign: "center", cursor: "pointer" }}>
            <div style={{ fontSize: 22 }}>{n.emoji}</div>
            <div style={{ fontSize: 11, fontWeight: screen === n.id ? 700 : 400, color: screen === n.id ? "#1A1A1A" : "#bbb", marginTop: 2 }}>{n.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
