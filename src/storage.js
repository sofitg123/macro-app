export const DAILY_GOALS = { kcal: 2000, prot: 120, carb: 100, fat: 60 };

export function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function loadDay(key) {
  try { return JSON.parse(localStorage.getItem("day_" + key)); } catch { return null; }
}

export function saveDay(key, data) {
  try { localStorage.setItem("day_" + key, JSON.stringify(data)); } catch {}
}

export function getAllDays() {
  const days = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("day_")) {
      try {
        const date = key.replace("day_", "");
        const data = JSON.parse(localStorage.getItem(key));
        const totals = calcTotals(data);
        days.push({ date, ...totals });
      } catch {}
    }
  }
  return days.sort((a, b) => a.date.localeCompare(b.date));
}

export function calcTotals(data) {
  if (!data) return { kcal: 0, prot: 0, carb: 0, fat: 0 };
  const all = [
    ...Object.values(data.desayuno || {}),
    ...Object.values(data.comida || {}),
    ...Object.values(data.cena || {}),
  ];
  return all.reduce((acc, item) => ({
    kcal: acc.kcal + (item.kcal || 0) * (item.count || 1),
    prot: acc.prot + (item.prot || 0) * (item.count || 1),
    carb: acc.carb + (item.carb || 0) * (item.count || 1),
    fat: acc.fat + (item.fat || 0) * (item.count || 1),
    sugar: acc.sugar + (item.sugar || 0) * (item.count || 1),
  }), { kcal: 0, prot: 0, carb: 0, fat: 0, sugar: 0 });
}

export function getLastNDays(n) {
  const result = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const data = loadDay(key);
    const totals = calcTotals(data);
    result.push({ date: key, label: d.toLocaleDateString("es-MX", { weekday: "short", day: "numeric" }), ...totals });
  }
  return result;
}
