import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import ResetPasswordView from "../../views/auth/ResetPasswordView";

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

      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setIsSuccess(true);
      setMessage("Password reset successfully! Redirecting to sign in...");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Unable to reset password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ResetPasswordView
      password={password}
      confirmPassword={confirmPassword}
      showPassword={showPassword}
      showConfirm={showConfirm}
      message={message}
      isSubmitting={isSubmitting}
      isSuccess={isSuccess}
      isValidToken={isValidToken}
      onPasswordChange={setPassword}
      onConfirmPasswordChange={setConfirmPassword}
      onTogglePassword={() => setShowPassword((current) => !current)}
      onToggleConfirm={() => setShowConfirm((current) => !current)}
      onSubmit={handleResetPassword}
      onRequestNewLink={() => navigate("/forgot-password")}
    />
  );
}
