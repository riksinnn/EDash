import { Card } from "../../components/ui/card";

export default function AboutView({ terms }) {
  return (
    <div className="space-y-6">
      <h2 className="font-serif text-5xl font-semibold text-[var(--accent)]">
        About & Terms
      </h2>
      <Card className="border-dashed border-[var(--app-border)] bg-[color:color-mix(in_srgb,var(--app-panel)_92%,transparent)] p-7 shadow-none">
        <div className="space-y-6">
          {terms.map((term) => (
            <div key={term.title}>
              <h3 className="text-2xl font-semibold text-[var(--text-secondary)]">
                {term.title}
              </h3>
              <p className="mt-2 text-lg text-[var(--text-muted)]">{term.content}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
