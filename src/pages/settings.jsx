import { ChevronRight, Moon, Bell, Shield, Info, BookOpenCheck, LogOut } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Avatar } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function Settings() {
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const initials = useMemo(() => {
    const source = user?.displayName || user?.email || "Edash";
    return source
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user]);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="h-28 bg-[radial-gradient(circle_at_top,_rgba(165,175,155,0.26),_transparent_55%),linear-gradient(180deg,_var(--app-panel-soft)_0%,_var(--app-panel)_100%)]" />
        <div className="relative px-7 pb-7">
          <div className="-mt-14 flex flex-col gap-5 sm:flex-row sm:items-end">
            <Avatar
              src={user?.photoURL}
              alt={user?.displayName || "User"}
              fallback={initials}
            />
            <div className="pb-1">
              <h2 className="font-serif text-4xl font-semibold text-[var(--text-primary)]">
                {user?.displayName || "Student Planner"}
              </h2>
              <p className="mt-1 text-xl text-[var(--text-secondary)]">
                {user?.email || "planner@edash.app"}
              </p>
            </div>
          </div>
          <div className="mt-5">
          </div>
        </div>
      </Card>

      <SectionTitle>App Preferences</SectionTitle>
      <SettingsGroup>
        <SettingsRow
          icon={<Moon size={20} />}
          title="Dark Mode"
          description="Toggle dark appearance"
          trailing={
            <button
              type="button"
              onClick={toggleTheme}
              className={cn(
                "relative h-8 w-14 rounded-full transition-colors",
                isDarkMode ? "bg-[var(--accent-strong)]" : "bg-[var(--app-border)]"
              )}
              aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
              aria-pressed={isDarkMode}
            >
              <span
                className={cn(
                  "absolute top-1 h-6 w-6 rounded-full bg-[var(--app-panel)] transition-transform",
                  isDarkMode ? "translate-x-7" : "translate-x-1"
                )}
              />
            </button>
          }
        />
        <SettingsRow
          icon={<BookOpenCheck size={20} />}
          title="Manage Subjects"
          description="Add, edit or remove classes"
          onClick={() => navigate("/subjects")}
        />
        <SettingsRow
          icon={<Bell size={20} />}
          title="Notifications"
          description="Class reminders (Coming soon)"
        />
      </SettingsGroup>

      <SectionTitle>Account</SectionTitle>
      <SettingsGroup>
        <SettingsRow
          icon={<Shield size={20} />}
          title="Security"
          description="Password & authentication"
          onClick={() => navigate("/security")}
        />
        <SettingsRow
          icon={<Info size={20} />}
          title="About"
          description="Terms & Conditions"
          onClick={() => navigate("/about")}
        />
        <SettingsRow
          icon={<LogOut size={20} />}
          title="Log Out"
          description="End your current session"
          onClick={() => navigate("/logout")}
        />
      </SettingsGroup>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h3 className="px-2 text-xl font-semibold uppercase tracking-[0.1em] text-[var(--text-secondary)]">
      {children}
    </h3>
  );
}

function SettingsGroup({ children }) {
  return <Card className="overflow-hidden p-0">{children}</Card>;
}

function SettingsRow({ icon, title, description, trailing, onClick }) {
  const content = (
    <>
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--app-panel-soft)] text-[var(--text-secondary)]">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-2xl font-medium text-[var(--text-primary)]">{title}</p>
        <p className="text-lg text-[var(--text-muted)]">{description}</p>
      </div>
      {trailing || <ChevronRight size={22} className="text-[var(--text-muted)]" />}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-4 border-b border-[var(--app-border)] px-5 py-5 text-left transition-colors hover:bg-[var(--accent-soft)] last:border-b-0"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-4 border-b border-[var(--app-border)] px-5 py-5 last:border-b-0">
      {content}
    </div>
  );
}