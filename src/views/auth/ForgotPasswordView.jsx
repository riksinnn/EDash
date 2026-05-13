import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import AuthShell from "./AuthShell";

export default function ForgotPasswordView({
  email,
  message,
  isSubmitting,
  isSuccess,
  onEmailChange,
  onSubmit,
}) {
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
            isSuccess ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"
          }`}
        >
          {message}
        </p>
      ) : null}
    </AuthShell>
  );
}
