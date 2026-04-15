export function Badge({ children, className = "" }) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border border-[var(--app-border)] bg-[var(--app-panel-soft)] px-4 py-1 text-sm font-medium text-[var(--text-primary)]",
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}
