import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleResetPassword = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      setMessage("Enter your email address.");
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage("");

      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (error) throw error;

      setIsSuccess(true);
      setMessage(
        "Password reset link sent! Check your email for instructions."
      );
      setEmail("");
    } catch (error) {
      console.error(error);
      setIsSuccess(false);
      setMessage(
        error.message ||
        "Unable to send reset link. Please try again later."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Reset Password"
      title="Forgot your password?"
      subtitle="Enter your email address and we'll send you a link to reset your password."
      footer={
        <p className="text-sm text-[var(--text-secondary)]">
          Remember your password?{" "}
          <Link to="/login" className="font-semibold text-[var(--accent)]">
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleResetPassword} className="space-y-4">
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
            onChange={(event) => setEmail(event.target.value)}
            disabled={isSuccess}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSuccess || isSubmitting}>
          {isSubmitting ? "Sending..." : "Send Reset Link"}
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
            <div className="mt-8">{footer}</div>
          </section>
        </div>
      </div>
    </div>
  );
}
