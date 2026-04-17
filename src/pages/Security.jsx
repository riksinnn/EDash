import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { supabase } from "../lib/supabase";

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
      password: password,
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
    <div className="space-y-6">
      <h2 className="font-serif text-5xl font-semibold text-[#283728]">
        Security
      </h2>
      <Card className="border-dashed border-[#e3dbcc] bg-[#f7f4ee]/70 p-7 shadow-none">
        <div className="mx-auto max-w-md space-y-6">
          <div>
            <h3 className="text-2xl font-semibold text-[#354737]">
              Change Password
            </h3>
            <p className="mt-1 text-lg text-[#6e7c69]">
              Enter a new password for your account.
            </p>
          </div>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <Input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          {message && <p className="text-green-600">{message}</p>}
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate("/settings")}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handlePasswordUpdate} disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}