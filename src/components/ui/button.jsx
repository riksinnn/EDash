export function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-2xl px-5 py-3 text-base font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#89a171]/40 disabled:cursor-not-allowed disabled:opacity-60";

  const variants = {
    primary:
      "bg-[var(--accent-strong)] text-[var(--app-panel)] shadow-[var(--shadow-soft)] hover:brightness-95",
    outline:
      "border border-[var(--app-border)] bg-[var(--app-panel-muted)] text-[var(--text-primary)] shadow-[var(--shadow-soft)] hover:bg-[var(--app-panel-soft)]",
    ghost: "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--accent-soft)]",
    pill: "border border-[var(--app-border)] bg-[var(--app-panel)] text-[var(--text-primary)] hover:bg-[var(--app-panel-soft)]",
    icon: "h-12 w-12 rounded-full bg-[var(--text-primary)] px-0 py-0 text-[var(--app-panel)] hover:opacity-90",
  };

  return (
    <button
      type={type}
      className={[baseStyles, variants[variant], className].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
