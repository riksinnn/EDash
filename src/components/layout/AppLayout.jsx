import { NavLink, useLocation } from "react-router-dom";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  BarChart3,
  CalendarDays,
  CheckSquare,
  House,
  Settings,
  BookOpen,
} from "lucide-react";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { label: "Home", path: "/dashboard", icon: House },
  { label: "Schedule", path: "/schedule", icon: CalendarDays },
  { label: "Tasks", path: "/tasks", icon: CheckSquare },
  {label: "Subjects", path: "/subjects", icon: BookOpen },
  { label: "Settings", path: "/settings", icon: Settings },
];

const pageTitles = {
  "/dashboard": "Dashboard",
  "/schedule": "Schedule",
  "/tasks": "Tasks",
  "/subjects": "Subjects",
  "/reports": "Reports",
  "/settings": "Settings",
};

function AppNavItem({ item }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        cn(
          "flex min-w-0 flex-col items-center gap-1 rounded-2xl px-1 py-1.5 text-[10px] font-medium transition-colors sm:gap-2 sm:px-3 sm:py-2 sm:text-xs",
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
          <span className="truncate">{item.label}</span>
        </>
      )}
    </NavLink>
  );
}

export default function AppLayout({ children }) {
  const location = useLocation();
  const title = pageTitles[location.pathname] ?? "Edash";

  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--app-bg)] text-[var(--text-primary)]">
      <div
        className="mx-auto min-h-screen max-w-[1440px] bg-[image:var(--shell-gradient)] sm:border-x"
        style={{ borderColor: "var(--app-border)" }}
      >
       
        <header
          className="border-b px-3 py-4 text-center sm:px-6 sm:py-5"
          style={{ borderColor: "var(--app-border)" }}
        >
          <h1 className="font-serif text-4xl font-semibold tracking-tight text-[var(--accent)] sm:text-5xl">
            {title}
          </h1>
        </header>

        <main className="px-3 pb-24 pt-4 sm:px-6 sm:pb-28 sm:pt-8">
          <div className="mx-auto max-w-4xl">{children}</div>
        </main>

        <nav
          className="fixed inset-x-0 bottom-0 z-20 border-t backdrop-blur"
          style={{
            borderColor: "var(--app-border-strong)",
            backgroundColor: "var(--nav-bg)",
          }}
        >
          <div className="mx-auto grid max-w-[1440px] grid-cols-5 gap-1 px-2 py-2.5 sm:gap-2 sm:px-6 sm:py-4">
            {navItems.map((item) => (
              <AppNavItem key={item.label} item={item} />
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
