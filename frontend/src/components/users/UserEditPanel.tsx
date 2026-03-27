import { useEffect, useMemo, useState } from "react";
import { KeyRound, Mail, ShieldCheck, UserPlus, UserRound, UserX } from "lucide-react";

import { User } from "@/types/interfaces";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export interface UserFormState {
  username: string;
  email: string;
  password: string;
  is_admin: boolean;
  is_active: boolean;
}

interface UserEditPanelProps {
  open: boolean;
  user: User | null;
  mode: "create" | "edit";
  currentUsername: string | null;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: UserFormState) => Promise<void>;
}

const EMPTY_FORM: UserFormState = {
  username: "",
  email: "",
  password: "",
  is_admin: false,
  is_active: true,
};

const UserEditPanel = ({
  open,
  user,
  mode,
  currentUsername,
  isSaving,
  onOpenChange,
  onSave,
}: UserEditPanelProps) => {
  const [isDesktop, setIsDesktop] = useState(false);
  const [formData, setFormData] = useState<UserFormState>(EMPTY_FORM);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (mode === "create") {
      setFormData(EMPTY_FORM);
      return;
    }

    if (!user) {
      return;
    }

    setFormData({
      username: user.username,
      email: user.email,
      password: "",
      is_admin: user.is_admin,
      is_active: user.is_active,
    });
  }, [mode, user, open]);

  const isSelf = useMemo(
    () =>
      mode === "edit" &&
      !!user &&
      !!currentUsername &&
      user.username === currentUsername,
    [mode, user, currentUsername]
  );

  const isFormValid = useMemo(() => {
    const hasBasics =
      formData.username.trim().length >= 2 && formData.email.trim().length > 0;
    if (mode === "create") {
      return hasBasics && formData.password.length >= 6;
    }
    return hasBasics;
  }, [formData, mode]);

  const handleSave = async () => {
    await onSave({
      username: formData.username.trim(),
      email: formData.email.trim(),
      password: formData.password,
      is_admin: formData.is_admin,
      is_active: formData.is_active,
    });
  };

  const formBody = (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label
          htmlFor="user-username"
          className="text-xs uppercase tracking-wide text-muted-foreground"
        >
          Username
        </Label>
        <div className="relative">
          <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="user-username"
            value={formData.username}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, username: e.target.value }))
            }
            className="pl-10"
            autoComplete="off"
            disabled={isSelf}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="user-email"
          className="text-xs uppercase tracking-wide text-muted-foreground"
        >
          Email
        </Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="user-email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            className="pl-10"
            autoComplete="off"
          />
        </div>
      </div>

      {mode === "create" && (
        <div className="space-y-2">
          <Label
            htmlFor="user-password"
            className="text-xs uppercase tracking-wide text-muted-foreground"
          >
            Password
          </Label>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="user-password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              className="pl-10"
              autoComplete="new-password"
            />
          </div>
          <p className="text-xs text-muted-foreground">At least 6 characters.</p>
        </div>
      )}

      <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Admin Access</p>
            <p className="text-xs text-muted-foreground">
              Can manage protected admin pages
            </p>
          </div>
          <Switch
            checked={formData.is_admin}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, is_admin: checked }))
            }
            disabled={isSelf}
            aria-label="Toggle admin access"
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Account Active</p>
            <p className="text-xs text-muted-foreground">
              Inactive users cannot sign in
            </p>
          </div>
          <Switch
            checked={formData.is_active}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, is_active: checked }))
            }
            disabled={isSelf}
            aria-label="Toggle account activity"
          />
        </div>
      </div>

      {isSelf && (
        <p className="text-xs text-muted-foreground">
          For safety, your own username, admin, and active flags cannot be changed
          here.
        </p>
      )}
    </div>
  );

  const actions = (
    <div className="grid grid-cols-2 gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => onOpenChange(false)}
        disabled={isSaving}
      >
        Cancel
      </Button>
      <Button type="button" onClick={handleSave} disabled={isSaving || !isFormValid}>
        {isSaving
          ? "Saving..."
          : mode === "create"
            ? "Create User"
            : "Save Changes"}
      </Button>
    </div>
  );

  if (mode === "edit" && !user) {
    return null;
  }

  if (isDesktop) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader className="pb-4 text-left">
            <SheetTitle className="flex items-center gap-2">
              {mode === "create" ? (
                <UserPlus className="h-4 w-4 text-primary" />
              ) : formData.is_admin ? (
                <ShieldCheck className="h-4 w-4 text-primary" />
              ) : (
                <UserX className="h-4 w-4 text-muted-foreground" />
              )}
              {mode === "create" ? "Add User" : "Edit User"}
            </SheetTitle>
            <SheetDescription>
              {mode === "create"
                ? "Create a new sign-in account and permissions."
                : "Update account details and permissions."}
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-6 pb-6">{formBody}</div>
          {actions}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[92vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>{mode === "create" ? "Add User" : "Edit User"}</DrawerTitle>
          <DrawerDescription>
            {mode === "create"
              ? "Create a new sign-in account and permissions."
              : "Update account details and permissions."}
          </DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-2">{formBody}</div>
        <DrawerFooter>{actions}</DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default UserEditPanel;
