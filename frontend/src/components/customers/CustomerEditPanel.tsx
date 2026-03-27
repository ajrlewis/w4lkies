import { useEffect, useMemo, useState } from "react";
import { Mail, Phone, UserRound, UserSquare2 } from "lucide-react";

import { Customer } from "@/types/interfaces";
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

export interface CustomerFormState {
  name: string;
  email: string;
  phone: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  is_active: boolean;
}

interface CustomerEditPanelProps {
  open: boolean;
  customer: Customer | null;
  isSaving: boolean;
  mode: "create" | "edit";
  onOpenChange: (open: boolean) => void;
  onSave: (data: CustomerFormState) => Promise<void>;
}

const EMPTY_FORM: CustomerFormState = {
  name: "",
  email: "",
  phone: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  is_active: true,
};

const CustomerEditPanel = ({
  open,
  customer,
  isSaving,
  mode,
  onOpenChange,
  onSave,
}: CustomerEditPanelProps) => {
  const [isDesktop, setIsDesktop] = useState(false);
  const [formData, setFormData] = useState<CustomerFormState>(EMPTY_FORM);

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

    if (!customer) {
      return;
    }

    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      emergency_contact_name: customer.emergency_contact_name || "",
      emergency_contact_phone: customer.emergency_contact_phone || "",
      is_active: customer.is_active,
    });
  }, [customer, mode, open]);

  const isFormValid = useMemo(
    () =>
      formData.name.trim().length >= 2 &&
      formData.email.trim().length > 0 &&
      formData.phone.trim().length >= 6,
    [formData]
  );

  const handleSave = async () => {
    await onSave({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      emergency_contact_name: formData.emergency_contact_name.trim(),
      emergency_contact_phone: formData.emergency_contact_phone.trim(),
      is_active: formData.is_active,
    });
  };

  const formBody = (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="customer-name" className="text-xs uppercase tracking-wide text-muted-foreground">
          Customer Name
        </Label>
        <div className="relative">
          <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="customer-name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            className="pl-10"
            autoComplete="off"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="customer-email" className="text-xs uppercase tracking-wide text-muted-foreground">
          Email
        </Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="customer-email"
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

      <div className="space-y-2">
        <Label htmlFor="customer-phone" className="text-xs uppercase tracking-wide text-muted-foreground">
          Phone
        </Label>
        <div className="relative">
          <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="customer-phone"
            value={formData.phone}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, phone: e.target.value }))
            }
            className="pl-10"
            autoComplete="off"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border/70 bg-muted/30 p-4 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Emergency Contact
        </p>

        <div className="space-y-2">
          <Label htmlFor="customer-emergency-name" className="text-xs uppercase tracking-wide text-muted-foreground">
            Name
          </Label>
          <div className="relative">
            <UserSquare2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="customer-emergency-name"
              value={formData.emergency_contact_name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, emergency_contact_name: e.target.value }))
              }
              className="pl-10"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="customer-emergency-phone" className="text-xs uppercase tracking-wide text-muted-foreground">
            Phone
          </Label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="customer-emergency-phone"
              value={formData.emergency_contact_phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, emergency_contact_phone: e.target.value }))
              }
              className="pl-10"
              autoComplete="off"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Customer Active</p>
            <p className="text-xs text-muted-foreground">Inactive customers are hidden from active booking flows</p>
          </div>
          <Switch
            checked={formData.is_active}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, is_active: checked }))
            }
            aria-label="Toggle customer active status"
          />
        </div>
      </div>
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
        {isSaving ? "Saving..." : mode === "create" ? "Create Customer" : "Save Changes"}
      </Button>
    </div>
  );

  if (isDesktop) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader className="pb-4 text-left">
            <SheetTitle>{mode === "create" ? "Add Customer" : "Edit Customer"}</SheetTitle>
            <SheetDescription>
              {mode === "create"
                ? "Create a new customer profile for bookings and communication."
                : "Update customer details and emergency contact information."}
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
          <DrawerTitle>{mode === "create" ? "Add Customer" : "Edit Customer"}</DrawerTitle>
          <DrawerDescription>
            {mode === "create"
              ? "Create a new customer profile for bookings and communication."
              : "Update customer details and emergency contact information."}
          </DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-2">{formBody}</div>
        <DrawerFooter>{actions}</DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default CustomerEditPanel;
