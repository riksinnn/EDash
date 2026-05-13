import { Link } from "react-router-dom";
import { Eye, EyeOff, ShieldAlert } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import SocialAuth from "../../components/auth/SocialAuth";
import AuthShell from "./AuthShell";

export default function SignInView({
  email,
  password,
  rememberMe,
  showPassword,
  message,
  isSubmitting,
  lockout,
  onEmailChange,
  onPasswordChange,
  onRememberMeChange,
  onTogglePassword,
  onSubmit,
}) {
  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Pick up where you left off."
      subtitle="Use Google or sign in with your email and password."
      footer={
        <p className="text-sm text-[var(--text-secondary)]">
          Don&apos;t have an account yet?{" "}
          <Link to="/signup" className="font-semibold text-[var(--accent)]">
            Sign up
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
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-sm font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]"
            >
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-[var(--accent)] hover:underline"
            >
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              className="pr-12"
            />
            <button
              type="button"
              onClick={onTogglePassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <label className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(event) => onRememberMeChange(event.target.checked)}
            className="h-4 w-4 rounded border-[var(--app-border)]"
          />
          <span>Remember me on this device</span>
        </label>

        {lockout ? (
          <div className="flex items-start gap-3 rounded-2xl border border-red-300/60 bg-red-50 px-4 py-3 text-sm text-red-700">
            <ShieldAlert size={18} className="mt-0.5 shrink-0" />
            <p>
              Too many failed attempts. Try again after{" "}
              {new Date(lockout.lockedUntil).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })}
              .
            </p>
          </div>
        ) : null}

        <div className="text-right">
          <span className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
            Press Enter to sign in
          </span>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting || Boolean(lockout)}>
          {isSubmitting ? "Signing In..." : "Log In"}
        </Button>
      </form>

      {message ? <p className="mt-4 text-sm text-[var(--text-secondary)]">{message}</p> : null}
    </AuthShell>
  );
}
