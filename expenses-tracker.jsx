import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Home,
  Receipt,
  History,
  Settings,
  Plus,
  X,
  Search,
  ChevronRight,
  ChevronLeft,
  Utensils,
  Car,
  Building2,
  Clapperboard,
  HeartPulse,
  ShoppingBag,
  FileText,
  GraduationCap,
  MoreHorizontal,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  AlertTriangle,
  Trash2,
  Download,
  Upload,
  Sun,
  Moon,
  MonitorSmartphone,
  Check,
  CalendarClock,
  PiggyBank,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ---------------------------------------------------------------------------
// Tokens
// ---------------------------------------------------------------------------

const PALETTES = {
  light: {
    bg: "#F3F6FB",
    bgHeader: "#0C2A4D",
    card: "#FFFFFF",
    cardSoft: "#EEF2F8",
    textPrimary: "#0F2036",
    textSecondary: "#66748C",
    textOnDark: "#F2F6FC",
    textOnDarkSoft: "#B7C6DE",
    primary: "#2C6FB0",
    primarySoft: "#DCEAFA",
    green: "#1E9E5A",
    greenSoft: "#E1F5EA",
    red: "#DD4B4B",
    redSoft: "#FBE6E6",
    yellow: "#D89A2A",
    yellowSoft: "#FBF1DD",
    border: "#E3E9F2",
    shadow: "0 1px 2px rgba(15,32,54,0.04), 0 6px 20px rgba(15,32,54,0.06)",
  },
  dark: {
    bg: "#0B1526",
    bgHeader: "#081324",
    card: "#131F35",
    cardSoft: "#1B2A45",
    textPrimary: "#EAF1FC",
    textSecondary: "#8C9CBB",
    textOnDark: "#F2F6FC",
    textOnDarkSoft: "#9FB1CE",
    primary: "#5B9BDB",
    primarySoft: "#1E3352",
    green: "#3FBE7C",
    greenSoft: "#153826",
    red: "#F0716B",
    redSoft: "#3A1E20",
    yellow: "#E3B159",
    yellowSoft: "#3A2F17",
    border: "#223252",
    shadow: "0 1px 2px rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.35)",
  },
};

const CATEGORIES = [
  { id: "alimentacion", label: "Alimentación", icon: Utensils, color: "#DD8A3D" },
  { id: "transporte", label: "Transporte", icon: Car, color: "#3E8FDD" },
  { id: "hogar", label: "Hogar", icon: Building2, color: "#5CA45A" },
  { id: "entretenimiento", label: "Entretenimiento", icon: Clapperboard, color: "#B25CC7" },
  { id: "salud", label: "Salud", icon: HeartPulse, color: "#D45B6B" },
  { id: "compras", label: "Compras", icon: ShoppingBag, color: "#D6A73C" },
  { id: "servicios", label: "Servicios", icon: FileText, color: "#4AA6A0" },
  { id: "educacion", label: "Educación", icon: GraduationCap, color: "#6C7FDB" },
  { id: "otros", label: "Otros", icon: MoreHorizontal, color: "#8C97AB" },
];

const PAYMENT_METHODS = ["Efectivo", "Tarjeta", "Transferencia", "Otro"];

const catById = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];

function money(n) {
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(Math.round(n));
  return `${sign}C$ ${abs.toLocaleString("es-NI")}`;
}

function fmtRange(start, end) {
  const opts = { day: "numeric", month: "long" };
  const s = start.toLocaleDateString("es-NI", { day: "numeric" });
  const e = end.toLocaleDateString("es-NI", opts);
  return `${s} – ${e}`;
}

function currentQuincenaBounds(d = new Date()) {
  const year = d.getFullYear();
  const month = d.getMonth();
  if (d.getDate() <= 15) {
    return { start: new Date(year, month, 1), end: new Date(year, month, 15) };
  }
  const lastDay = new Date(year, month + 1, 0).getDate();
  return { start: new Date(year, month, 16), end: new Date(year, month, lastDay) };
}

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

function seedExpenses() {
  const today = new Date();
  const mk = (daysAgo, cat, desc, amount, method) => ({
    id: `${daysAgo}-${cat}-${amount}`,
    date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - daysAgo),
    category: cat,
    description: desc,
    amount,
    method,
  });
  return [
    mk(0, "alimentacion", "Almuerzo", 250, "Efectivo"),
    mk(1, "transporte", "Taxi al trabajo", 180, "Transferencia"),
    mk(2, "compras", "Supermercado", 620, "Tarjeta"),
    mk(4, "servicios", "Recarga de saldo", 100, "Efectivo"),
    mk(6, "entretenimiento", "Cine", 100, "Tarjeta"),
  ];
}

function seedHistory() {
  return [
    { id: "h1", label: "16 – 31 agosto 2026", income: 10000, previousBalance: 0, expenses: 7800 },
    { id: "h2", label: "1 – 15 agosto 2026", income: 10000, previousBalance: 300, expenses: 6100 },
    { id: "h3", label: "16 – 31 julio 2026", income: 9500, previousBalance: 0, expenses: 10200 },
  ];
}

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

