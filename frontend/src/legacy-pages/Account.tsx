import { FormEvent, useState } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import AppNavbar from "@/components/AppNavbar";
import DashboardBreadcrumbs from "@/components/dashboard/DashboardBreadcrumbs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/sonner";
import { changeMyPassword } from "@/api/userRequests";
import { useAuth } from "@/hooks/useAuth";

const Account = () => {
  const { username } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const changePasswordMutation = useMutation({
    mutationFn: changeMyPassword,
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully.");
    },
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (currentPassword.length < 6 || newPassword.length < 6) {
      setErrorMessage("Passwords must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("New password and confirmation do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setErrorMessage("New password must be different from your current password.");
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        current_password: currentPassword,
        new_password: newPassword,
      });
    } catch (error) {
      let message = (error as Error).message || "Failed to update password.";
      try {
        const parsed = JSON.parse(message);
        if (parsed && typeof parsed.detail === "string") {
          message = parsed.detail;
        }
      } catch {
        // Keep original message when backend response is not JSON.
      }
      setErrorMessage(message);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background transition-colors duration-200">
      <AppNavbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
        <div className="mb-5">
          <DashboardBreadcrumbs section="management" current="Account" />
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Account Settings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Signed in as {username || "User"}
          </p>
        </div>

        <Card className="rounded-xl border border-border/70 bg-card p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-2 text-foreground">
            <KeyRound className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Change Password</h2>
          </div>

          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-muted-foreground"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  aria-label={
                    showCurrentPassword ? "Hide current password" : "Show current password"
                  }
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-muted-foreground"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-muted-foreground"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Password must be at least 6 characters and different from the current
              password.
            </p>

            <Button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="w-full sm:w-auto"
            >
              {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default Account;
