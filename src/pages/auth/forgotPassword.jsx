import { useState } from "react";
import { supabase } from "../../lib/supabase";
import ForgotPasswordView from "../../views/auth/ForgotPasswordView";

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

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setIsSuccess(true);
      setMessage("Password reset link sent! Check your email for instructions.");
      setEmail("");
    } catch (error) {
      console.error(error);
      setIsSuccess(false);
      setMessage(error.message || "Unable to send reset link. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ForgotPasswordView
      email={email}
      message={message}
      isSubmitting={isSubmitting}
      isSuccess={isSuccess}
      onEmailChange={setEmail}
      onSubmit={handleResetPassword}
    />
  );
}
