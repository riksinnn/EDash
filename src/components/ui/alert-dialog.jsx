import { X } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function AlertDialog({
  open,
  title,
  children,
  onClose,
  className = "",
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center p-4 backdrop-blur-[2px]"
      style={{ backgroundColor: "var(--overlay)" }}
    >
      <div
        className={cn(
          "w-full max-w-[480px] rounded-[22px] border border-[var(--app-border)] bg-[var(--app-panel-muted)] p-7 shadow-[var(--shadow-card)]",
          className
        )}
      >
        <div className="mb-8 flex items-start justify-between gap-4">
          <h2 className="font-serif text-4xl font-semibold text-[var(--text-primary)]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-[var(--text-secondary)] transition hover:bg-[var(--accent-soft)]"
            aria-label="Close dialog"
          >
            <X size={24} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}