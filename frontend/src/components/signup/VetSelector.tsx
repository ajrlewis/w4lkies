import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/api/apiService";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Stethoscope } from "lucide-react";

interface Vet {
  vet_id: number;
  name: string;
  address: string;
  phone: string;
}

interface VetSelectorProps {
  form: UseFormReturn<any>;
  index: number;
}

const mockVets = [
  { vet_id: 1, name: "Village Vet", address: "109 Station Road, London NW4 4NT", phone: "(+44) 20 1234 5678" },
  { vet_id: 2, name: "Wood Street Vet", address: "23 Wood St, London W12 7DP", phone: "(+44) 20 8765 4321" },
  { vet_id: 3, name: "Acton Lane Vet", address: "56 Acton Ln, London W3 6LP", phone: "(+44) 20 2468 1357" },
  { vet_id: 4, name: "Vale Vet", address: "12 Vale Lane, London NW15 6YZ", phone: "(+44) 20 1357 2468" },
  {
    vet_id: 5,
    name: "Village Vet (Chiswick)",
    address: "113 Chiswick High Rd., Chiswick, London W4 2ED",
    phone: "(+44) 20 8995 1582",
  },
];

const VetSelector = ({ form, index }: VetSelectorProps) => {
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [otherVetName, setOtherVetName] = useState("");
  const [otherVetAddress, setOtherVetAddress] = useState("");

  const { data: vets = mockVets, isLoading, isError } = useQuery({
    queryKey: ["vets"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/vets`);
      if (!response.ok) {
        throw new Error("Failed to fetch vets");
      }
      return response.json() as Promise<Vet[]>;
    },
  });

  const displayVets = isError ? mockVets : vets;

  useEffect(() => {
    if (isOtherSelected) {
      form.setValue(`dogs.${index}.vet_name`, otherVetName);
      form.setValue(`dogs.${index}.vet_address`, otherVetAddress);
      return;
    }

    const selectedVetId = form.getValues(`dogs.${index}.vet`);
    const selectedVet = displayVets.find((vet) => String(vet.vet_id) === selectedVetId);

    if (selectedVet) {
      form.setValue(`dogs.${index}.vet_name`, selectedVet.name);
      form.setValue(`dogs.${index}.vet_address`, selectedVet.address);
    }
  }, [form, index, isOtherSelected, otherVetName, otherVetAddress, displayVets]);

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name={`dogs.${index}.vet`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1 text-foreground">
              <Stethoscope className="h-4 w-4" />
              Vet
            </FormLabel>
            <FormControl>
              <Select
                value={field.value || ""}
                onValueChange={(value) => {
                  field.onChange(value);

                  if (value === "-1") {
                    setIsOtherSelected(true);
                    form.setValue(`dogs.${index}.vet_name`, otherVetName);
                    form.setValue(`dogs.${index}.vet_address`, otherVetAddress);
                    return;
                  }

                  setIsOtherSelected(false);
                  const selectedVet = displayVets.find((vet) => String(vet.vet_id) === value);
                  if (selectedVet) {
                    form.setValue(`dogs.${index}.vet_name`, selectedVet.name);
                    form.setValue(`dogs.${index}.vet_address`, selectedVet.address);
                  }
                }}
              >
                <SelectTrigger className="border-border bg-background text-foreground">
                  <SelectValue placeholder="Select a vet" />
                </SelectTrigger>
                <SelectContent className="max-h-96 border-border bg-background text-foreground">
                  {isLoading ? (
                    <SelectItem value="__loading__" disabled className="cursor-default text-muted-foreground">
                      Loading vets...
                    </SelectItem>
                  ) : (
                    <>
                      {displayVets.map((vet) => (
                        <SelectItem
                          key={vet.vet_id}
                          value={String(vet.vet_id)}
                          className="cursor-pointer text-foreground hover:bg-muted"
                        >
                          {vet.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="-1" className="cursor-pointer text-foreground hover:bg-muted">
                        Other
                      </SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {isOtherSelected && (
        <div className="space-y-3 pt-1">
          <div>
            <FormLabel htmlFor="otherVetName" className="mb-1 block text-sm font-medium text-foreground">
              Vet Name
            </FormLabel>
            <Input
              id="otherVetName"
              className="w-full border-border bg-background text-foreground"
              value={otherVetName}
              onChange={(e) => {
                setOtherVetName(e.target.value);
                form.setValue(`dogs.${index}.vet_name`, e.target.value);
              }}
              placeholder="Enter vet name"
            />
          </div>
          <div>
            <FormLabel htmlFor="otherVetAddress" className="mb-1 block text-sm font-medium text-foreground">
              Vet Address
            </FormLabel>
            <Input
              id="otherVetAddress"
              className="w-full border-border bg-background text-foreground"
              value={otherVetAddress}
              onChange={(e) => {
                setOtherVetAddress(e.target.value);
                form.setValue(`dogs.${index}.vet_address`, e.target.value);
              }}
              placeholder="Enter vet address"
            />
          </div>
        </div>
      )}

      <FormField control={form.control} name={`dogs.${index}.vet_name`} render={({ field }) => <input type="hidden" {...field} />} />
      <FormField control={form.control} name={`dogs.${index}.vet_address`} render={({ field }) => <input type="hidden" {...field} />} />
    </div>
  );
};

export default VetSelector;
