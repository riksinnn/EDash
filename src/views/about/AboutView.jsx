import { Card } from "../../components/ui/card";

export default function AboutView({ terms }) {
  return (
    <div className="space-y-5 sm:space-y-6">
      <h2 className="font-serif text-4xl font-semibold text-[var(--text-primary)] sm:text-5xl">
        About & Terms
      </h2>
      <Card className="border-dashed border-[var(--app-border)] bg-[color:color-mix(in_srgb,var(--app-panel)_92%,transparent)] p-4 shadow-none sm:p-7">
        <div className="space-y-5 sm:space-y-6">
          {terms.map((term) => (
            <div key={term.title}>
              <h3 className="text-xl font-semibold text-[var(--text-secondary)] sm:text-2xl">
                {term.title}
              </h3>
              <p className="mt-2 text-base leading-relaxed text-[var(--text-muted)] sm:text-lg">{term.content}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
