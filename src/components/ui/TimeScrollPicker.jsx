import { useState, useEffect, useRef } from "react";

function WheelColumn({ items, value, onChange }) {
  const itemHeight = 40;
  const containerRef = useRef(null);
  const timeoutRef = useRef(null);
  const isProgrammatic = useRef(false);

  // ✅ Auto-center selected value on mount/update
  useEffect(() => {
    if (!containerRef.current) return;

    const index = items.findIndex((item) => item === value);
    if (index === -1) return;

    const target = index * itemHeight;

    isProgrammatic.current = true;

    requestAnimationFrame(() => {
      containerRef.current.scrollTop = target;

      setTimeout(() => {
        isProgrammatic.current = false;
      }, 20);
    });
  }, [value, items]);

const handleScroll = (e) => {
  if (isProgrammatic.current) return;
  const el = e.target;

  if (timeoutRef.current) clearTimeout(timeoutRef.current);

  timeoutRef.current = setTimeout(() => {
    const index = Math.round(el.scrollTop / itemHeight);

    const clampedIndex = Math.max(0, Math.min(items.length - 1, index));

    const target = clampedIndex * itemHeight;

    // snap cleanly
    el.scrollTo({
      top: target,
      behavior: "auto", // 🔥 important (not smooth)
    });

    if (items[clampedIndex] !== value) {
      onChange(items[clampedIndex]);
    }
  }, 100); // 🔥 slightly slower = more stable
};

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="relative h-[130px] w-16 sm:h-[160px] sm:w-20 overflow-y-scroll rounded-2xl border border-[var(--app-border)] bg-[var(--surface-elevated)] shadow-[inset_0_1px_8px_rgba(0,0,0,0.12)] scrollbar-hide backdrop-blur-sm snap-y snap-mandatory"      
      style={
      items.length <= 3
       ? {}
        : {
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)",
            scrollBehavior: "auto",
        }}
    >
      {/* Center highlight */}
      <div className="pointer-events-none absolute left-2 right-2 top-1/2 z-10 h-10 -translate-y-1/2 rounded-xl border border-[var(--app-border-strong)] bg-[color:color-mix(in_srgb,var(--surface-elevated)_92%,white_8%)] shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_4px_12px_rgba(0,0,0,0.12)] backdrop-blur-sm"></div>

      <div className="py-12 sm:py-16">
        {items.map((item, i) => (
      <div
        key={item}
        onClick={() => {
          const el = containerRef.current;
          if (!el) return;

          const target = i * itemHeight;

          // 🔥 instantly jump (no animation)
          el.scrollTo({
            top: target,
            behavior: "auto",
          });

          onChange(item);
        }}
        className={`relative z-20 h-10 snap-center flex items-center justify-center tabular-nums cursor-pointer transition ${
          item === value
            ? "text-[var(--text-primary)] font-semibold text-lg"
            : "opacity-45 text-[var(--text-secondary)] hover:opacity-80"
        }`}
      >
        {item}
      </div>
    ))}
      </div>
    </div>
  );
}
export function TimeScrollPicker({ label, value, onChange }) {
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, "0")
  );
  const periods = ["AM", "PM"];

  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState("AM");

  // Sync external value → UI (only runs when value changes)
  useEffect(() => {
    if (!value || !value.includes(":")) return;

    const [h, m] = value.split(":");
    const hh = parseInt(h, 10);

    const isPM = hh >= 12;
    const displayHour = hh % 12 || 12;

    setHour(displayHour);
    const cleanMinute = m.slice(0, 2);
    setMinute(cleanMinute);
    setPeriod(isPM ? "PM" : "AM");
  }, [value]);

  // Convert UI → HH:mm
  const updateTime = (h, m, p) => {
    let hour24 = h;

    if (p === "PM" && hour24 !== 12) hour24 += 12;
    if (p === "AM" && hour24 === 12) hour24 = 0;

    const formatted = `${String(hour24).padStart(2, "0")}:${m}`;
    onChange(formatted);
  };

  return (
    <div>
      <label className="block text-sm mb-2">{label}</label>

      <div className="flex justify-center gap-4">
        <WheelColumn
          items={hours}
          value={hour}
          onChange={(val) => {
            setHour(val);
            updateTime(val, minute, period);
          }}
        />

        <WheelColumn
          items={minutes}
          value={minute}
          onChange={(val) => {
            setMinute(val);
            updateTime(hour, val, period);
          }}
        />

        <WheelColumn
          items={periods}
          value={period}
          onChange={(val) => {
            setPeriod(val);
            updateTime(hour, minute, val);
          }}
        />
      </div>
    </div>
  );
}