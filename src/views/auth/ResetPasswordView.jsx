import { Eye, EyeOff } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import AuthShell from "./AuthShell";

export default function ResetPasswordView({
  password,
  confirmPassword,
  showPassword,
  showConfirm,
  message,
  isSubmitting,
  isSuccess,
  isValidToken,
  onPasswordChange,
  onConfirmPasswordChange,
  onTogglePassword,
  onToggleConfirm,
  onSubmit,
  onRequestNewLink,
}) {
  if (!isValidToken) {
    return (
      <AuthShell
        eyebrow="Reset Password"
        title="Link expired or invalid"
        subtitle="Your password reset link has expired. Please request a new one."
        footer={null}
        showBackLink={false}
      >
        <Button onClick={onRequestNewLink} className="w-full">
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
      showBackLink={false}
    >
      <form onSubmit={onSubmit} className="space-y-4">
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
              placeholder="Enter new password"
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              disabled={isSuccess}
            />
            <button
              type="button"
              onClick={onTogglePassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 transform text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(event) => onConfirmPasswordChange(event.target.value)}
              disabled={isSuccess}
            />
            <button
              type="button"
              onClick={onToggleConfirm}
              className="absolute right-3 top-1/2 -translate-y-1/2 transform text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isSuccess || isSubmitting}>
          {isSubmitting ? "Resetting..." : "Reset Password"}
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
