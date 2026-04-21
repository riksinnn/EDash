import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function Badge({ children, className = "" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[var(--app-border)] bg-[var(--app-panel-soft)] px-4 py-1 text-sm font-medium text-[var(--text-primary)]",
        className
      )}
    >
      {children}
    </span>
  );
}