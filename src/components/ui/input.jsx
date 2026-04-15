import { forwardRef } from "react";

export const Input = forwardRef(function Input(
  { className = "", ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={[
        "w-full rounded-2xl border border-[var(--app-border)] bg-[var(--app-panel)] px-4 py-3 text-lg text-[var(--text-primary)] shadow-[var(--shadow-soft)] outline-none transition focus:border-[var(--accent-strong)] focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--accent-strong)_20%,transparent)]",
        className,
      ].join(" ")}
      {...props}
    />
  );
});
