import { useEffect, useRef } from "react";

function WheelColumn({ items, value, onChange }) {
  const itemHeight = 40;
  const containerRef = useRef(null);
  const timeoutRef = useRef(null);
  const isProgrammatic = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const index = items.findIndex((item) => item === value);
    if (index === -1) return;

    isProgrammatic.current = true;

    requestAnimationFrame(() => {
      containerRef.current.scrollTop = index * itemHeight;

      setTimeout(() => {
        isProgrammatic.current = false;
      }, 20);
    });
  }, [value, items]);

  const handleScroll = (event) => {
    if (isProgrammatic.current) return;

    const element = event.target;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      const index = Math.round(element.scrollTop / itemHeight);
      const clampedIndex = Math.max(0, Math.min(items.length - 1, index));
      const target = clampedIndex * itemHeight;

      element.scrollTo({ top: target, behavior: "auto" });

      if (items[clampedIndex] !== value) {
        onChange(items[clampedIndex]);
      }
    }, 100);
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="relative h-[130px] w-16 overflow-y-scroll rounded-2xl border border-[var(--app-border)] bg-[var(--surface-elevated)] shadow-[inset_0_1px_8px_rgba(0,0,0,0.12)] scrollbar-hide backdrop-blur-sm snap-y snap-mandatory sm:h-[160px] sm:w-20"
      style={
        items.length <= 3
          ? {}
          : {
              maskImage:
                "linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)",
              scrollBehavior: "auto",
            }
      }
    >
      <div className="pointer-events-none absolute left-2 right-2 top-1/2 z-10 h-10 -translate-y-1/2 rounded-xl border border-[var(--app-border-strong)] bg-[color:color-mix(in_srgb,var(--surface-elevated)_92%,white_8%)] shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_4px_12px_rgba(0,0,0,0.12)] backdrop-blur-sm" />

      <div className="py-12 sm:py-16">
        {items.map((item, index) => (
          <div
            key={item}
            onClick={() => {
              const element = containerRef.current;
              if (!element) return;

              element.scrollTo({ top: index * itemHeight, behavior: "auto" });
              onChange(item);
            }}
            className={`relative z-20 flex h-10 cursor-pointer snap-center items-center justify-center tabular-nums transition ${
              item === value
                ? "text-lg font-semibold text-[var(--text-primary)]"
                : "text-[var(--text-secondary)] opacity-45 hover:opacity-80"
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
  const hours = Array.from({ length: 12 }, (_, index) => index + 1);
  const minutes = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, "0"));
  const periods = ["AM", "PM"];
  const [hoursValue = "00", minutesValue = "00"] = value?.split(":") || [];
  const parsedHour = parseInt(hoursValue, 10);
  const hour = Number.isNaN(parsedHour) ? 12 : parsedHour % 12 || 12;
  const minute = minutesValue.slice(0, 2).padStart(2, "0");
  const period = !Number.isNaN(parsedHour) && parsedHour >= 12 ? "PM" : "AM";

  const updateTime = (nextHour, nextMinute, nextPeriod) => {
    let hour24 = nextHour;

    if (nextPeriod === "PM" && hour24 !== 12) hour24 += 12;
    if (nextPeriod === "AM" && hour24 === 12) hour24 = 0;

    onChange(`${String(hour24).padStart(2, "0")}:${nextMinute}`);
  };

  const handleTypedTimeChange = (event) => {
    const nextValue = event.target.value;
    if (!nextValue || /^\d{2}:\d{2}$/.test(nextValue)) {
      onChange(nextValue);
    }
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
        {label}
      </label>
      <input
        type="time"
        value={value || ""}
        onChange={handleTypedTimeChange}
        className="mb-3 w-full rounded-2xl border border-[var(--app-border)] bg-[var(--app-panel)] px-4 py-3 text-center text-lg text-[var(--text-primary)] shadow-[var(--shadow-soft)] outline-none transition focus:border-[var(--accent-strong)]"
      />

      <div className="flex justify-center gap-4">
        <WheelColumn
          items={hours}
          value={hour}
          onChange={(nextHour) => {
            updateTime(nextHour, minute, period);
          }}
        />

        <WheelColumn
          items={minutes}
          value={minute}
          onChange={(nextMinute) => {
            updateTime(hour, nextMinute, period);
          }}
        />

        <WheelColumn
          items={periods}
          value={period}
          onChange={(nextPeriod) => {
            updateTime(hour, minute, nextPeriod);
          }}
        />
      </div>
    </div>
  );
}
