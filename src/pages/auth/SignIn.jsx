import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, ShieldAlert } from "lucide-react";
import SocialAuth from "../../components/auth/SocialAuth";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useAuth } from "../../context/AuthContext";

const rememberedEmailKey = "edash-remembered-email";
const loginAttemptsKey = "edash-login-attempts";
const maxAttempts = 5;
const lockoutMinutes = 5;

export default function SignIn() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const rememberedEmail = window.localStorage.getItem(rememberedEmailKey);
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const lockout = useMemo(() => {
    const raw = window.localStorage.getItem(loginAttemptsKey);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw);
      if (!parsed.lockedUntil) return null;
      if (Date.now() >= parsed.lockedUntil) {
        window.localStorage.removeItem(loginAttemptsKey);
        return null;
      }
      return parsed;
    } catch {
      window.localStorage.removeItem(loginAttemptsKey);
      return null;
    }
  }, [message, isSubmitting]);

  const handleSignIn = async (event) => {
    event.preventDefault();

    if (lockout) {
      setMessage(
        `Too many failed attempts. Try again after ${new Date(lockout.lockedUntil).toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        })}.`,
      );
      return;
    }

    if (!email.trim() || !password) {
      setMessage("Enter your email and password.");
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email.trim(), password, rememberMe);
      if (rememberMe) {
        window.localStorage.setItem(rememberedEmailKey, email.trim());
      } else {
        window.localStorage.removeItem(rememberedEmailKey);
      }
      window.localStorage.removeItem(loginAttemptsKey);
      setMessage("");
    } catch (error) {
      console.error(error);
      setMessage("Invalid email or password.");
      registerFailedAttempt();
    } finally {
      setIsSubmitting(false);
    }
  };

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

      <form onSubmit={handleSignIn} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
            Email Address
          </label>
          <Input
            type="email"
            placeholder="name@school.edu"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
            Password
          </label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
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
            onChange={(event) => setRememberMe(event.target.checked)}
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

      {message ? (
        <p className="mt-4 text-sm text-[var(--text-secondary)]">{message}</p>
      ) : null}
    </AuthShell>
  );
}

function registerFailedAttempt() {
  const raw = window.localStorage.getItem(loginAttemptsKey);
  let attempts = 0;

  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      attempts = parsed.attempts ?? 0;
    } catch {
      attempts = 0;
    }
  }

  const nextAttempts = attempts + 1;
  const payload =
    nextAttempts >= maxAttempts
      ? {
          attempts: nextAttempts,
          lockedUntil: Date.now() + lockoutMinutes * 60 * 1000,
        }
      : {
          attempts: nextAttempts,
          lockedUntil: null,
        };

  window.localStorage.setItem(loginAttemptsKey, JSON.stringify(payload));
}

function AuthShell({ eyebrow, title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen bg-[image:var(--landing-gradient)] px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center">
        <div className="grid w-full gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--text-secondary)]">
              {eyebrow}
            </p>
            <h1 className="mt-4 font-serif text-6xl font-semibold leading-[0.96] text-[var(--text-primary)]">
              {title}
            </h1>
            <p className="mt-5 max-w-md text-xl leading-relaxed text-[var(--text-secondary)]">
              {subtitle}
            </p>
          </section>

          <section className="rounded-[30px] border border-[var(--app-border)] bg-[var(--app-panel)] p-8 shadow-[var(--shadow-card)]">
            {children}
            <div className="mt-8">{footer}</div>
          </section>
        </div>
      </div>
    </div>
  );
}
