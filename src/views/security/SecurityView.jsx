import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";

export default function SecurityView({
  password,
  confirmPassword,
  error,
  message,
  loading,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
  onCancel,
}) {
  return (
    <div className="space-y-5 sm:space-y-6">
      <h2 className="font-serif text-4xl font-semibold text-[#283728] sm:text-5xl">Security</h2>
      <Card className="border-dashed border-[#e3dbcc] bg-[#f7f4ee]/70 p-4 shadow-none sm:p-7">
        <div className="mx-auto max-w-md space-y-5 sm:space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-[#354737] sm:text-2xl">Change Password</h3>
            <p className="mt-1 text-base text-[#6e7c69] sm:text-lg">
              Enter a new password for your account.
            </p>
          </div>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              disabled={loading}
            />
            <Input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(event) => onConfirmPasswordChange(event.target.value)}
              disabled={loading}
            />
          </div>
          {error ? <p className="text-red-500">{error}</p> : null}
          {message ? <p className="text-green-600">{message}</p> : null}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:space-x-4">
            <Button variant="outline" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={onSubmit} disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
