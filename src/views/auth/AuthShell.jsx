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
    <div className="min-h-screen overflow-x-hidden bg-[image:var(--landing-gradient)] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl items-center sm:min-h-[calc(100vh-5rem)]">
        <div className="grid w-full gap-7 sm:gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="flex flex-col justify-center">
            {showBackLink ? (
              <Link
                to="/"
                className="mb-6 flex w-fit items-center gap-2 rounded-full border border-[var(--app-border-strong)] bg-[var(--app-panel)] px-4 py-2 text-sm font-semibold text-[var(--accent-strong)] shadow-[var(--shadow-soft)] transition hover:translate-x-[-2px] hover:bg-[var(--accent-soft)] hover:text-[var(--text-primary)] sm:mb-8 sm:text-base"
              >
                <ArrowLeft size={18} />
                <span>Back to Home</span>
              </Link>
            ) : null}
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-secondary)] sm:text-sm sm:tracking-[0.24em]">
              {eyebrow}
            </p>
            <h1 className="mt-3 font-serif text-4xl font-semibold leading-[0.96] text-[var(--text-primary)] sm:mt-4 sm:text-6xl">
              {title}
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-[var(--text-secondary)] sm:mt-5 sm:text-xl">
              {subtitle}
            </p>
          </section>

          <section className="rounded-[24px] border border-[var(--app-border)] bg-[var(--app-panel)] p-5 shadow-[var(--shadow-card)] sm:rounded-[30px] sm:p-8">
            {children}
            {footer ? <div className="mt-8">{footer}</div> : null}
          </section>
        </div>
      </div>
    </div>
  );
}