function Card({ t, children, style, className = "", onClick }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl ${className}`}
      style={{ background: t.card, boxShadow: t.shadow, ...style }}
    >
      {children}
    </div>
  );
}

function IconBadge({ Icon, color, size = 38 }) {
  return (
    <div
      className="flex items-center justify-center rounded-full shrink-0"
      style={{ width: size, height: size, background: `${color}22` }}
    >
      <Icon size={size * 0.5} color={color} strokeWidth={2.2} />
    </div>
  );
}

function CategoryPicker({ t, value, onChange }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {CATEGORIES.map((c) => {
        const Icon = c.icon;
        const active = value === c.id;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onChange(c.id)}
            className="flex flex-col items-center gap-1.5 rounded-xl py-2.5 px-1 transition"
            style={{
              background: active ? `${c.color}1F` : t.cardSoft,
              border: `1.5px solid ${active ? c.color : "transparent"}`,
            }}
          >
            <Icon size={18} color={active ? c.color : t.textSecondary} strokeWidth={2.2} />
            <span
              className="text-[11px] leading-tight text-center"
              style={{ color: active ? t.textPrimary : t.textSecondary, fontWeight: active ? 600 : 500 }}
            >
              {c.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ExpenseRow({ t, expense, isDark }) {
  const cat = catById(expense.category);
  const Icon = cat.icon;
  const isToday = new Date().toDateString() === expense.date.toDateString();
  const dateLabel = isToday
    ? "Hoy"
    : expense.date.toLocaleDateString("es-NI", { day: "numeric", month: "short" });
  return (
    <div className="flex items-center gap-3 py-2.5">
      <IconBadge Icon={Icon} color={cat.color} />
      <div className="flex-1 min-w-0">
        <div className="text-[14.5px] font-semibold truncate" style={{ color: t.textPrimary }}>
          {expense.description}
        </div>
        <div className="text-[12.5px]" style={{ color: t.textSecondary }}>
          {dateLabel} · {cat.label}
        </div>
      </div>
      <div className="text-[14.5px] font-bold shrink-0" style={{ color: t.red }}>
        -{money(expense.amount).replace("C$ ", "C$ ")}
      </div>
    </div>
  );
}

function ProgressBar({ t, pct }) {
  const color = pct >= 90 ? t.red : pct >= 65 ? t.yellow : t.green;
  return (
    <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: t.cardSoft }}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(pct, 100)}%`, background: color }}
      />
    </div>
  );
}

