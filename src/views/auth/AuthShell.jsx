import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
  showBackLink = true,
}) {
  return (
    <div className="min-h-screen bg-[image:var(--landing-gradient)] px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center">
        <div className="grid w-full gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="flex flex-col justify-center">
            {showBackLink ? (
              <Link
                to="/"
                className="mb-8 flex w-fit items-center gap-2 rounded-full border border-[var(--app-border-strong)] bg-[var(--app-panel)] px-4 py-2 text-base font-semibold text-[var(--accent-strong)] shadow-[var(--shadow-soft)] transition hover:translate-x-[-2px] hover:bg-[var(--accent-soft)] hover:text-[var(--text-primary)]"
              >
                <ArrowLeft size={18} />
                <span>Back to Home</span>
              </Link>
            ) : null}
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--text-secondary)]">
              {eyebrow}
            </p>
            <h1 className="mt-4 font-serif text-6xl font-semibold leading-[0.96] text-[var(--text-primary)]">
              {title}
            </h1>
            <p className="mt-5 max-w-md text-xl leading-relaxed text-[var(--text-secondary)]">
              {subtitle}
            </p>
          </section>

          <section className="rounded-[30px] border border-[var(--app-border)] bg-[var(--app-panel)] p-8 shadow-[var(--shadow-card)]">
            {children}
            {footer ? <div className="mt-8">{footer}</div> : null}
          </section>
        </div>
      </div>
    </div>
  );
}
