export function Card({ className = "", children }) {
  return (
    <section
      className={[
        "rounded-[28px] border border-[var(--app-border)] bg-[var(--app-panel)] shadow-[var(--shadow-soft)]",
        className,
      ].join(" ")}
    >
      {children}
    </section>
  );
}

export function CardHeader({ className = "", children }) {
  return <div className={["p-6", className].join(" ")}>{children}</div>;
}

export function CardContent({ className = "", children }) {
  return <div className={["p-6 pt-0", className].join(" ")}>{children}</div>;
}

export function CardTitle({ className = "", children }) {
  return (
    <h2 className={["font-serif text-3xl font-semibold text-[var(--text-primary)]", className].join(" ")}>
      {children}
    </h2>
  );
}

export function CardDescription({ className = "", children }) {
  return <p className={["text-[var(--text-secondary)]", className].join(" ")}>{children}</p>;
}
