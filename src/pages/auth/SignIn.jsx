import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import SignInView from "../../views/auth/SignInView";

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
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    const rememberedEmail = window.localStorage.getItem(rememberedEmailKey);
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTick((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const lockout = useMemo(() => {
    void refreshTick;
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
  }, [refreshTick]);

  const handleSignIn = async (event) => {
    event.preventDefault();

    if (lockout) {
      setMessage(
        `Too many failed attempts. Try again after ${new Date(lockout.lockedUntil).toLocaleTimeString(
          [],
          { hour: "numeric", minute: "2-digit" }
        )}.`
      );
      return;
    }

    if (!email.trim() || !password) {
      setMessage("Enter your email and password.");
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email.trim(), password);

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
    <SignInView
      email={email}
      password={password}
      rememberMe={rememberMe}
      showPassword={showPassword}
      message={message}
      isSubmitting={isSubmitting}
      lockout={lockout}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onRememberMeChange={setRememberMe}
      onTogglePassword={() => setShowPassword((current) => !current)}
      onSubmit={handleSignIn}
    />
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
