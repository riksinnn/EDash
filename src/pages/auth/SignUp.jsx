import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import SocialAuth from "../../components/auth/SocialAuth";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

const passwordRequirements = {
  minLength: { label: "At least 8 characters", regex: /.{8,}/ },
  hasUppercase: { label: "One uppercase letter (A-Z)", regex: /[A-Z]/ },
  hasLowercase: { label: "One lowercase letter (a-z)", regex: /[a-z]/ },
  hasNumber: { label: "One number (0-9)", regex: /\d/ },
};

export default function SignUp() {
  const { signup } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const passwordStrength = useMemo(() => {
    const checks = {
      minLength: passwordRequirements.minLength.regex.test(password),
      hasUppercase: passwordRequirements.hasUppercase.regex.test(password),
      hasLowercase: passwordRequirements.hasLowercase.regex.test(password),
      hasNumber: passwordRequirements.hasNumber.regex.test(password),
    };

    const passedCount = Object.values(checks).filter(Boolean).length;
    return { checks, passedCount, isValid: passedCount === 4 };
  }, [password]);

  const handleSignUp = async (event) => {
    event.preventDefault();

    if (!fullName.trim() || !email.trim() || !password) {
      setMessage("Enter your name, email, and create a password.");
      return;
    }

    if (!passwordStrength.isValid) {
      setMessage("Your password doesn't meet all requirements.");
      return;
    }

    try {
      await signup(email.trim(), password, fullName.trim());
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      setMessage("We couldn’t create that account yet.");
    }
  };

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

      <form onSubmit={handleSignUp} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="mb-2 block text-sm font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
            Full Name
          </label>
          <Input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="Your full name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
            Email Address
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="name@school.edu"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Create a secure password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          {/* Password Strength Indicator */}
          {password && (
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
                {Object.entries(passwordRequirements).map(([key, { label }]) => (
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
          )}
        </div>

        <Button type="submit" className="w-full" disabled={password && !passwordStrength.isValid}>
          Get Started
        </Button>
      </form>

      {message ? <p className="mt-4 text-sm text-[var(--text-secondary)]">{message}</p> : null}
    </AuthShell>
  );
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
