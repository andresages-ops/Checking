const { useState, useEffect, useMemo, useCallback } = React;

// ---------- icons (inline SVG, no dependency needed) ----------
function IconBase({ children, size = 18, color = "currentColor", className = "", style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      {children}
    </svg>
  );
}
const LogIn = (p) => <IconBase {...p}><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></IconBase>;
const LogOut = (p) => <IconBase {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></IconBase>;
const Coffee = (p) => <IconBase {...p}><path d="M17 8h1a4 4 0 1 1 0 8h-1" /><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" /><line x1="6" y1="2" x2="6" y2="4" /><line x1="10" y1="2" x2="10" y2="4" /><line x1="14" y1="2" x2="14" y2="4" /></IconBase>;
const ChevronLeft = (p) => <IconBase {...p}><polyline points="15 18 9 12 15 6" /></IconBase>;
const ChevronRight = (p) => <IconBase {...p}><polyline points="9 18 15 12 9 6" /></IconBase>;
const RotateCcw = (p) => <IconBase {...p}><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><polyline points="3 3 3 8 8 8" /></IconBase>;
const Undo2 = (p) => <IconBase {...p}><path d="M9 14 4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" /></IconBase>;
const Pencil = (p) => <IconBase {...p}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></IconBase>;
const XIcon = (p) => <IconBase {...p}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></IconBase>;
const Plus = (p) => <IconBase {...p}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></IconBase>;
const Trash2 = (p) => <IconBase {...p}><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></IconBase>;
const Download = (p) => <IconBase {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></IconBase>;
const Upload = (p) => <IconBase {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></IconBase>;

// ---------- helpers ----------
const pad = (n) => String(n).padStart(2, "0");
const dateKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };

function getWeekRange(ref) {
  const d = startOfDay(ref);
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const start = new Date(d); start.setDate(d.getDate() + diffToMonday);
  const end = new Date(start); end.setDate(start.getDate() + 6); end.setHours(23, 59, 59, 999);
  return { start, end };
}
function getQuincenaRange(ref) {
  const d = startOfDay(ref);
  const y = d.getFullYear(), m = d.getMonth(), day = d.getDate();
  if (day <= 15) return { start: new Date(y, m, 1), end: new Date(y, m, 15, 23, 59, 59, 999) };
  return { start: new Date(y, m, 16), end: new Date(y, m + 1, 0, 23, 59, 59, 999) };
}
function getMonthRange(ref) {
  const y = ref.getFullYear(), m = ref.getMonth();
  return { start: new Date(y, m, 1), end: new Date(y, m + 1, 0, 23, 59, 59, 999) };
}
function getRange(ref, type) {
  if (type === "semana") return getWeekRange(ref);
  if (type === "quincena") return getQuincenaRange(ref);
  return getMonthRange(ref);
}
function navigatePeriod(ref, type, dir) {
  const d = new Date(ref);
  if (type === "semana") { d.setDate(d.getDate() + 7 * dir); return d; }
  if (type === "mes") { d.setMonth(d.getMonth() + dir); return d; }
  const day = d.getDate();
  if (dir === 1) {
    if (day <= 15) d.setDate(16);
    else { d.setMonth(d.getMonth() + 1); d.setDate(1); }
  } else {
    if (day <= 15) { d.setMonth(d.getMonth() - 1); d.setDate(16); }
    else d.setDate(1);
  }
  return d;
}
function formatRangeLabel(range, type, ref) {
  if (type === "mes") {
    const label = ref.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
    return label.charAt(0).toUpperCase() + label.slice(1);
  }
  const opts = { day: "numeric", month: "short" };
  return `${range.start.toLocaleDateString("es-MX", opts)} – ${range.end.toLocaleDateString("es-MX", opts)}`;
}
function computeWorkedMs(entry, nowMs) {
  if (!entry || !entry.clockIn) return 0;
  const end = entry.clockOut || nowMs;
  let gross = end - entry.clockIn;
  let breaksMs = 0;
  (entry.breaks || []).forEach((b) => {
    const bEnd = b.end || (entry.status === "break" ? nowMs : b.start);
    breaksMs += bEnd - b.start;
  });
  return Math.max(0, gross - breaksMs);
}
function formatDuration(ms) {
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60), m = totalMin % 60;
  return `${h}h ${pad(m)}m`;
}
function formatClock(ms) {
  return new Date(ms).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}
function emptyEntry() { return { status: "idle", clockIn: null, clockOut: null, breaks: [] }; }
function parseKey(key) { const [y, m, d] = key.split("-").map(Number); return new Date(y, m - 1, d); }
function toTimeInput(ts) { const d = new Date(ts); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; }
function fromTimeInput(dayDate, hhmm) {
  if (!hhmm) return null;
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(dayDate);
  d.setHours(h, m, 0, 0);
  return d.getTime();
}
function csvCell(v) { return `"${String(v).replace(/"/g, '""')}"`; }
function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const STATUS_META = {
  idle: { label: "Sin iniciar", color: "#9C948A" },
  working: { label: "Trabajando", color: "#E8823C" },
  break: { label: "En descanso", color: "#D9A441" },
  done: { label: "Jornada completada", color: "#6FA383" },
};
const STORAGE_KEY = "checador-entries";

function Checador() {
  const [entries, setEntries] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [periodType, setPeriodType] = useState("semana");
  const [periodRef, setPeriodRef] = useState(new Date());
  const [justPunched, setJustPunched] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [draft, setDraft] = useState(null);

  // load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setEntries(JSON.parse(raw));
    } catch (e) {
      console.error("No se pudo leer el almacenamiento local", e);
    } finally {
      setLoaded(true);
    }
  }, []);

  // save to localStorage
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (e) {
      console.error("No se pudo guardar en el almacenamiento local", e);
    }
  }, [entries, loaded]);

  // clock
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const todayKey = dateKey(new Date(now));
  const today = entries[todayKey] || emptyEntry();

  const updateToday = useCallback((updater) => {
    setEntries((prev) => {
      const key = dateKey(new Date());
      const cur = prev[key] || emptyEntry();
      return { ...prev, [key]: updater(cur) };
    });
    setJustPunched(true);
    setTimeout(() => setJustPunched(false), 500);
  }, []);

  const clockIn = () => updateToday((cur) => ({ ...cur, status: "working", clockIn: Date.now(), clockOut: null, breaks: cur.breaks || [] }));
  const startBreak = () => updateToday((cur) => ({ ...cur, status: "break", breaks: [...(cur.breaks || []), { start: Date.now(), end: null }] }));
  const endBreak = () => updateToday((cur) => {
    const breaks = [...(cur.breaks || [])];
    if (breaks.length) breaks[breaks.length - 1] = { ...breaks[breaks.length - 1], end: Date.now() };
    return { ...cur, status: "working", breaks };
  });
  const clockOut = () => updateToday((cur) => ({ ...cur, status: "done", clockOut: Date.now() }));
  const undoClockOut = () => updateToday((cur) => ({ ...cur, status: "working", clockOut: null }));
  const resetToday = () => {
    if (!window.confirm("¿Borrar el registro de hoy?")) return;
    setEntries((prev) => { const next = { ...prev }; delete next[todayKey]; return next; });
  };

  // ---- manual edit ----
  const openEditor = (key) => {
    const entry = entries[key];
    setDraft({
      key,
      clockIn: entry?.clockIn ? toTimeInput(entry.clockIn) : "",
      clockOut: entry?.clockOut ? toTimeInput(entry.clockOut) : "",
      breaks: (entry?.breaks || []).map((b) => ({
        start: b.start ? toTimeInput(b.start) : "",
        end: b.end ? toTimeInput(b.end) : "",
      })),
    });
    setEditingKey(key);
  };
  const closeEditor = () => { setEditingKey(null); setDraft(null); };
  const addBreakRow = () => setDraft((d) => ({ ...d, breaks: [...d.breaks, { start: "", end: "" }] }));
  const removeBreakRow = (i) => setDraft((d) => ({ ...d, breaks: d.breaks.filter((_, idx) => idx !== i) }));
  const updateBreakRow = (i, field, value) => setDraft((d) => {
    const breaks = [...d.breaks];
    breaks[i] = { ...breaks[i], [field]: value };
    return { ...d, breaks };
  });
  const saveDraft = () => {
    const dayDate = parseKey(draft.key);
    const clockIn = fromTimeInput(dayDate, draft.clockIn);
    const clockOut = fromTimeInput(dayDate, draft.clockOut);
    if (clockIn && clockOut && clockOut <= clockIn) {
      window.alert("La hora de salida debe ser posterior a la entrada.");
      return;
    }
    const breaks = [];
    for (const b of draft.breaks) {
      if (!b.start && !b.end) continue;
      if (!b.start || !b.end) {
        window.alert("Completa el inicio y fin de cada descanso, o elimínalo.");
        return;
      }
      const s = fromTimeInput(dayDate, b.start);
      const e = fromTimeInput(dayDate, b.end);
      if (e <= s) {
        window.alert("El fin de un descanso debe ser posterior a su inicio.");
        return;
      }
      breaks.push({ start: s, end: e });
    }
    const status = clockOut ? "done" : clockIn ? "working" : "idle";
    setEntries((prev) => {
      const next = { ...prev };
      if (!clockIn && !clockOut && breaks.length === 0) delete next[draft.key];
      else next[draft.key] = { status, clockIn, clockOut, breaks };
      return next;
    });
    closeEditor();
  };

  const workedTodayMs = computeWorkedMs(today, now);
  const meta = STATUS_META[today.status] || STATUS_META.idle;

  // period aggregation
  const range = useMemo(() => getRange(periodRef, periodType), [periodRef, periodType]);
  const days = useMemo(() => {
    const list = [];
    const cursor = new Date(range.start);
    while (cursor <= range.end) {
      const key = dateKey(cursor);
      const entry = entries[key];
      const ms = computeWorkedMs(entry, now);
      list.push({ key, date: new Date(cursor), ms, hasEntry: !!entry && entry.clockIn });
      cursor.setDate(cursor.getDate() + 1);
    }
    return list;
  }, [range, entries, now]);
  const totalMs = days.reduce((acc, d) => acc + d.ms, 0);
  const maxBarMs = 10 * 3600000;

  // ---- backup / restore ----
  const exportPeriodCSV = () => {
    const header = ["Fecha", "Entrada", "Descansos", "Salida", "Horas trabajadas"];
    const rows = days.map((d) => {
      const entry = entries[d.key];
      const entrada = entry && entry.clockIn ? formatClock(entry.clockIn) : "";
      const salida = entry && entry.clockOut ? formatClock(entry.clockOut) : "";
      const descansos = entry && entry.breaks && entry.breaks.length
        ? entry.breaks.map((b) => `${formatClock(b.start)}-${b.end ? formatClock(b.end) : "?"}`).join(" / ")
        : "";
      const horas = d.ms > 0 ? formatDuration(d.ms) : "";
      return [d.date.toLocaleDateString("es-MX"), entrada, descansos, salida, horas];
    });
    const totalRow = ["", "", "", "Total", formatDuration(totalMs)];
    const csv = [header, ...rows, totalRow].map((r) => r.map(csvCell).join(",")).join("\r\n");
    downloadBlob("\uFEFF" + csv, `checador-reporte-${dateKey(range.start)}_a_${dateKey(range.end)}.csv`, "text/csv;charset=utf-8;");
  };
  const exportFullBackup = () => {
    downloadBlob(JSON.stringify(entries, null, 2), `checador-respaldo-${dateKey(new Date())}.json`, "application/json");
  };
  const importBackup = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (typeof parsed !== "object" || parsed === null) throw new Error("formato inválido");
        if (!window.confirm("Esto reemplazará todos tus registros actuales con los del respaldo. ¿Continuar?")) return;
        setEntries(parsed);
      } catch (err) {
        window.alert("El archivo no es un respaldo válido de Checador.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen w-full flex justify-center" style={{ background: "#1C1B1A" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;700&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; }
        @keyframes stampPop { 0% { transform: scale(0.85) rotate(-6deg); opacity: 0; } 60% { transform: scale(1.05) rotate(2deg); opacity: 1; } 100% { transform: scale(1) rotate(0deg); } }
        .stamp-pop { animation: stampPop 0.4s ease-out; }
        .ticket { position: relative; }
        .ticket::before, .ticket::after {
          content: ''; position: absolute; top: 50%; width: 16px; height: 16px;
          background: #1C1B1A; border-radius: 50%; transform: translateY(-50%);
        }
        .ticket::before { left: -8px; }
        .ticket::after { right: -8px; }
        .hidden-input { position: absolute; width: 1px; height: 1px; opacity: 0; overflow: hidden; }
      `}</style>

      <div className="w-full max-w-md px-5 pt-8 pb-16 font-body" style={{ color: "#F5F1EA" }}>
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold tracking-tight">Checador</h1>
          <p className="text-sm" style={{ color: "#9C948A" }}>
            {new Date(now).toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>

        {/* Status card */}
        <div className="rounded-2xl p-5 mb-4" style={{ background: "#24211F", border: "1px solid #3A352F" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full" style={{ background: meta.color }} />
              <span className="text-sm font-medium" style={{ color: meta.color }}>{meta.label}</span>
            </div>
            <span className="font-mono text-sm" style={{ color: "#9C948A" }}>{formatClock(now)}</span>
          </div>

          <div className="font-mono font-bold text-4xl mb-5" style={{ color: "#F5F1EA" }}>
            {formatDuration(workedTodayMs)}
          </div>

          {today.status === "idle" && (
            <>
              <button onClick={clockIn} className="w-full py-3.5 rounded-xl font-display font-bold text-base flex items-center justify-center gap-2 active:scale-95 transition-transform" style={{ background: "#E8823C", color: "#1C1B1A" }}>
                <LogIn size={18} /> Marcar entrada
              </button>
              <button onClick={() => openEditor(todayKey)} className="w-full text-xs mt-2.5 flex items-center justify-center gap-1" style={{ color: "#9C948A" }}>
                <Pencil size={11} /> ¿Olvidaste marcar? Ajustar manualmente
              </button>
            </>
          )}

          {today.status === "working" && (
            <div className="flex gap-2">
              <button onClick={startBreak} className="flex-1 py-3.5 rounded-xl font-display font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform" style={{ background: "transparent", border: "1px solid #D9A441", color: "#D9A441" }}>
                <Coffee size={17} /> Descanso
              </button>
              <button onClick={clockOut} className="flex-1 py-3.5 rounded-xl font-display font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform" style={{ background: "#6FA383", color: "#1C1B1A" }}>
                <LogOut size={17} /> Salida
              </button>
            </div>
          )}

          {today.status === "break" && (
            <button onClick={endBreak} className="w-full py-3.5 rounded-xl font-display font-bold text-base flex items-center justify-center gap-2 active:scale-95 transition-transform" style={{ background: "#D9A441", color: "#1C1B1A" }}>
              <Coffee size={18} /> Finalizar descanso
            </button>
          )}

          {today.status === "done" && (
            <button onClick={undoClockOut} className="w-full py-3 rounded-xl font-body text-sm flex items-center justify-center gap-2" style={{ background: "transparent", border: "1px solid #3A352F", color: "#9C948A" }}>
              <Undo2 size={15} /> Deshacer salida
            </button>
          )}
        </div>

        {/* Today's ticket */}
        {today.clockIn && (
          <div className={`ticket rounded-xl p-4 mb-6 ${justPunched ? "stamp-pop" : ""}`} style={{ background: "#2C2825", border: "1px dashed #4A443C" }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wide" style={{ color: "#9C948A" }}>Registro de hoy</span>
              <div className="flex items-center gap-3">
                <button onClick={() => openEditor(todayKey)} className="text-xs flex items-center gap-1" style={{ color: "#9C948A" }}>
                  <Pencil size={12} /> Editar
                </button>
                <button onClick={resetToday} className="text-xs flex items-center gap-1" style={{ color: "#9C948A" }}>
                  <RotateCcw size={12} /> Reiniciar
                </button>
              </div>
            </div>
            <div className="space-y-1.5 font-mono text-sm">
              <div className="flex justify-between"><span style={{ color: "#9C948A" }}>Entrada</span><span>{formatClock(today.clockIn)}</span></div>
              {(today.breaks || []).map((b, i) => (
                <div key={i} className="flex justify-between"><span style={{ color: "#9C948A" }}>Descanso {today.breaks.length > 1 ? i + 1 : ""}</span><span>{formatClock(b.start)} – {b.end ? formatClock(b.end) : "en curso"}</span></div>
              ))}
              <div className="flex justify-between"><span style={{ color: "#9C948A" }}>Salida</span><span>{today.clockOut ? formatClock(today.clockOut) : "—"}</span></div>
            </div>
          </div>
        )}

        {/* Period selector */}
        <div className="flex rounded-xl overflow-hidden mb-4" style={{ border: "1px solid #3A352F" }}>
          {["semana", "quincena", "mes"].map((t) => (
            <button
              key={t}
              onClick={() => { setPeriodType(t); setPeriodRef(new Date()); }}
              className="flex-1 py-2 text-sm font-medium capitalize transition-colors"
              style={{ background: periodType === t ? "#E8823C" : "transparent", color: periodType === t ? "#1C1B1A" : "#9C948A" }}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setPeriodRef((r) => navigatePeriod(r, periodType, -1))} className="p-1.5 rounded-lg" style={{ background: "#24211F" }}>
            <ChevronLeft size={18} color="#9C948A" />
          </button>
          <span className="text-sm font-medium">{formatRangeLabel(range, periodType, periodRef)}</span>
          <button onClick={() => setPeriodRef((r) => navigatePeriod(r, periodType, 1))} className="p-1.5 rounded-lg" style={{ background: "#24211F" }}>
            <ChevronRight size={18} color="#9C948A" />
          </button>
        </div>

        {/* Summary total */}
        <div className="rounded-2xl p-5 mb-4" style={{ background: "#24211F", border: "1px solid #3A352F" }}>
          <p className="text-xs uppercase tracking-wide mb-1" style={{ color: "#9C948A" }}>Total del periodo</p>
          <p className="font-mono font-bold text-3xl" style={{ color: "#F5F1EA" }}>{formatDuration(totalMs)}</p>
        </div>

        {/* Daily breakdown */}
        <div className="space-y-2 mb-6">
          {days.map((d) => {
            const isToday = d.key === todayKey;
            const pct = Math.min(100, (d.ms / maxBarMs) * 100);
            return (
              <button
                key={d.key}
                onClick={() => openEditor(d.key)}
                className="w-full flex items-center gap-3 py-0.5 rounded-lg active:opacity-70 transition-opacity"
              >
                <span className="text-xs w-9 shrink-0 capitalize text-left" style={{ color: isToday ? "#E8823C" : "#9C948A" }}>
                  {d.date.toLocaleDateString("es-MX", { weekday: "short" }).replace(".", "")}
                </span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "#2C2825" }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: d.ms > 0 ? "#E8823C" : "transparent" }} />
                </div>
                <span className="font-mono text-xs w-14 text-right shrink-0" style={{ color: d.ms > 0 ? "#F5F1EA" : "#5A5450" }}>
                  {d.ms > 0 ? formatDuration(d.ms) : "—"}
                </span>
                <Pencil size={11} style={{ color: "#5A5450" }} className="shrink-0" />
              </button>
            );
          })}
        </div>

        {/* Backup / report */}
        <div className="rounded-2xl p-5" style={{ background: "#24211F", border: "1px solid #3A352F" }}>
          <p className="text-xs uppercase tracking-wide mb-3" style={{ color: "#9C948A" }}>Respaldo</p>
          <div className="space-y-2">
            <button onClick={exportPeriodCSV} className="w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform" style={{ background: "#E8823C", color: "#1C1B1A" }}>
              <Download size={16} /> Descargar reporte del periodo (CSV)
            </button>
            <button onClick={exportFullBackup} className="w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2" style={{ background: "transparent", border: "1px solid #3A352F", color: "#F5F1EA" }}>
              <Download size={16} /> Descargar respaldo completo (JSON)
            </button>
            <label className="w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 cursor-pointer" style={{ background: "transparent", border: "1px solid #3A352F", color: "#9C948A" }}>
              <Upload size={16} /> Restaurar respaldo
              <input type="file" accept="application/json" className="hidden-input" onChange={(e) => { if (e.target.files[0]) importBackup(e.target.files[0]); e.target.value = ""; }} />
            </label>
          </div>
          <p className="text-xs mt-3" style={{ color: "#5A5450" }}>
            El reporte CSV es para tus registros; el respaldo JSON sirve para restaurar tus datos si cambias de navegador o dispositivo.
          </p>
        </div>
      </div>

      {/* Manual edit modal */}
      {editingKey && draft && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }} onClick={closeEditor}>
          <div
            className="w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 font-body"
            style={{ background: "#24211F", border: "1px solid #3A352F", color: "#F5F1EA" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display font-bold text-lg">Ajustar registro</h2>
                <p className="text-xs capitalize" style={{ color: "#9C948A" }}>
                  {parseKey(editingKey).toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
                </p>
              </div>
              <button onClick={closeEditor} className="p-1.5 rounded-lg" style={{ background: "#2C2825" }}>
                <XIcon size={16} color="#9C948A" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <label className="block">
                <span className="text-xs" style={{ color: "#9C948A" }}>Entrada</span>
                <input
                  type="time"
                  value={draft.clockIn}
                  onChange={(e) => setDraft((d) => ({ ...d, clockIn: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 rounded-lg font-mono text-sm outline-none"
                  style={{ background: "#1C1B1A", border: "1px solid #3A352F", color: "#F5F1EA", colorScheme: "dark" }}
                />
              </label>
              <label className="block">
                <span className="text-xs" style={{ color: "#9C948A" }}>Salida</span>
                <input
                  type="time"
                  value={draft.clockOut}
                  onChange={(e) => setDraft((d) => ({ ...d, clockOut: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 rounded-lg font-mono text-sm outline-none"
                  style={{ background: "#1C1B1A", border: "1px solid #3A352F", color: "#F5F1EA", colorScheme: "dark" }}
                />
              </label>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs" style={{ color: "#9C948A" }}>Descansos</span>
                <button onClick={addBreakRow} className="text-xs flex items-center gap-1" style={{ color: "#D9A441" }}>
                  <Plus size={12} /> Agregar
                </button>
              </div>
              {draft.breaks.length === 0 && (
                <p className="text-xs" style={{ color: "#5A5450" }}>Sin descansos registrados.</p>
              )}
              <div className="space-y-2">
                {draft.breaks.map((b, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="time"
                      value={b.start}
                      onChange={(e) => updateBreakRow(i, "start", e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg font-mono text-sm outline-none"
                      style={{ background: "#1C1B1A", border: "1px solid #3A352F", color: "#F5F1EA", colorScheme: "dark" }}
                    />
                    <span style={{ color: "#5A5450" }}>–</span>
                    <input
                      type="time"
                      value={b.end}
                      onChange={(e) => updateBreakRow(i, "end", e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg font-mono text-sm outline-none"
                      style={{ background: "#1C1B1A", border: "1px solid #3A352F", color: "#F5F1EA", colorScheme: "dark" }}
                    />
                    <button onClick={() => removeBreakRow(i)} className="p-2 rounded-lg shrink-0" style={{ background: "#2C2825" }}>
                      <Trash2 size={14} color="#9C948A" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={closeEditor} className="flex-1 py-3 rounded-xl font-medium text-sm" style={{ background: "transparent", border: "1px solid #3A352F", color: "#9C948A" }}>
                Cancelar
              </button>
              <button onClick={saveDraft} className="flex-1 py-3 rounded-xl font-display font-bold text-sm" style={{ background: "#E8823C", color: "#1C1B1A" }}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Checador />);
