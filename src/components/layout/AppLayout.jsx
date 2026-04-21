import { NavLink, useLocation } from "react-router-dom";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  CalendarDays,
  CheckSquare,
  House,
  Settings,
} from "lucide-react";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { label: "Home", path: "/dashboard", icon: House },
  { label: "Schedule", path: "/schedule", icon: CalendarDays },
  { label: "Tasks", path: "/tasks", icon: CheckSquare },
  { label: "Settings", path: "/settings", icon: Settings },
];

const pageTitles = {
  "/dashboard": "Dashboard",
  "/schedule": "Schedule",
  "/tasks": "Tasks",
  "/subjects": "Subjects",
  "/settings": "Settings",
};

export default function AppLayout({ children }) {
  const location = useLocation();
  const title = pageTitles[location.pathname] ?? "Edash";

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--text-primary)]">
      <div
        className="mx-auto min-h-screen max-w-[1440px] border-x bg-[image:var(--shell-gradient)]"
        style={{ borderColor: "var(--app-border)" }}
      >
        <header
          className="border-b px-4 py-4 sm:px-6"
          style={{ borderColor: "var(--app-border)" }}
        >
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-[var(--accent)] sm:text-3xl">
            {title}
          </h1>
        </header>

        <main className="px-4 pb-28 pt-5 sm:px-6 sm:pt-8">
          <div className="mx-auto max-w-4xl">{children}</div>
        </main>

        <nav
          className="fixed inset-x-0 bottom-0 z-20 border-t backdrop-blur"
          style={{
            borderColor: "var(--app-border-strong)",
            backgroundColor: "var(--nav-bg)",
          }}
        >
          <div className="mx-auto grid max-w-[1440px] grid-cols-4 gap-2 px-4 py-4 sm:px-6">
            {navItems.map(({ label, path, icon: Icon }) => (
              <NavLink
                key={label}
                to={path}
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center gap-2 rounded-2xl px-3 py-2 text-xs font-medium transition-colors",
                    isActive
                      ? "text-[var(--accent)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        "rounded-2xl p-2 transition-colors",
                        isActive ? "bg-[var(--accent-soft)]" : "bg-transparent"
                      )}
                    >
                      <Icon size={20} strokeWidth={2.1} />
                    </span>
                    <span>{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}