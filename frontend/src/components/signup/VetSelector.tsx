import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/api/apiService";
import { Input } from "@/components/ui/input";

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
  const [open, setOpen] = useState(false);

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
          <FormItem className="flex flex-col">
            <FormLabel className="text-foreground">Select your vet</FormLabel>
            <FormControl>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn("w-full justify-between border-border bg-background text-foreground", !field.value && "text-muted-foreground")}
                  >
                    {field.value
                      ? isOtherSelected
                        ? "Other"
                        : displayVets.find((vet) => vet.vet_id === parseInt(field.value, 10))?.name || "Select vet"
                      : "Select vet"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="z-50 border-border bg-background p-0" align="start">
                  <Command className="bg-background text-foreground">
                    <CommandInput placeholder="Search vet..." className="text-foreground" />
                    <CommandList>
                      <CommandEmpty className="text-muted-foreground">No vet found.</CommandEmpty>
                      <CommandGroup>
                        {isLoading ? (
                          <CommandItem disabled className="text-muted-foreground">
                            Loading vets...
                          </CommandItem>
                        ) : (
                          <>
                            {displayVets.map((vet) => (
                              <CommandItem
                                key={vet.vet_id}
                                value={vet.name}
                                className="cursor-pointer text-foreground aria-selected:bg-muted"
                                onSelect={() => {
                                  field.onChange(String(vet.vet_id));
                                  setIsOtherSelected(false);
                                  form.setValue(`dogs.${index}.vet_name`, vet.name);
                                  form.setValue(`dogs.${index}.vet_address`, vet.address);
                                  setOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4 text-primary",
                                    field.value === String(vet.vet_id) ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span>{vet.name}</span>
                                  <span className="text-xs text-muted-foreground">{vet.address}</span>
                                </div>
                              </CommandItem>
                            ))}
                            <CommandItem
                              key="other"
                              value="Other"
                              className="cursor-pointer text-foreground aria-selected:bg-muted"
                              onSelect={() => {
                                setIsOtherSelected(true);
                                field.onChange("-1");
                                form.setValue(`dogs.${index}.vet_name`, otherVetName);
                                form.setValue(`dogs.${index}.vet_address`, otherVetAddress);
                                setOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4 text-primary",
                                  isOtherSelected ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <span>Other</span>
                            </CommandItem>
                          </>
                        )}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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
