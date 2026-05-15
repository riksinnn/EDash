import { Activity, Download, ListChecks } from "lucide-react";
import { format } from "date-fns";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { SimpleBarChart } from "../../components/ui/chart";

function StatCard({ label, value, tone = "text-[var(--text-primary)]" }) {
  return (
    <Card className="p-5 text-center">
      <p className={`text-3xl font-semibold sm:text-4xl ${tone}`}>{value}</p>
      <p className="mt-2 text-xs uppercase tracking-[0.12em] text-[var(--text-secondary)] sm:text-sm">
        {label}
      </p>
    </Card>
  );
}

export default function ReportsView({
  loading,
  currentWeek,
  weeklyReports,
  activityLogs,
  onExportReportCsv,
  onExportLogsCsv,
}) {
  const chartData = weeklyReports.map((week) => ({
    label: week.label,
    value: week.completionRate,
  }));

  return (
    <div className="space-y-7">
      <section className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div>
          <h2 className="font-serif text-4xl font-semibold text-[var(--text-primary)] sm:text-5xl">
            Weekly Reports
          </h2>
          <p className="mt-2 text-base text-[var(--text-secondary)] sm:text-xl">
            Task progress based on deadline week.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="gap-2" onClick={onExportReportCsv}>
            <Download size={18} />
            Report CSV
          </Button>
          <Button variant="outline" className="gap-2" onClick={onExportLogsCsv}>
            <Download size={18} />
            Logs CSV
          </Button>
        </div>
      </section>

      {loading ? (
        <Card className="flex min-h-[260px] items-center justify-center p-6 text-xl text-[var(--text-secondary)]">
          Loading reports...
        </Card>
      ) : (
        <>
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-4">
            <StatCard label="Total" value={currentWeek.total} />
            <StatCard label="Done" value={currentWeek.done} tone="text-[var(--done-text)]" />
            <StatCard label="Not Done" value={currentWeek.notDone} tone="text-[#cf4c4a]" />
            <StatCard label="Urgent" value={currentWeek.urgent} tone="text-[var(--urgent-text)]" />
            <StatCard label="Rate" value={`${currentWeek.completionRate}%`} tone="text-[var(--accent-strong)]" />
          </section>

          <Card className="p-6">
            <div className="mb-5 flex items-center gap-3">
              <ListChecks size={22} className="text-[var(--accent)]" />
              <div>
                <h3 className="text-xl font-semibold text-[var(--text-primary)] sm:text-2xl">
                  Completion Rate
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Current week and previous weeks
                </p>
              </div>
            </div>
            <SimpleBarChart data={chartData} valueSuffix="%" />
          </Card>

          <Card className="p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Activity size={22} className="text-[var(--accent)]" />
                <div>
                  <h3 className="text-xl font-semibold text-[var(--text-primary)] sm:text-2xl">
                    User Activity Logs
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Recent actions saved by the system
                  </p>
                </div>
              </div>
            </div>

            {activityLogs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--app-border)] p-6 text-center text-lg text-[var(--text-secondary)]">
                No activity logs yet.
              </div>
            ) : (
              <div className="space-y-3">
                {activityLogs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-panel-soft)] px-4 py-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-lg font-semibold text-[var(--text-primary)]">
                        {log.description}
                      </p>
                      <span className="rounded-full bg-[var(--app-panel)] px-3 py-1 text-xs uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                        {log.action}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                      {format(new Date(log.created_at), "MMM d, yyyy h:mm a")} - {log.entity_type}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
