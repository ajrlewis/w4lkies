import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Heart, Stethoscope, UserRound } from "lucide-react";

import type { Dog } from "@/types/interfaces";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { fetchCustomers } from "@/api/customerRequests";
import { fetchDogBreeds } from "@/api/dogRequests";
import { fetchVets } from "@/api/vetRequests";

export interface DogFormState {
  name: string;
  date_of_birth: string;
  breed: string;
  customer_id: number;
  vet_id: number;
  medical_needs: string;
  behavioral_issues: string;
  is_allowed_treats: boolean;
  is_allowed_off_the_lead: boolean;
  is_allowed_on_social_media: boolean;
  is_neutered_or_spayed: boolean;
}

interface DogEditPanelProps {
  open: boolean;
  dog: Dog | null;
  mode: "create" | "edit";
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: DogFormState) => Promise<void>;
}

const EMPTY_FORM: DogFormState = {
  name: "",
  date_of_birth: "",
  breed: "",
  customer_id: 0,
  vet_id: 0,
  medical_needs: "",
  behavioral_issues: "",
  is_allowed_treats: false,
  is_allowed_off_the_lead: false,
  is_allowed_on_social_media: false,
  is_neutered_or_spayed: false,
};

const DogEditPanel = ({
  open,
  dog,
  mode,
  isSaving,
  onOpenChange,
  onSave,
}: DogEditPanelProps) => {
  const [isDesktop, setIsDesktop] = useState(false);
  const [formData, setFormData] = useState<DogFormState>(EMPTY_FORM);
  const [showCustomBreed, setShowCustomBreed] = useState(false);

  const { data: breeds = [] } = useQuery({
    queryKey: ["dog-breeds"],
    queryFn: fetchDogBreeds,
    enabled: open,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: fetchCustomers,
    enabled: open,
  });

  const { data: vets = [] } = useQuery({
    queryKey: ["vets"],
    queryFn: fetchVets,
    enabled: open,
  });

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
      setShowCustomBreed(false);
      return;
    }

    if (!dog) {
      return;
    }

    setFormData({
      name: dog.name || "",
      date_of_birth: dog.date_of_birth ? dog.date_of_birth.substring(0, 10) : "",
      breed: dog.breed || "",
      customer_id: dog.customer_id || dog.customer?.customer_id || 0,
      vet_id: dog.vet_id || dog.vet?.vet_id || 0,
      medical_needs: dog.medical_needs || "",
      behavioral_issues: dog.behavioral_issues || "",
      is_allowed_treats: !!dog.is_allowed_treats,
      is_allowed_off_the_lead: !!dog.is_allowed_off_the_lead,
      is_allowed_on_social_media: !!dog.is_allowed_on_social_media,
      is_neutered_or_spayed: !!dog.is_neutered_or_spayed,
    });
  }, [mode, dog, open]);

  useEffect(() => {
    if (!formData.breed || breeds.length === 0) {
      return;
    }
    setShowCustomBreed(!breeds.includes(formData.breed));
  }, [breeds, formData.breed]);

  const isFormValid = useMemo(
    () =>
      formData.name.trim().length >= 2 &&
      formData.date_of_birth.length > 0 &&
      formData.breed.trim().length > 0 &&
      formData.customer_id > 0 &&
      formData.vet_id > 0,
    [formData]
  );

  const handleBreedChange = (value: string) => {
    if (value === "other") {
      setShowCustomBreed(true);
      setFormData((prev) => ({ ...prev, breed: "" }));
      return;
    }

    setShowCustomBreed(false);
    setFormData((prev) => ({ ...prev, breed: value }));
  };

  const handleSave = async () => {
    await onSave({
      ...formData,
      name: formData.name.trim(),
      breed: formData.breed.trim(),
      medical_needs: formData.medical_needs.trim(),
      behavioral_issues: formData.behavioral_issues.trim(),
    });
  };

  const formBody = (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="dog-name" className="text-xs uppercase tracking-wide text-muted-foreground">
          Dog Name
        </Label>
        <div className="relative">
          <Heart className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="dog-name"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            className="pl-10"
            autoComplete="off"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dog-date-of-birth" className="text-xs uppercase tracking-wide text-muted-foreground">
          Date of Birth
        </Label>
        <div className="relative">
          <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="dog-date-of-birth"
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => setFormData((prev) => ({ ...prev, date_of_birth: e.target.value }))}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Breed</Label>
        {!showCustomBreed ? (
          <Select value={formData.breed || undefined} onValueChange={handleBreedChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a breed" />
            </SelectTrigger>
            <SelectContent>
              {breeds.map((breed) => (
                <SelectItem key={breed} value={breed}>
                  {breed}
                </SelectItem>
              ))}
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <div className="space-y-2">
            <Input
              value={formData.breed}
              onChange={(e) => setFormData((prev) => ({ ...prev, breed: e.target.value }))}
              placeholder="Enter breed"
            />
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 text-xs"
              onClick={() => {
                setShowCustomBreed(false);
                setFormData((prev) => ({ ...prev, breed: "" }));
              }}
            >
              Back to breed list
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Customer</Label>
          <Select
            value={formData.customer_id > 0 ? formData.customer_id.toString() : undefined}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, customer_id: Number(value) }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select customer" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.customer_id} value={customer.customer_id.toString()}>
                  {customer.name}{customer.is_active ? "" : " (Inactive)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Vet</Label>
          <Select
            value={formData.vet_id > 0 ? formData.vet_id.toString() : undefined}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, vet_id: Number(value) }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select vet" />
            </SelectTrigger>
            <SelectContent>
              {vets.map((vet) => (
                <SelectItem key={vet.vet_id} value={vet.vet_id.toString()}>
                  {vet.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Medical Needs</Label>
        <Textarea
          value={formData.medical_needs}
          onChange={(e) => setFormData((prev) => ({ ...prev, medical_needs: e.target.value }))}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Behavioral Issues</Label>
        <Textarea
          value={formData.behavioral_issues}
          onChange={(e) => setFormData((prev) => ({ ...prev, behavioral_issues: e.target.value }))}
          rows={3}
        />
      </div>

      <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Walk Permissions
        </p>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm">Allowed treats</span>
            <Switch
              checked={formData.is_allowed_treats}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, is_allowed_treats: checked }))
              }
              aria-label="Toggle allowed treats"
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm">Allowed off the lead</span>
            <Switch
              checked={formData.is_allowed_off_the_lead}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, is_allowed_off_the_lead: checked }))
              }
              aria-label="Toggle off the lead"
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm">Allowed on social media</span>
            <Switch
              checked={formData.is_allowed_on_social_media}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, is_allowed_on_social_media: checked }))
              }
              aria-label="Toggle social media"
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm">Neutered or spayed</span>
            <Switch
              checked={formData.is_neutered_or_spayed}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, is_neutered_or_spayed: checked }))
              }
              aria-label="Toggle neutered or spayed"
            />
          </div>
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
        {isSaving ? "Saving..." : mode === "create" ? "Create Dog" : "Save Changes"}
      </Button>
    </div>
  );

  if (mode === "edit" && !dog) {
    return null;
  }

  if (isDesktop) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader className="pb-4 text-left">
            <SheetTitle className="inline-flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-primary" />
              {mode === "create" ? "Add Dog" : "Edit Dog"}
            </SheetTitle>
            <SheetDescription>
              {mode === "create"
                ? "Create a dog profile with care preferences and owner details."
                : "Update dog profile details, care preferences, and assignments."}
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
          <DrawerTitle>{mode === "create" ? "Add Dog" : "Edit Dog"}</DrawerTitle>
          <DrawerDescription>
            {mode === "create"
              ? "Create a dog profile with care preferences and owner details."
              : "Update dog profile details, care preferences, and assignments."}
          </DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-2">{formBody}</div>
        <DrawerFooter>{actions}</DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default DogEditPanel;
