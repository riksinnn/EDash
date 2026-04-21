import { ChevronDown } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function SelectField({ label, value, onChange, children, className }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-2 block text-xl font-medium text-[#354737]">{label}</span>
      <span className="relative block">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full appearance-none rounded-2xl border border-[#ddd4c3] bg-[#f8f5ef] px-4 py-3 pr-11 text-xl text-[#425642] shadow-[0_5px_18px_rgba(75,84,63,0.08)] outline-none focus:border-[#89a171]"
        >
          {children}
        </select>
        <ChevronDown
          size={18}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#7e8c7a]"
        />
      </span>
    </label>
  );
}