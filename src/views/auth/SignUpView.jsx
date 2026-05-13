import { Link } from "react-router-dom";
import { Check, X } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import SocialAuth from "../../components/auth/SocialAuth";
import AuthShell from "./AuthShell";

export default function SignUpView({
  fullName,
  email,
  password,
  message,
  passwordStrength,
  onFullNameChange,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}) {
  return (
    <AuthShell
      eyebrow="Join the Planner"
      title="Create your account."
      subtitle="Start building your schedule, class tracker, and task flow in one calm workspace."
      footer={
        <p className="text-sm text-[var(--text-secondary)]">
          Already a member?{" "}
          <Link to="/login" className="font-semibold text-[var(--accent)]">
            Log in
          </Link>
        </p>
      }
    >
      <SocialAuth />

      <div className="relative my-6 text-center">
        <div className="border-t border-[var(--app-border)]" />
        <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-[var(--app-panel)] px-4 text-sm uppercase tracking-[0.16em] text-[var(--text-muted)]">
          Or
        </span>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="fullName"
            className="mb-2 block text-sm font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]"
          >
            Full Name
          </label>
          <Input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="Your full name"
            value={fullName}
            onChange={(event) => onFullNameChange(event.target.value)}
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]"
          >
            Email Address
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="name@school.edu"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]"
          >
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Create a secure password"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
          />

          {password ? (
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 rounded-full bg-[var(--app-border)]">
                  <div
                    className={`h-full rounded-full transition-all ${
                      passwordStrength.passedCount === 0
                        ? "bg-red-500 w-1/4"
                        : passwordStrength.passedCount === 1
                          ? "bg-red-500 w-1/4"
                          : passwordStrength.passedCount === 2
                            ? "bg-yellow-500 w-1/2"
                            : passwordStrength.passedCount === 3
                              ? "bg-blue-500 w-3/4"
                              : "bg-green-500 w-full"
                    }`}
                  />
                </div>
                <span className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--text-secondary)]">
                  {passwordStrength.passedCount}/4
                </span>
              </div>

              <div className="space-y-1">
                {Object.entries(passwordStrength.requirements).map(([key, { label }]) => (
                  <div
                    key={key}
                    className="flex items-center gap-2 text-xs text-[var(--text-secondary)]"
                  >
                    {passwordStrength.checks[key] ? (
                      <Check size={16} className="text-green-600" />
                    ) : (
                      <X size={16} className="text-red-500" />
                    )}
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <Button type="submit" className="w-full" disabled={password && !passwordStrength.isValid}>
          Get Started
        </Button>
      </form>

      {message ? <p className="mt-4 text-sm text-[var(--text-secondary)]">{message}</p> : null}
    </AuthShell>
  );
}
