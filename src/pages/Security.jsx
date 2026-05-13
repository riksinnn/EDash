import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import SecurityView from "../views/security/SecurityView";

export default function Security() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePasswordUpdate = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (updateError) {
      setError("Failed to update password. Please try again.");
      console.error("Password update error:", updateError);
    } else {
      setMessage("Your password has been updated successfully.");
      setPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <SecurityView
      password={password}
      confirmPassword={confirmPassword}
      error={error}
      message={message}
      loading={loading}
      onPasswordChange={setPassword}
      onConfirmPasswordChange={setConfirmPassword}
      onSubmit={handlePasswordUpdate}
      onCancel={() => navigate("/settings")}
    />
  );
}
