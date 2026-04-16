import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has a valid recovery session
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session && session.user?.recovery_sent_at) {
        setIsValidToken(true);
      } else {
        setMessage("Invalid or expired password reset link.");
        setIsValidToken(false);
      }
    };

    checkSession();
  }, []);

  const handleResetPassword = async (event) => {
    event.preventDefault();

    if (!password || !confirmPassword) {
      setMessage("Enter and confirm your new password.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords don't match.");
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage("");

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setIsSuccess(true);
      setMessage("Password reset successfully! Redirecting to sign in...");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error(error);
      setMessage(
        error.message || "Unable to reset password. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isValidToken) {
    return (
      <AuthShell
        eyebrow="Reset Password"
        title="Link expired or invalid"
        subtitle="Your password reset link has expired. Please request a new one."
        footer={null}
      >
        <Button
          onClick={() => navigate("/forgot-password")}
          className="w-full"
        >
          Request New Link
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Reset Password"
      title="Create a new password"
      subtitle="Enter a strong password to secure your account."
      footer={null}
    >
      <form onSubmit={handleResetPassword} className="space-y-4">
        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]"
          >
            New Password
          </label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isSuccess}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transform text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="confirm-password"
            className="mb-2 block text-sm font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]"
          >
            Confirm Password
          </label>
          <div className="relative">
            <Input
              id="confirm-password"
              name="confirm-password"
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              disabled={isSuccess}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transform text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            >
              {showConfirm ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isSuccess || isSubmitting}
        >
          {isSubmitting ? "Resetting..." : "Reset Password"}
        </Button>
      </form>

      {message ? (
        <p
          className={`mt-4 text-sm ${
            isSuccess
              ? "text-[var(--accent)]"
              : "text-[var(--text-secondary)]"
          }`}
        >
          {message}
        </p>
      ) : null}
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
            {footer && <div className="mt-8">{footer}</div>}
          </section>
        </div>
      </div>
    </div>
  );
}
