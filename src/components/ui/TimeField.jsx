import { Clock3 } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function TimeField({ label, value, onChange, className }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-2 block text-xl font-medium text-[#354737]">{label}</span>
      <span className="relative block">
        <input
          type="time"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-2xl border border-[#ddd4c3] bg-[#f8f5ef] px-4 py-3 pr-11 text-xl text-[#425642] shadow-[0_5px_18px_rgba(75,84,63,0.08)] outline-none focus:border-[#89a171]"
        />
        <Clock3
          size={18}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#1e211c]"
        />
      </span>
    </label>
  );
}