import { useState, useEffect, useRef } from "react";

function WheelColumn({ items, value, onChange }) {
  const itemHeight = 40;
  const containerRef = useRef(null);

  // ✅ Auto-center selected value on mount/update
  useEffect(() => {
  if (!containerRef.current) return;

  const index = items.findIndex((item) => item === value);

  if (index === -1) return;

  const target = index * itemHeight;

  // 🔥 force scroll AFTER render
  requestAnimationFrame(() => {
    containerRef.current.scrollTop = target;
  });
}, [value, items]);

let timeoutId = null;

const handleScroll = (e) => {
  const el = e.target;

  if (timeoutId) clearTimeout(timeoutId);

  timeoutId = setTimeout(() => {
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
      className="relative h-[160px] w-20 overflow-y-scroll border rounded-2xl bg-white shadow-inner scrollbar-hide"      
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
      <div className="absolute top-1/2 left-0 right-0 h-10 -translate-y-1/2 rounded-md bg-gray-100 border border-gray-300 pointer-events-none z-0"></div>

      <div className="py-16">
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
        className={`h-10 flex items-center justify-center cursor-pointer transition ${
          item === value
            ? "text-black font-semibold text-lg scale-110"
            : "text-gray-600 hover:text-black"
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
    setMinute(String(m).padStart(2, "0")); // 🔥 important
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