import { useState } from "react";
import { FOODS } from "../foods";
import { DAILY_GOALS, calcTotals } from "../storage";
const SUGAR_GOAL = 25;


const FLAG_COLOR = { green: "#4A9F2A", yellow: "#C08020", red: "#C03030" };

const MEALS = [
  { id: "desayuno", label: "Desayuno", emoji: "🌅" },
  { id: "comida", label: "Comida", emoji: "☀️" },
  { id: "cena", label: "Cena", emoji: "🌙" },
];

function MacroBar({ label, value, goal, color }) {
  const pct = Math.min((value / goal) * 100, 100);
  const over = value > goal;
  return (
    <div style={{ marginBottom: 7 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
        <span style={{ color: "#999" }}>{label}</span>
        <span style={{ fontFamily: "monospace", fontWeight: 600, color: over ? "#C03030" : color }}>
          {Math.round(value)}{label === "kcal" ? " kcal" : "g"} / {goal}{label === "kcal" ? " kcal" : "g"}
        </span>
      </div>
      <div style={{ background: "#EBEBEB", borderRadius: 4, height: 5, overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 4, background: over ? "#C03030" : color, width: `${pct}%`, transition: "width 0.3s" }} />
      </div>
    </div>
  );
}

export default function Tracker({ data, setData, date, isToday, onBackToToday }) {
  const [activeMeal, setActiveMeal] = useState("desayuno");
  const [openGroup, setOpenGroup] = useState("proteina");

  const mealTotals = {
    desayuno: calcTotals({ desayuno: data.desayuno, comida: {}, cena: {} }),
    comida: calcTotals({ desayuno: {}, comida: data.comida, cena: {} }),
    cena: calcTotals({ desayuno: {}, comida: {}, cena: data.cena }),
  };
  const dayTotals = calcTotals(data);
  const remaining = {
    kcal: DAILY_GOALS.kcal - dayTotals.kcal,
    prot: DAILY_GOALS.prot - dayTotals.prot,
    carb: DAILY_GOALS.carb - dayTotals.carb,
    fat: DAILY_GOALS.fat - dayTotals.fat,
    sugar: SUGAR_GOAL - (dayTotals.sugar || 0),
  };

  const toggleFood = (foodId, food) => {
    setData(prev => {
      const meal = { ...prev[activeMeal] };
      if (!meal[foodId]) meal[foodId] = { ...food, count: 1 };
      else if (meal[foodId].count < 10) meal[foodId] = { ...meal[foodId], count: meal[foodId].count + 1 };
      else delete meal[foodId];
      return { ...prev, [activeMeal]: meal };
    });
  };

  const removeOne = (e, foodId) => {
    e.stopPropagation();
    setData(prev => {
      const meal = { ...prev[activeMeal] };
      if (!meal[foodId]) return prev;
      if (meal[foodId].count <= 1) delete meal[foodId];
      else meal[foodId] = { ...meal[foodId], count: meal[foodId].count - 1 };
      return { ...prev, [activeMeal]: meal };
    });
  };

  const currentMeal = data[activeMeal] || {};
  const hasAny = Object.keys(currentMeal).length > 0;

  return (
    <div>
      {/* Header */}
      <div style={{ background: "#fff", padding: "16px 16px 14px", position: "sticky", top: 0, zIndex: 20, borderBottom: "1px solid #EBEBEB", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#1A1A1A" }}>Total del día</span>
          <span style={{ fontSize: 11, color: "#bbb" }}>Meta: 2,000 kcal · 120g prot</span>
        </div>
        <MacroBar label="kcal" value={dayTotals.kcal} goal={DAILY_GOALS.kcal} color="#4A9F2A" />
        <MacroBar label="proteína" value={dayTotals.prot} goal={DAILY_GOALS.prot} color="#2A80C0" />
        <MacroBar label="carbs" value={dayTotals.carb} goal={DAILY_GOALS.carb} color="#C08020" />
        <MacroBar label="grasa" value={dayTotals.fat} goal={DAILY_GOALS.fat} color="#C04040" />
        <MacroBar label="azúcar" value={dayTotals.sugar || 0} goal={SUGAR_GOAL} color="#9B59B6" />
        <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
          {[
            { key: "kcal", label: "restantes", color: "#4A9F2A", unit: "kcal" },
            { key: "prot", label: "prot", color: "#2A80C0", unit: "g" },
            { key: "carb", label: "carbs", color: "#C08020", unit: "g" },
            { key: "fat", label: "grasa", color: "#C04040", unit: "g" },
            { key: "sugar", label: "azúcar", color: "#9B59B6", unit: "g" },
          ].map(({ key, label, color, unit }) => {
            const rem = Math.round(remaining[key]);
            const over = rem < 0;
            return (
              <div key={key} style={{ flex: 1, background: "#F7F5F0", borderRadius: 8, padding: "6px 4px", textAlign: "center" }}>
                <div style={{ fontSize: 12, fontFamily: "monospace", fontWeight: 700, color: over ? "#C03030" : color }}>
                  {over ? `+${Math.abs(rem)}` : rem}{unit}
                </div>
                <div style={{ fontSize: 9, color: "#bbb", marginTop: 1 }}>{over ? "de más" : label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Meal tabs */}
      <div style={{ display: "flex", background: "#fff", borderBottom: "1px solid #EBEBEB", position: "sticky", top: 165, zIndex: 15 }}>
        {MEALS.map(meal => {
          const t = mealTotals[meal.id];
          const isActive = activeMeal === meal.id;
          return (
            <div key={meal.id} onClick={() => setActiveMeal(meal.id)} style={{ flex: 1, padding: "10px 4px 8px", textAlign: "center", cursor: "pointer", borderBottom: isActive ? "2px solid #1A1A1A" : "2px solid transparent" }}>
              <div style={{ fontSize: 18 }}>{meal.emoji}</div>
              <div style={{ fontSize: 12, fontWeight: isActive ? 700 : 400, color: isActive ? "#1A1A1A" : "#bbb", marginTop: 2 }}>{meal.label}</div>
              {t.kcal > 0 && <div style={{ fontSize: 10, fontFamily: "monospace", color: "#888", marginTop: 1 }}>{Math.round(t.kcal)} kcal</div>}
            </div>
          );
        })}
      </div>

      <div style={{ padding: "12px 16px 0" }}>
        {/* Selected summary */}
        {hasAny && (
          <div style={{ background: "#fff", borderRadius: 14, padding: 14, marginBottom: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: 1 }}>{MEALS.find(m => m.id === activeMeal)?.emoji} {MEALS.find(m => m.id === activeMeal)?.label}</span>
              <span style={{ fontSize: 12, fontFamily: "monospace", fontWeight: 600 }}>{Math.round(mealTotals[activeMeal].kcal)} kcal · {Math.round(mealTotals[activeMeal].prot)}g prot</span>
            </div>
            {Object.values(currentMeal).map(item => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 8, marginBottom: 8, borderBottom: "1px solid #F5F5F5" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13 }}>{item.count > 1 ? `${item.count}× ` : ""}{item.name}</div>
                  <div style={{ fontSize: 11, color: "#999", marginTop: 1 }}>{Math.round(item.kcal * item.count)} kcal · {Math.round(item.prot * item.count)}g prot</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button onClick={(e) => removeOne(e, item.id)} style={{ width: 26, height: 26, borderRadius: "50%", background: "#F0F0F0", border: "none", fontSize: 18, cursor: "pointer", color: "#666", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#1A1A1A", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>{item.count}</div>
                </div>
              </div>
            ))}
            <button onClick={() => setData(prev => ({ ...prev, [activeMeal]: {} }))} style={{ fontSize: 12, color: "#bbb", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>Borrar todo</button>
          </div>
        )}

        {/* Food groups */}
        {Object.entries(FOODS).map(([groupId, group]) => {
          const isOpen = openGroup === groupId;
          const groupCount = group.items.filter(i => currentMeal[i.id]).length;
          return (
            <div key={groupId} style={{ background: "#fff", borderRadius: 14, marginBottom: 10, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <div onClick={() => setOpenGroup(isOpen ? null : groupId)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 14px", cursor: "pointer" }}>
                <span style={{ fontSize: 20 }}>{group.emoji}</span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{group.label}</span>
                  {groupCount > 0 && <span style={{ marginLeft: 8, fontSize: 12, background: group.color, color: group.textColor, padding: "1px 7px", borderRadius: 10, fontWeight: 500 }}>{groupCount} sel.</span>}
                </div>
                <span style={{ fontSize: 12, color: "#CCC", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</span>
              </div>
              {isOpen && (
                <div style={{ borderTop: "1px solid #F5F5F5" }}>
                  {group.items.map((food) => {
                    const sel = currentMeal[food.id];
                    const count = sel?.count || 0;
                    return (
                      <div key={food.id} onClick={() => toggleFood(food.id, food)} style={{ display: "flex", alignItems: "center", padding: "10px 14px", cursor: "pointer", background: count > 0 ? group.color : "transparent", borderBottom: "1px solid #F8F8F8" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: FLAG_COLOR[food.flag] || "#999", display: "inline-block", flexShrink: 0 }} />
                          <span style={{ fontSize: 14, fontWeight: count > 0 ? 600 : 400, color: count > 0 ? group.textColor : "#1A1A1A" }}>{food.name}</span>
                          {food.gluten && <span style={{ fontSize: 11 }}>🌾</span>}
                        </div>
                          <div style={{ fontSize: 12, color: "#999", marginTop: 1 }}>{food.portion}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 13, fontFamily: "monospace", fontWeight: 600, color: "#444" }}>{food.kcal} kcal</div>
                            <div style={{ fontSize: 11, color: "#999" }}>{food.prot}g prot</div>
                          </div>
                          {count > 0 && (
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <button onClick={(e) => { e.stopPropagation(); removeOne(e, food.id); }} style={{ width: 22, height: 22, borderRadius: "50%", background: "#fff", border: "1px solid #ddd", fontSize: 15, cursor: "pointer", color: "#666", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                              <div style={{ width: 26, height: 26, borderRadius: "50%", background: group.textColor, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>{count}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
