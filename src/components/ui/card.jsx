import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function Card({ className = "", children, style }) {
  return (
    <section
      className={cn(
        "rounded-[28px] border border-[var(--app-border)] bg-[var(--app-panel)] shadow-[var(--shadow-soft)]",
        className
      )}
      style={style}
    >
      {children}
    </section>
  );
}

export function CardHeader({ className = "", children }) {
  return <div className={cn("p-6", className)}>{children}</div>;
}

export function CardContent({ className = "", children }) {
  return <div className={cn("p-6 pt-0", className)}>{children}</div>;
}

export function CardTitle({ className = "", children }) {
  return (
    <h2
      className={cn(
        "font-serif text-3xl font-semibold text-[var(--text-primary)]",
        className
      )}
    >
      {children}
    </h2>
  );
}

export function CardDescription({ className = "", children }) {
  return (
    <p className={cn("text-[var(--text-secondary)]", className)}>{children}</p>
  );
}