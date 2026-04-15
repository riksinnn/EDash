export function Avatar({ src, alt = "", fallback = "E", className = "" }) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={[
          "h-24 w-24 rounded-full border-4 border-[var(--app-panel-muted)] object-cover shadow-[var(--shadow-soft)]",
          className,
        ].join(" ")}
      />
    );
  }

  return (
    <div
      className={[
        "flex h-24 w-24 items-center justify-center rounded-full border-4 border-[var(--app-panel-muted)] bg-[var(--accent-soft)] text-3xl font-semibold text-[var(--accent)]",
        className,
      ].join(" ")}
    >
      {fallback}
    </div>
  );
}