function Modal({ t, title, onClose, children, wide }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: "rgba(8,14,26,0.55)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${wide ? "sm:max-w-md" : "sm:max-w-sm"} rounded-t-3xl sm:rounded-3xl max-h-[88vh] overflow-y-auto`}
        style={{ background: t.card }}
      >
        <div
          className="sticky top-0 flex items-center justify-between px-5 py-4 rounded-t-3xl"
          style={{ background: t.card, borderBottom: `1px solid ${t.border}` }}
        >
          <h3 className="text-[16px] font-bold" style={{ color: t.textPrimary }}>
            {title}
          </h3>
          <button onClick={onClose} className="p-1 rounded-full" style={{ background: t.cardSoft }}>
            <X size={16} color={t.textSecondary} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

function Toast({ t, message, show }) {
  return (
    <div
      className="fixed left-1/2 z-[60] px-4 py-2.5 rounded-full text-[13.5px] font-semibold transition-all duration-300"
      style={{
        bottom: show ? 92 : 60,
        opacity: show ? 1 : 0,
        transform: "translateX(-50%)",
        background: "#12213B",
        color: "#F2F6FC",
        boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
        pointerEvents: "none",
      }}
    >
      {message}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Screens
// ---------------------------------------------------------------------------

function Dashboard({
  t,
  isDark,
  period,
  expensesInPeriod,
  totalExpenses,
  totalAvailable,
  balance,
  alertThreshold,
  alertDismissed,
  onDismissAlert,
  onOpenNewExpense,
  onGoToExpenses,
  onEndQuincena,
}) {
  const pct = totalAvailable > 0 ? (totalExpenses / period.income) * 100 : 0;
  const showAlert = balance <= alertThreshold && !alertDismissed;
  const recent = expensesInPeriod.slice(0, 4);

  return (
    <div className="px-4 pt-5 pb-28 space-y-4">
      <div>
        <div className="text-[20px] font-extrabold tracking-tight" style={{ color: t.textPrimary, fontFamily: "Sora, sans-serif" }}>
          Expenses Tracker
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <CalendarClock size={13} color={t.textSecondary} />
          <span className="text-[13px]" style={{ color: t.textSecondary }}>
            Quincena actual · {fmtRange(period.start, period.end)}
          </span>
        </div>
      </div>

      {/* Saldo principal */}
      <Card t={t} style={{ background: t.bgHeader }} className="p-5 relative overflow-hidden">
        <div
          className="absolute -right-8 -top-10 w-40 h-40 rounded-full"
          style={{ background: "rgba(255,255,255,0.04)" }}
        />
        <div className="relative">
          <div className="text-[13px] font-medium" style={{ color: t.textOnDarkSoft }}>
            Saldo disponible
          </div>
          <div className="text-[36px] font-extrabold mt-1 leading-none" style={{ color: t.textOnDark, fontFamily: "Sora, sans-serif" }}>
            {money(balance)}
          </div>
          <div className="text-[12.5px] mt-2" style={{ color: t.textOnDarkSoft }}>
            Disponible para el resto de la quincena
          </div>
        </div>
      </Card>

      {/* Resumen financiero */}
      <div className="grid grid-cols-3 gap-2.5">
        <Card t={t} className="p-3">
          <ArrowUpCircle size={17} color={t.green} strokeWidth={2.2} />
          <div className="text-[11.5px] mt-1.5" style={{ color: t.textSecondary }}>
            Ingreso
          </div>
          <div className="text-[14px] font-bold mt-0.5" style={{ color: t.textPrimary }}>
            {money(period.income)}
          </div>
        </Card>
        <Card t={t} className="p-3">
          <ArrowDownCircle size={17} color={t.red} strokeWidth={2.2} />
          <div className="text-[11.5px] mt-1.5" style={{ color: t.textSecondary }}>
            Gastos
          </div>
          <div className="text-[14px] font-bold mt-0.5" style={{ color: t.textPrimary }}>
            {money(totalExpenses)}
          </div>
        </Card>
        <Card t={t} className="p-3">
          <PiggyBank size={17} color={t.primary} strokeWidth={2.2} />
          <div className="text-[11.5px] mt-1.5" style={{ color: t.textSecondary }}>
            Saldo anterior
          </div>
          <div className="text-[14px] font-bold mt-0.5" style={{ color: t.textPrimary }}>
            {money(period.previousBalance)}
          </div>
        </Card>
      </div>

      {/* Progreso */}
      <Card t={t} className="p-4">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[13.5px] font-semibold" style={{ color: t.textPrimary }}>
            Progreso de gastos
          </span>
          <span className="text-[12.5px] font-semibold" style={{ color: t.textSecondary }}>
            {pct.toFixed(1)}% utilizado
          </span>
        </div>
        <ProgressBar t={t} pct={pct} />
        <div className="text-[12px] mt-2" style={{ color: t.textSecondary }}>
          {money(totalExpenses)} de {money(period.income)}
        </div>
      </Card>

      {showAlert && (
        <Card t={t} style={{ background: t.redSoft, border: `1px solid ${t.red}44` }} className="p-4">
          <div className="flex items-start gap-2.5">
            <AlertTriangle size={18} color={t.red} className="mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="text-[14px] font-bold" style={{ color: t.red }}>
                Saldo bajo
              </div>
              <div className="text-[13px] mt-0.5" style={{ color: t.textPrimary }}>
                Te quedan {money(balance)} disponibles.
              </div>
              <div className="text-[12.5px] mt-1" style={{ color: t.textSecondary }}>
                Considera revisar tus gastos antes de finalizar la quincena.
              </div>
            </div>
            <button onClick={onDismissAlert} className="shrink-0">
              <X size={16} color={t.textSecondary} />
            </button>
          </div>
        </Card>
      )}

      {/* Gastos recientes */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[14.5px] font-bold" style={{ color: t.textPrimary }}>
            Gastos recientes
          </span>
          <button
            onClick={onGoToExpenses}
            className="text-[12.5px] font-semibold flex items-center gap-0.5"
            style={{ color: t.primary }}
          >
            Ver todos <ChevronRight size={14} />
          </button>
        </div>
        <Card t={t} className="px-3.5">
          {recent.length === 0 ? (
            <EmptyExpenses t={t} onAdd={onOpenNewExpense} compact />
          ) : (
            recent.map((e, i) => (
              <div key={e.id} style={{ borderTop: i === 0 ? "none" : `1px solid ${t.border}` }}>
                <ExpenseRow t={t} expense={e} isDark={isDark} />
              </div>
            ))
          )}
        </Card>
      </div>

      <button
        onClick={onEndQuincena}
        className="w-full text-center text-[13px] font-semibold py-3 rounded-xl"
        style={{ color: t.primary, background: t.primarySoft }}
      >
        Finalizar quincena
      </button>
    </div>
  );
}

function EmptyExpenses({ t, onAdd, compact }) {
  return (
    <div className={`flex flex-col items-center text-center ${compact ? "py-8" : "py-16"}`}>
      <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ background: t.cardSoft }}>
        <Wallet size={22} color={t.textSecondary} />
      </div>
      <div className="text-[14.5px] font-bold" style={{ color: t.textPrimary }}>
        No tienes gastos registrados
      </div>
      <div className="text-[13px] mt-1 max-w-[240px]" style={{ color: t.textSecondary }}>
        Registra tu primer gasto para comenzar a controlar tu dinero.
      </div>
      <button
        onClick={onAdd}
        className="mt-4 px-4 py-2 rounded-full text-[13px] font-semibold flex items-center gap-1.5"
        style={{ background: t.primary, color: "#fff" }}
      >
        <Plus size={15} /> Registrar gasto
      </button>
    </div>
  );
}

function GastosScreen({ t, isDark, expensesInPeriod, totalExpenses }) {
  const [filter, setFilter] = useState("todas");
  const [query, setQuery] = useState("");

  const filtered = expensesInPeriod.filter((e) => {
    const matchesCat = filter === "todas" || e.category === filter;
    const matchesQuery = e.description.toLowerCase().includes(query.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const filterChips = [{ id: "todas", label: "Todas" }, ...CATEGORIES.map((c) => ({ id: c.id, label: c.label }))];

  return (
    <div className="px-4 pt-5 pb-28 space-y-4">
      <div>
        <div className="text-[20px] font-extrabold" style={{ color: t.textPrimary, fontFamily: "Sora, sans-serif" }}>
          Gastos de la quincena
        </div>
        <div className="text-[13px] mt-1" style={{ color: t.textSecondary }}>
          Total gastado
        </div>
        <div className="text-[26px] font-extrabold mt-0.5" style={{ color: t.red, fontFamily: "Sora, sans-serif" }}>
          {money(totalExpenses)}
        </div>
      </div>

      <div
        className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl"
        style={{ background: t.cardSoft }}
      >
        <Search size={16} color={t.textSecondary} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por descripción"
          className="bg-transparent outline-none text-[13.5px] flex-1"
          style={{ color: t.textPrimary }}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {filterChips.map((c) => {
          const active = filter === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setFilter(c.id)}
              className="shrink-0 px-3.5 py-1.5 rounded-full text-[12.5px] font-semibold"
              style={{
                background: active ? t.primary : t.cardSoft,
                color: active ? "#fff" : t.textSecondary,
              }}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      <Card t={t} className="px-3.5">
        {filtered.length === 0 ? (
          <div className="py-10 text-center text-[13.5px]" style={{ color: t.textSecondary }}>
            No se encontraron gastos con estos filtros.
          </div>
        ) : (
          filtered.map((e, i) => (
            <div key={e.id} style={{ borderTop: i === 0 ? "none" : `1px solid ${t.border}` }}>
              <ExpenseRow t={t} expense={e} isDark={isDark} />
            </div>
          ))
        )}
      </Card>
    </div>
  );
}

function QuincenaCard({ t, item }) {
  const balanceFinal = item.income + item.previousBalance - item.expenses;
  const ratio = item.expenses / (item.income + item.previousBalance);
  let statusColor = t.green;
  let statusLabel = "Saldo positivo";
  if (ratio > 1) {
    statusColor = t.red;
    statusLabel = "Presupuesto superado";
  } else if (ratio > 0.9) {
    statusColor = t.yellow;
    statusLabel = "Casi sin saldo";
  }
  return (
    <Card t={t} className="p-4">
      <div className="flex items-center justify-between">
        <div className="text-[14px] font-bold" style={{ color: t.textPrimary }}>
          {item.label}
        </div>
        <span
          className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: `${statusColor}22`, color: statusColor }}
        >
          {statusLabel}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-3">
        <div>
          <div className="text-[11px]" style={{ color: t.textSecondary }}>Ingreso</div>
          <div className="text-[13px] font-bold" style={{ color: t.textPrimary }}>{money(item.income)}</div>
        </div>
        <div>
          <div className="text-[11px]" style={{ color: t.textSecondary }}>Gastos</div>
          <div className="text-[13px] font-bold" style={{ color: t.textPrimary }}>{money(item.expenses)}</div>
        </div>
        <div>
          <div className="text-[11px]" style={{ color: t.textSecondary }}>Saldo final</div>
          <div className="text-[13px] font-bold" style={{ color: statusColor }}>{money(balanceFinal)}</div>
        </div>
      </div>
    </Card>
  );
}

function HistorialScreen({ t, history, currentExpensesByCategory, isDark }) {
  const [selected, setSelected] = useState(null);

  const totals = useMemo(() => {
    const income = history.reduce((s, h) => s + h.income, 0);
    const expenses = history.reduce((s, h) => s + h.expenses, 0);
    const saved = history.reduce((s, h) => s + (h.income + h.previousBalance - h.expenses), 0);
    const avg = history.length ? expenses / history.length : 0;
    return { income, expenses, saved, avg };
  }, [history]);

  const pieData = currentExpensesByCategory.map((c) => ({ name: c.label, value: c.total, color: c.color }));
  const topCategory = pieData.slice().sort((a, b) => b.value - a.value)[0];

  const barData = history
    .slice()
    .reverse()
    .map((h) => ({ name: h.label.split(" ")[0] + " " + h.label.split(" ")[1], gasto: h.expenses }));

  return (
    <div className="px-4 pt-5 pb-28 space-y-4">
      <div className="text-[20px] font-extrabold" style={{ color: t.textPrimary, fontFamily: "Sora, sans-serif" }}>
        Historial
      </div>

      <Card t={t} className="p-4">
        <div className="text-[14.5px] font-bold mb-3" style={{ color: t.textPrimary }}>
          Resumen financiero
        </div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <div className="text-[11px]" style={{ color: t.textSecondary }}>Ingresos totales</div>
            <div className="text-[14px] font-bold" style={{ color: t.textPrimary }}>{money(totals.income)}</div>
          </div>
          <div>
            <div className="text-[11px]" style={{ color: t.textSecondary }}>Gastos totales</div>
            <div className="text-[14px] font-bold" style={{ color: t.textPrimary }}>{money(totals.expenses)}</div>
          </div>
          <div>
            <div className="text-[11px]" style={{ color: t.textSecondary }}>Dinero ahorrado</div>
            <div className="text-[14px] font-bold" style={{ color: t.green }}>{money(totals.saved)}</div>
          </div>
          <div>
            <div className="text-[11px]" style={{ color: t.textSecondary }}>Promedio por quincena</div>
            <div className="text-[14px] font-bold" style={{ color: t.textPrimary }}>{money(totals.avg)}</div>
          </div>
        </div>
        {topCategory && (
          <div className="text-[12.5px]" style={{ color: t.textSecondary }}>
            Mayor gasto en <span style={{ color: t.textPrimary, fontWeight: 700 }}>{topCategory.name}</span>
          </div>
        )}
      </Card>

      {pieData.length > 0 && (
        <Card t={t} className="p-4">
          <div className="text-[13.5px] font-semibold mb-2" style={{ color: t.textPrimary }}>
            Gastos por categoría (quincena actual)
          </div>
          <div style={{ width: "100%", height: 160 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={38} outerRadius={62} paddingAngle={2}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => money(v)}
                  contentStyle={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 10, fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-2 justify-center">
            {pieData.map((p, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                <span className="text-[11px]" style={{ color: t.textSecondary }}>{p.name}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {barData.length > 1 && (
        <Card t={t} className="p-4">
          <div className="text-[13.5px] font-semibold mb-2" style={{ color: t.textPrimary }}>
            Gastos por quincena
          </div>
          <div style={{ width: "100%", height: 140 }}>
            <ResponsiveContainer>
              <BarChart data={barData}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: t.textSecondary }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  formatter={(v) => money(v)}
                  contentStyle={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 10, fontSize: 12 }}
                />
                <Bar dataKey="gasto" fill={t.primary} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      <div className="space-y-2.5">
        {history.map((h) => (
          <div key={h.id} onClick={() => setSelected(h)}>
            <QuincenaCard t={t} item={h} />
          </div>
        ))}
      </div>

      {selected && (
        <Modal t={t} title={selected.label} onClose={() => setSelected(null)}>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl p-2.5" style={{ background: t.cardSoft }}>
                <div className="text-[11px]" style={{ color: t.textSecondary }}>Ingreso</div>
                <div className="text-[13px] font-bold" style={{ color: t.textPrimary }}>{money(selected.income)}</div>
              </div>
              <div className="rounded-xl p-2.5" style={{ background: t.cardSoft }}>
                <div className="text-[11px]" style={{ color: t.textSecondary }}>Gastos</div>
                <div className="text-[13px] font-bold" style={{ color: t.textPrimary }}>{money(selected.expenses)}</div>
              </div>
              <div className="rounded-xl p-2.5" style={{ background: t.cardSoft }}>
                <div className="text-[11px]" style={{ color: t.textSecondary }}>Saldo final</div>
                <div className="text-[13px] font-bold" style={{ color: t.green }}>
                  {money(selected.income + selected.previousBalance - selected.expenses)}
                </div>
              </div>
            </div>
            <div className="text-[12.5px] text-center" style={{ color: t.textSecondary }}>
              El detalle de gastos por transacción de quincenas pasadas no está disponible en esta vista de ejemplo.
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function ToggleRow({ t, label, sub, value, onChange }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <div className="text-[14px] font-semibold" style={{ color: t.textPrimary }}>{label}</div>
        {sub && <div className="text-[12px]" style={{ color: t.textSecondary }}>{sub}</div>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className="w-11 h-6 rounded-full relative transition-colors"
        style={{ background: value ? t.primary : t.cardSoft }}
      >
        <span
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform"
          style={{ transform: value ? "translateX(22px)" : "translateX(2px)" }}
        />
      </button>
    </div>
  );
}

function ConfiguracionScreen({ t, alertThreshold, setAlertThreshold, notifications, setNotifications, appearance, setAppearance, onExport, onImport, onDeleteAll }) {
  const [thresholdInput, setThresholdInput] = useState(String(alertThreshold));
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="px-4 pt-5 pb-28 space-y-4">
      <div className="text-[20px] font-extrabold" style={{ color: t.textPrimary, fontFamily: "Sora, sans-serif" }}>
        Configuración
      </div>

      <Card t={t} className="p-4">
        <div className="text-[12.5px] font-semibold mb-0.5" style={{ color: t.textSecondary }}>Moneda</div>
        <div className="text-[14.5px] font-bold" style={{ color: t.textPrimary }}>Córdobas (C$)</div>
      </Card>

      <Card t={t} className="p-4">
        <div className="text-[12.5px] font-semibold mb-2" style={{ color: t.textSecondary }}>Umbral de alerta</div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 flex-1 px-3 py-2.5 rounded-xl" style={{ background: t.cardSoft }}>
            <span className="text-[14px] font-semibold" style={{ color: t.textSecondary }}>C$</span>
            <input
              value={thresholdInput}
              onChange={(e) => setThresholdInput(e.target.value.replace(/[^0-9]/g, ""))}
              className="bg-transparent outline-none text-[14.5px] font-bold flex-1"
              style={{ color: t.textPrimary }}
            />
          </div>
          <button
            onClick={() => setAlertThreshold(Number(thresholdInput) || 0)}
            className="px-3.5 py-2.5 rounded-xl text-[13px] font-semibold"
            style={{ background: t.primary, color: "#fff" }}
          >
            Guardar
          </button>
        </div>
      </Card>

      <Card t={t} className="px-4">
        <ToggleRow t={t} label="Notificaciones" sub="Avisar cuando el saldo esté bajo" value={notifications} onChange={setNotifications} />
      </Card>

      <Card t={t} className="p-4">
        <div className="text-[12.5px] font-semibold mb-2.5" style={{ color: t.textSecondary }}>Apariencia</div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "claro", label: "Claro", icon: Sun },
            { id: "oscuro", label: "Oscuro", icon: Moon },
            { id: "auto", label: "Automático", icon: MonitorSmartphone },
          ].map((opt) => {
            const Icon = opt.icon;
            const active = appearance === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setAppearance(opt.id)}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl"
                style={{ background: active ? t.primarySoft : t.cardSoft, border: `1.5px solid ${active ? t.primary : "transparent"}` }}
              >
                <Icon size={16} color={active ? t.primary : t.textSecondary} />
                <span className="text-[11.5px] font-semibold" style={{ color: active ? t.primary : t.textSecondary }}>
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      <Card t={t} className="px-4">
        <button onClick={onExport} className="w-full flex items-center gap-3 py-3" style={{ borderBottom: `1px solid ${t.border}` }}>
          <Download size={17} color={t.textSecondary} />
          <span className="text-[14px] font-semibold" style={{ color: t.textPrimary }}>Exportar datos</span>
        </button>
        <button onClick={onImport} className="w-full flex items-center gap-3 py-3" style={{ borderBottom: `1px solid ${t.border}` }}>
          <Upload size={17} color={t.textSecondary} />
          <span className="text-[14px] font-semibold" style={{ color: t.textPrimary }}>Importar datos</span>
        </button>
        <button onClick={() => setConfirmDelete(true)} className="w-full flex items-center gap-3 py-3">
          <Trash2 size={17} color={t.red} />
          <span className="text-[14px] font-semibold" style={{ color: t.red }}>Eliminar todos los datos</span>
        </button>
      </Card>

      {confirmDelete && (
        <Modal t={t} title="Eliminar todos los datos" onClose={() => setConfirmDelete(false)}>
          <p className="text-[13.5px] mb-4" style={{ color: t.textSecondary }}>
            Esta acción eliminará permanentemente todos tus gastos, quincenas e historial. No se puede deshacer.
          </p>
          <div className="flex gap-2.5">
            <button
              onClick={() => setConfirmDelete(false)}
              className="flex-1 py-2.5 rounded-xl text-[13.5px] font-semibold"
              style={{ background: t.cardSoft, color: t.textPrimary }}
            >
              Cancelar
            </button>
            <button
              onClick={() => { onDeleteAll(); setConfirmDelete(false); }}
              className="flex-1 py-2.5 rounded-xl text-[13.5px] font-semibold"
              style={{ background: t.red, color: "#fff" }}
            >
              Eliminar
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

export default function ExpensesTrackerApp() {
  const [tab, setTab] = useState("inicio");
  const [appearance, setAppearance] = useState("claro");
  const isDark = appearance === "oscuro";
  const t = PALETTES[isDark ? "dark" : "light"];

  const bounds = useMemo(() => currentQuincenaBounds(), []);
  const [period, setPeriod] = useState({ start: bounds.start, end: bounds.end, income: 10000, previousBalance: 0 });
  const [expenses, setExpenses] = useState(seedExpenses());
  const [history, setHistory] = useState(seedHistory());

  const [alertThreshold, setAlertThreshold] = useState(1500);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const notifiedRef = useRef(false);

  const [showNewExpense, setShowNewExpense] = useState(false);
  const [showEndQuincena, setShowEndQuincena] = useState(false);
  const [showNewQuincena, setShowNewQuincena] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "" });

  const expensesInPeriod = useMemo(
    () => expenses.slice().sort((a, b) => b.date - a.date),
    [expenses]
  );
  const totalExpenses = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const totalAvailable = period.income + period.previousBalance;
  const balance = totalAvailable - totalExpenses;

  const expensesByCategory = useMemo(() => {
    return CATEGORIES.map((c) => ({
      ...c,
      total: expenses.filter((e) => e.category === c.id).reduce((s, e) => s + e.amount, 0),
    })).filter((c) => c.total > 0);
  }, [expenses]);

  useEffect(() => {
    if (balance <= alertThreshold) {
      if (!notifiedRef.current && notifications) {
        notifiedRef.current = true;
      }
    } else {
      notifiedRef.current = false;
      if (alertDismissed) setAlertDismissed(false);
    }
  }, [balance, alertThreshold, notifications]);

  function showToast(message) {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 2200);
  }

  function handleAddExpense(newExpense) {
    setExpenses((prev) => [{ ...newExpense, id: `${Date.now()}` }, ...prev]);
    setShowNewExpense(false);
    showToast("Gasto guardado");
  }

  function handleEndQuincena() {
    const finalBalance = totalAvailable - totalExpenses;
    setHistory((prev) => [
      { id: `${Date.now()}`, label: fmtRange(period.start, period.end) + " " + period.end.getFullYear(), income: period.income, previousBalance: period.previousBalance, expenses: totalExpenses },
      ...prev,
    ]);
    setShowEndQuincena(false);
    setShowNewQuincena(true);
  }

  function handleStartQuincena(newIncome) {
    const finalBalance = totalAvailable - totalExpenses;
    const nb = currentQuincenaBounds(new Date(period.end.getTime() + 86400000));
    setPeriod({ start: nb.start, end: nb.end, income: newIncome, previousBalance: finalBalance });
    setExpenses([]);
    setAlertDismissed(false);
    notifiedRef.current = false;
    setShowNewQuincena(false);
    showToast("Nueva quincena iniciada");
  }

  function handleDeleteAll() {
    setExpenses([]);
    setHistory([]);
    setPeriod({ start: bounds.start, end: bounds.end, income: 0, previousBalance: 0 });
    showToast("Datos eliminados");
  }

  const navItems = [
    { id: "inicio", label: "Inicio", icon: Home },
    { id: "gastos", label: "Gastos", icon: Receipt },
    { id: "historial", label: "Historial", icon: History },
    { id: "config", label: "Config.", icon: Settings },
  ];

  return (
    <div style={{ background: t.bg, minHeight: "100%", fontFamily: "Inter, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Sora:wght@600;700;800&display=swap');
      `}</style>

      <div className="max-w-md mx-auto relative" style={{ minHeight: "100vh" }}>
        {tab === "inicio" && (
          <Dashboard
            t={t}
            isDark={isDark}
            period={period}
            expensesInPeriod={expensesInPeriod}
            totalExpenses={totalExpenses}
            totalAvailable={totalAvailable}
            balance={balance}
            alertThreshold={alertThreshold}
            alertDismissed={alertDismissed}
            onDismissAlert={() => setAlertDismissed(true)}
            onOpenNewExpense={() => setShowNewExpense(true)}
            onGoToExpenses={() => setTab("gastos")}
            onEndQuincena={() => setShowEndQuincena(true)}
          />
        )}
        {tab === "gastos" && (
          <GastosScreen t={t} isDark={isDark} expensesInPeriod={expensesInPeriod} totalExpenses={totalExpenses} />
        )}
        {tab === "historial" && (
          <HistorialScreen t={t} history={history} currentExpensesByCategory={expensesByCategory} isDark={isDark} />
        )}
        {tab === "config" && (
          <ConfiguracionScreen
            t={t}
            alertThreshold={alertThreshold}
            setAlertThreshold={setAlertThreshold}
            notifications={notifications}
            setNotifications={setNotifications}
            appearance={appearance}
            setAppearance={setAppearance}
            onExport={() => showToast("Datos exportados")}
            onImport={() => showToast("Datos importados")}
            onDeleteAll={handleDeleteAll}
          />
        )}

        {/* FAB */}
        <button
          onClick={() => setShowNewExpense(true)}
          className="fixed z-40 rounded-full flex items-center justify-center"
          style={{
            width: 56,
            height: 56,
            right: "max(20px, calc(50% - 224px + 20px))",
            bottom: 84,
            background: t.primary,
            boxShadow: "0 10px 24px rgba(44,111,176,0.4)",
          }}
        >
          <Plus size={24} color="#fff" strokeWidth={2.5} />
        </button>

        {/* Bottom nav */}
        <div className="fixed bottom-0 left-0 right-0 z-30 flex justify-center" style={{ background: "transparent" }}>
          <div
            className="w-full max-w-md flex items-stretch"
            style={{ background: t.card, borderTop: `1px solid ${t.border}` }}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className="flex-1 flex flex-col items-center gap-1 py-2.5"
                >
                  <Icon size={20} color={active ? t.primary : t.textSecondary} strokeWidth={active ? 2.4 : 2} />
                  <span
                    className="text-[10.5px]"
                    style={{ color: active ? t.primary : t.textSecondary, fontWeight: active ? 700 : 500 }}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <Toast t={t} show={toast.show} message={toast.message} />

        {showNewExpense && (
          <NewExpenseModal t={t} onClose={() => setShowNewExpense(false)} onSave={handleAddExpense} />
        )}

        {showEndQuincena && (
          <Modal t={t} title="Quincena finalizada" onClose={() => setShowEndQuincena(false)}>
            <div className="text-center py-2">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-xl p-3" style={{ background: t.cardSoft }}>
                  <div className="text-[11.5px]" style={{ color: t.textSecondary }}>Ingreso</div>
                  <div className="text-[15px] font-bold" style={{ color: t.textPrimary }}>{money(period.income)}</div>
                </div>
                <div className="rounded-xl p-3" style={{ background: t.cardSoft }}>
                  <div className="text-[11.5px]" style={{ color: t.textSecondary }}>Gastos</div>
                  <div className="text-[15px] font-bold" style={{ color: t.textPrimary }}>{money(totalExpenses)}</div>
                </div>
              </div>
              <div className="text-[12.5px]" style={{ color: t.textSecondary }}>Saldo sobrante</div>
              <div className="text-[28px] font-extrabold mt-0.5" style={{ color: t.green, fontFamily: "Sora, sans-serif" }}>
                {money(balance)}
              </div>
              <div className="text-[13.5px] font-semibold mt-3" style={{ color: t.textPrimary }}>
                {balance >= 0
                  ? `¡Excelente! Terminaste la quincena con ${money(balance)} disponibles.`
                  : `Terminaste la quincena con un déficit de ${money(Math.abs(balance))}.`}
              </div>
              <button
                onClick={handleEndQuincena}
                className="w-full mt-5 py-3 rounded-xl text-[14px] font-bold"
                style={{ background: t.primary, color: "#fff" }}
              >
                Continuar
              </button>
            </div>
          </Modal>
        )}

        {showNewQuincena && (
          <NewQuincenaModal t={t} previousBalance={balance} onStart={handleStartQuincena} />
        )}
      </div>
    </div>
  );
}

function NewExpenseModal({ t, onClose, onSave }) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState(PAYMENT_METHODS[0]);

  const canSave = Number(amount) > 0 && description.trim().length > 0;

  function submit() {
    if (!canSave) return;
    onSave({
      amount: Number(amount),
      category,
      description: description.trim(),
      date: new Date(date + "T00:00:00"),
      method,
    });
  }

  return (
    <Modal t={t} title="Nuevo gasto" onClose={onClose} wide>
      <div className="space-y-4">
        <div>
          <div className="text-[12.5px] font-semibold mb-1.5" style={{ color: t.textSecondary }}>Monto</div>
          <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl" style={{ background: t.cardSoft }}>
            <span className="text-[16px] font-bold" style={{ color: t.textSecondary }}>C$</span>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="0"
              inputMode="decimal"
              className="bg-transparent outline-none text-[18px] font-bold flex-1"
              style={{ color: t.textPrimary }}
            />
          </div>
        </div>

        <div>
          <div className="text-[12.5px] font-semibold mb-1.5" style={{ color: t.textSecondary }}>Categoría</div>
          <CategoryPicker t={t} value={category} onChange={setCategory} />
        </div>

        <div>
          <div className="text-[12.5px] font-semibold mb-1.5" style={{ color: t.textSecondary }}>Descripción</div>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Compra en supermercado"
            className="w-full px-3.5 py-3 rounded-xl outline-none text-[14px]"
            style={{ background: t.cardSoft, color: t.textPrimary }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-[12.5px] font-semibold mb-1.5" style={{ color: t.textSecondary }}>Fecha</div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-3 rounded-xl outline-none text-[13px]"
              style={{ background: t.cardSoft, color: t.textPrimary }}
            />
          </div>
          <div>
            <div className="text-[12.5px] font-semibold mb-1.5" style={{ color: t.textSecondary }}>Método de pago</div>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full px-3 py-3 rounded-xl outline-none text-[13px]"
              style={{ background: t.cardSoft, color: t.textPrimary }}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={submit}
          disabled={!canSave}
          className="w-full py-3.5 rounded-xl text-[14.5px] font-bold flex items-center justify-center gap-2"
          style={{ background: canSave ? t.primary : t.cardSoft, color: canSave ? "#fff" : t.textSecondary }}
        >
          <Check size={17} /> Guardar gasto
        </button>
      </div>
    </Modal>
  );
}

function NewQuincenaModal({ t, previousBalance, onStart }) {
  const [income, setIncome] = useState("10000");
  const newTotal = (Number(income) || 0) + previousBalance;

  return (
    <Modal t={t} title="Nueva quincena" onClose={() => {}}>
      <div className="space-y-4">
        <div className="rounded-xl p-3 flex items-center justify-between" style={{ background: t.cardSoft }}>
          <span className="text-[13px]" style={{ color: t.textSecondary }}>Saldo anterior</span>
          <span className="text-[14px] font-bold" style={{ color: t.textPrimary }}>{money(previousBalance)}</span>
        </div>
        <div>
          <div className="text-[13px] font-semibold mb-1.5" style={{ color: t.textPrimary }}>
            ¿Cuánto recibiste esta quincena?
          </div>
          <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl" style={{ background: t.cardSoft }}>
            <span className="text-[16px] font-bold" style={{ color: t.textSecondary }}>C$</span>
            <input
              value={income}
              onChange={(e) => setIncome(e.target.value.replace(/[^0-9]/g, ""))}
              className="bg-transparent outline-none text-[18px] font-bold flex-1"
              style={{ color: t.textPrimary }}
            />
          </div>
        </div>
        <div className="rounded-xl p-3.5" style={{ background: t.primarySoft }}>
          <div className="text-[12px]" style={{ color: t.textSecondary }}>Saldo inicial</div>
          <div className="text-[20px] font-extrabold" style={{ color: t.primary, fontFamily: "Sora, sans-serif" }}>
            {money(newTotal)}
          </div>
        </div>
        <button
          onClick={() => onStart(Number(income) || 0)}
          className="w-full py-3.5 rounded-xl text-[14.5px] font-bold"
          style={{ background: t.primary, color: "#fff" }}
        >
          Iniciar quincena
        </button>
      </div>
    </Modal>
  );
}
