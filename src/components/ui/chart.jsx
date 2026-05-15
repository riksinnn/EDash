export function SimpleBarChart({ data, valueSuffix = "", emptyLabel = "No data yet." }) {
  const maxValue = Math.max(...data.map((item) => item.value), 0);

  if (data.length === 0 || maxValue === 0) {
    return (
      <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-[var(--app-border)] text-center text-lg text-[var(--text-secondary)]">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="flex min-h-[240px] items-end gap-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-panel-soft)] p-4">
      {data.map((item) => {
        const height = Math.max(12, (item.value / maxValue) * 100);

        return (
          <div key={item.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <div className="flex h-40 w-full items-end">
              <div
                className="w-full rounded-t-xl bg-[var(--accent-strong)] transition-all"
                style={{ height: `${height}%` }}
                title={`${item.label}: ${item.value}${valueSuffix}`}
              />
            </div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {item.value}
              {valueSuffix}
            </p>
            <p className="w-full truncate text-center text-xs text-[var(--text-muted)]">
              {item.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
