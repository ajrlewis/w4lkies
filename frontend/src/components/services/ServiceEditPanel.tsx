import { useEffect, useMemo, useState } from "react";
import { Bone, Clock3, FileText, PoundSterling } from "lucide-react";

import { Service } from "@/types/interfaces";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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

export interface ServiceFormState {
  name: string;
  price: number | null;
  description: string;
  duration: number | null;
  is_publicly_offered: boolean;
  is_active: boolean;
}

interface ServiceEditPanelProps {
  open: boolean;
  service: Service | null;
  mode: "create" | "edit";
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: ServiceFormState) => Promise<void>;
}

interface ServiceDraftState {
  name: string;
  price: string;
  description: string;
  duration: string;
  is_publicly_offered: boolean;
  is_active: boolean;
}

const EMPTY_FORM: ServiceDraftState = {
  name: "",
  price: "",
  description: "",
  duration: "",
  is_publicly_offered: true,
  is_active: true,
};

const ServiceEditPanel = ({
  open,
  service,
  mode,
  isSaving,
  onOpenChange,
  onSave,
}: ServiceEditPanelProps) => {
  const [isDesktop, setIsDesktop] = useState(false);
  const [formData, setFormData] = useState<ServiceDraftState>(EMPTY_FORM);

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

    if (!service) {
      return;
    }

    setFormData({
      name: service.name || "",
      price: service.price != null ? service.price.toString() : "",
      description: service.description || "",
      duration: service.duration != null ? service.duration.toString() : "",
      is_publicly_offered: service.is_publicly_offered,
      is_active: service.is_active,
    });
  }, [mode, service, open]);

  const parsedPrice = useMemo(() => {
    const trimmed = formData.price.trim();
    if (!trimmed) {
      return null;
    }
    const parsed = Number.parseFloat(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }, [formData.price]);
  const parsedDuration = useMemo(() => {
    if (!formData.duration.trim()) {
      return null;
    }
    const parsed = Number.parseFloat(formData.duration);
    return Number.isFinite(parsed) ? parsed : null;
  }, [formData.duration]);

  const baselineForm = useMemo<ServiceDraftState>(() => {
    if (mode === "create" || !service) {
      return EMPTY_FORM;
    }

    return {
      name: service.name || "",
      price: service.price != null ? service.price.toString() : "",
      description: service.description || "",
      duration: service.duration != null ? service.duration.toString() : "",
      is_publicly_offered: service.is_publicly_offered,
      is_active: service.is_active,
    };
  }, [mode, service]);

  const hasPriceParseError = formData.price.trim().length > 0 && parsedPrice === null;
  const hasDurationParseError = formData.duration.trim().length > 0 && parsedDuration === null;
  const isDurationValid = parsedDuration === null || parsedDuration >= 0;
  const isCreateValid =
    formData.name.trim().length >= 2 &&
    formData.description.trim().length >= 4 &&
    parsedPrice !== null &&
    !hasPriceParseError &&
    !hasDurationParseError &&
    isDurationValid;
  const isEditValid =
    formData.name.trim().length > 0 &&
    (parsedPrice === null || Number.isFinite(parsedPrice)) &&
    !hasPriceParseError &&
    !hasDurationParseError &&
    isDurationValid;

  const isDirty = useMemo(() => {
    const normalize = (value: string) => value.trim();

    return (
      normalize(formData.name) !== normalize(baselineForm.name) ||
      normalize(formData.price) !== normalize(baselineForm.price) ||
      normalize(formData.description) !== normalize(baselineForm.description) ||
      normalize(formData.duration) !== normalize(baselineForm.duration) ||
      formData.is_publicly_offered !== baselineForm.is_publicly_offered ||
      formData.is_active !== baselineForm.is_active
    );
  }, [formData, baselineForm]);

  const isFormValid = useMemo(
    () => (mode === "create" ? isCreateValid : isEditValid),
    [mode, isCreateValid, isEditValid]
  );

  const handleSave = async () => {
    if (!isFormValid) {
      return;
    }

    if (mode === "create" && parsedPrice === null) {
      return;
    }

    await onSave({
      name: formData.name.trim(),
      price: parsedPrice,
      description: formData.description.trim(),
      duration: parsedDuration,
      is_publicly_offered: formData.is_publicly_offered,
      is_active: formData.is_active,
    });
  };

  const formBody = (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="service-name" className="text-xs uppercase tracking-wide text-muted-foreground">
          Service Name
        </Label>
        <div className="relative">
          <Bone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="service-name"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            className="pl-10"
            autoComplete="off"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="service-price" className="text-xs uppercase tracking-wide text-muted-foreground">
            Price (GBP)
          </Label>
          <div className="relative">
            <PoundSterling className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="service-price"
              type="number"
              inputMode="decimal"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="service-duration" className="text-xs uppercase tracking-wide text-muted-foreground">
            Duration (minutes)
          </Label>
          <div className="relative">
            <Clock3 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="service-duration"
              type="number"
              inputMode="decimal"
              step="1"
              min="1"
              value={formData.duration}
              onChange={(e) => setFormData((prev) => ({ ...prev, duration: e.target.value }))}
              className="pl-10"
              placeholder="Optional"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="service-description" className="text-xs uppercase tracking-wide text-muted-foreground">
          Description
        </Label>
        <div className="relative">
          <FileText className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Textarea
            id="service-description"
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            className="min-h-[120px] pl-10"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border/70 bg-muted/30 p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Publicly Offered</p>
            <p className="text-xs text-muted-foreground">Visible in public service listings</p>
          </div>
          <Switch
            checked={formData.is_publicly_offered}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, is_publicly_offered: checked }))
            }
            aria-label="Toggle publicly offered"
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Service Active</p>
            <p className="text-xs text-muted-foreground">Inactive services cannot be selected for new bookings</p>
          </div>
          <Switch
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
            aria-label="Toggle service active status"
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
      <Button type="button" onClick={handleSave} disabled={isSaving || !isDirty || !isFormValid}>
        {isSaving ? "Saving..." : mode === "create" ? "Create Service" : "Save Changes"}
      </Button>
    </div>
  );

  if (mode === "edit" && !service) {
    return null;
  }

  if (isDesktop) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader className="pb-4 text-left">
            <SheetTitle>{mode === "create" ? "Add Service" : "Edit Service"}</SheetTitle>
            <SheetDescription>
              {mode === "create"
                ? "Create a service offering for customer bookings."
                : "Update service pricing, description, and availability."}
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
          <DrawerTitle>{mode === "create" ? "Add Service" : "Edit Service"}</DrawerTitle>
          <DrawerDescription>
            {mode === "create"
              ? "Create a service offering for customer bookings."
              : "Update service pricing, description, and availability."}
          </DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-2">{formBody}</div>
        <DrawerFooter>{actions}</DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ServiceEditPanel;
