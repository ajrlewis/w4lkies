import { useEffect, useMemo, useState } from "react";
import { MapPin, Phone, Stethoscope } from "lucide-react";

import { Vet } from "@/types/interfaces";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export interface VetFormState {
  name: string;
  address: string;
  phone: string;
}

interface VetEditPanelProps {
  open: boolean;
  vet: Vet | null;
  mode: "create" | "edit";
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: VetFormState) => Promise<void>;
}

const EMPTY_FORM: VetFormState = {
  name: "",
  address: "",
  phone: "",
};

const VetEditPanel = ({
  open,
  vet,
  mode,
  isSaving,
  onOpenChange,
  onSave,
}: VetEditPanelProps) => {
  const [isDesktop, setIsDesktop] = useState(false);
  const [formData, setFormData] = useState<VetFormState>(EMPTY_FORM);

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

    if (!vet) {
      return;
    }

    setFormData({
      name: vet.name,
      address: vet.address,
      phone: vet.phone,
    });
  }, [mode, vet, open]);

  const isFormValid = useMemo(
    () =>
      formData.name.trim().length >= 2 &&
      formData.address.trim().length >= 5 &&
      formData.phone.trim().length >= 7,
    [formData]
  );

  const handleSave = async () => {
    await onSave({
      name: formData.name.trim(),
      address: formData.address.trim(),
      phone: formData.phone.trim(),
    });
  };

  const formBody = (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="vet-name" className="text-xs uppercase tracking-wide text-muted-foreground">
          Vet Name
        </Label>
        <div className="relative">
          <Stethoscope className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="vet-name"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            className="pl-10"
            autoComplete="off"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="vet-address" className="text-xs uppercase tracking-wide text-muted-foreground">
          Address
        </Label>
        <div className="relative">
          <MapPin className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="vet-address"
            value={formData.address}
            onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
            className="pl-10"
            autoComplete="off"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="vet-phone" className="text-xs uppercase tracking-wide text-muted-foreground">
          Phone
        </Label>
        <div className="relative">
          <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="vet-phone"
            value={formData.phone}
            onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
            className="pl-10"
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  );

  const actions = (
    <div className="grid grid-cols-2 gap-2">
      <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
        Cancel
      </Button>
      <Button type="button" onClick={handleSave} disabled={isSaving || !isFormValid}>
        {isSaving ? "Saving..." : mode === "create" ? "Create Vet" : "Save Changes"}
      </Button>
    </div>
  );

  if (mode === "edit" && !vet) {
    return null;
  }

  if (isDesktop) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader className="pb-4 text-left">
            <SheetTitle>{mode === "create" ? "Add Vet" : "Edit Vet"}</SheetTitle>
            <SheetDescription>
              {mode === "create"
                ? "Create a veterinary profile for customer dog records."
                : "Update vet details used across customer dog records."}
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
          <DrawerTitle>{mode === "create" ? "Add Vet" : "Edit Vet"}</DrawerTitle>
          <DrawerDescription>
            {mode === "create"
              ? "Create a veterinary profile for customer dog records."
              : "Update vet details used across customer dog records."}
          </DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-2">{formBody}</div>
        <DrawerFooter>{actions}</DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default VetEditPanel;
