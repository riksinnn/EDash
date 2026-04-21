import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function Avatar({ src, alt = "", fallback = "E", className = "" }) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn(
          "h-24 w-24 rounded-full border-4 border-[var(--app-panel-muted)] object-cover shadow-[var(--shadow-soft)]",
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex h-24 w-24 items-center justify-center rounded-full border-4 border-[var(--app-panel-muted)] bg-[var(--accent-soft)] text-3xl font-semibold text-[var(--accent)]",
        className
      )}
    >
      {fallback}
    </div>
  );
}