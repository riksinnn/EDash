import { useEffect, useState } from "react";
import { ChevronRight, Circle, ClipboardCheck, Clock3 } from "lucide-react";
import { format } from "date-fns";
import { Card } from "../components/ui/card";

const stats = [
  { value: "0", label: "Classes Today", color: "text-[var(--accent-strong)]" },
  { value: "0", label: "Urgent Tasks", color: "text-[#cf4c4a]" },
  { value: "0", label: "Ongoing Tasks", color: "text-[var(--text-primary)]" },
];

function StatCard({ value, label, color }) {
  return (
    <Card className="p-6 text-center">
      <p className={["text-5xl font-semibold", color].join(" ")}>{value}</p>
      <p className="mt-3 text-xl uppercase tracking-[0.12em] text-[var(--text-secondary)]">
        {label}
      </p>
    </Card>
  );
}

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="space-y-7">
      <section className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
        <div>
          <h2 className="font-serif text-5xl font-semibold tracking-tight text-[var(--text-primary)]">
            {format(currentTime, "EEEE, MMMM d")}
          </h2>
          <p className="mt-2 text-2xl text-[var(--text-secondary)]">
            Here is what&apos;s happening today.
          </p>
        </div>

        <Card className="inline-flex items-center gap-3 rounded-[24px] px-5 py-4">
          <Clock3 size={24} className="text-[var(--accent)]" />
          <span className="text-4xl font-medium text-[var(--text-primary)]">
            {format(currentTime, "h:mm a")}
          </span>
        </Card>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <Card className="bg-[radial-gradient(circle_at_top,_rgba(182,191,160,0.16),_transparent_62%),linear-gradient(180deg,_var(--app-panel-soft)_0%,_var(--app-panel)_100%)] p-7">
          <div className="flex items-center gap-3 text-xl font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
            <Circle size={10} fill="currentColor" />
            <span>Happening Now</span>
          </div>
          <div className="flex min-h-[170px] flex-col items-center justify-center text-center">
            <p className="text-4xl font-semibold text-[var(--text-primary)]">No class right now</p>
            <p className="mt-3 text-2xl text-[var(--text-secondary)]">Enjoy your free time!</p>
          </div>
        </Card>

        <Card className="p-7">
          <h3 className="text-xl font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
            Up Next
          </h3>
          <div className="flex min-h-[170px] items-center justify-center text-center">
            <p className="text-3xl text-[var(--text-secondary)]">No more classes today.</p>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="space-y-4 pt-3">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-serif text-4xl font-semibold text-[var(--text-primary)]">
            Priority Tasks
          </h3>
          <button className="inline-flex items-center gap-2 text-2xl font-medium text-[var(--accent-strong)] transition-opacity hover:opacity-75">
            <span>View all</span>
            <ChevronRight size={20} />
          </button>
        </div>

        <Card className="flex min-h-[190px] flex-col items-center justify-center border-dashed border-[var(--app-border)] p-6 text-center shadow-none">
          <ClipboardCheck size={46} className="text-[var(--text-muted)]" />
          <p className="mt-4 text-2xl text-[var(--text-secondary)]">All caught up for today!</p>
        </Card>
      </section>
    </div>
  );
}
