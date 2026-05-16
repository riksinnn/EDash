import { ChevronRight, Moon, Bell, Shield, Info, BookOpenCheck, LogOut, BarChart3 } from "lucide-react";
import { useMemo } from "react";
import { Avatar } from "../../components/ui/avatar";
import { Card } from "../../components/ui/card";

export default function SettingsView({
  user,
  isDarkMode,
  onToggleTheme,
  onReports,
  onSecurity,
  onAbout,
  onLogout,
}) {
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
    <div className="space-y-5 sm:space-y-6">
      <Card className="overflow-hidden">
        <div className="h-24 bg-[radial-gradient(circle_at_top,_rgba(165,175,155,0.26),_transparent_55%),linear-gradient(180deg,_var(--app-panel-soft)_0%,_var(--app-panel)_100%)] sm:h-28" />
        <div className="relative px-5 pb-5 sm:px-7 sm:pb-7">
          <div className="-mt-14 flex flex-col gap-5 sm:flex-row sm:items-end">
            <Avatar
              src={user?.photoURL}
              alt={user?.displayName || "User"}
              fallback={initials}
            />
            <div className="pb-1">
              <h2 className="font-serif text-3xl font-semibold text-[var(--text-primary)] sm:text-4xl">
                {user?.displayName || "Student Planner"}
              </h2>
              <p className="mt-1 break-words text-base text-[var(--text-secondary)] sm:text-xl">
                {user?.email || "planner@edash.app"}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <SectionTitle>App Preferences</SectionTitle>
      <SettingsGroup>
        <SettingsRow
          icon={<Moon size={20} />}
          title="Dark Mode"
          description="Toggle dark mode"
          trailing={
            <button
              type="button"
              onClick={onToggleTheme}
              className={`cursor-pointer relative h-8 w-14 rounded-full transition-colors ${
                isDarkMode ? "bg-[var(--accent-strong)]" : "bg-[var(--app-border)]"
              }`}
              aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
              aria-pressed={isDarkMode}
            >
              <span
                className={`absolute left-1 top-1 h-6 w-6 rounded-full bg-[#f7f4ee] shadow-[0_2px_6px_rgba(0,0,0,0.18)] transition-transform ${
                  isDarkMode ? "translate-x-6" : "translate-x-0"
                }`}//andito yung button oh
              />
            </button>
          }
        />
        <SettingsRow
          icon={<BarChart3 size={20} />}
          title="Reports"
          description="View and manage your reports"
          onClick={onReports}
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
          onClick={onSecurity}
        />
        <SettingsRow
          icon={<Info size={20} />}
          title="About"
          description="Terms & Conditions"
          onClick={onAbout}
        />
        <SettingsRow
          icon={<LogOut size={20} />}
          title="Log Out"
          description="End your current session"
          onClick={onLogout}
        />
      </SettingsGroup>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h3 className="px-2 text-sm font-semibold uppercase tracking-[0.1em] text-[var(--text-secondary)] sm:text-xl">
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
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--app-panel-soft)] text-[var(--text-secondary)] sm:h-11 sm:w-11">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-lg font-medium text-[var(--text-primary)] sm:text-2xl">{title}</p>
        <p className="text-sm text-[var(--text-muted)] sm:text-lg">{description}</p>
      </div>
      {trailing || <ChevronRight size={22} className="text-[var(--text-muted)]" />}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="cursor-pointer flex w-full items-center gap-3 border-b border-[var(--app-border)] px-4 py-4 text-left transition-colors hover:bg-[var(--accent-soft)] last:border-b-0 sm:gap-4 sm:px-5 sm:py-5"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 border-b border-[var(--app-border)] px-4 py-4 last:border-b-0 sm:gap-4 sm:px-5 sm:py-5">
      {content}
    </div>
  );
}
