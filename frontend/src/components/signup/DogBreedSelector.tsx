import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { SignupFormData } from "@/types/forms";
import { API_BASE_URL } from "@/api/apiService";
import { useQuery } from "@tanstack/react-query";

interface DogBreedSelectorProps {
  form: UseFormReturn<SignupFormData>;
  index: number;
}

const DogBreedSelector = ({ form, index }: DogBreedSelectorProps) => {
  const [showCustomBreed, setShowCustomBreed] = useState(false);

  const { data: breeds = [], isLoading } = useQuery({
    queryKey: ["breeds"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/dogs/breeds`);
      if (!response.ok) {
        throw new Error("Failed to fetch breeds");
      }
      return response.json() as Promise<string[]>;
    },
  });

  const handleBreedChange = (value: string) => {
    if (value === "other") {
      setShowCustomBreed(true);
      form.setValue(`dogs.${index}.breed`, "");
    } else {
      setShowCustomBreed(false);
      form.setValue(`dogs.${index}.breed`, value);
    }
  };

  useEffect(() => {
    const currentValue = form.getValues(`dogs.${index}.breed`);
    if (currentValue && !breeds.includes(currentValue) && currentValue !== "") {
      setShowCustomBreed(true);
    }
  }, [breeds, form, index]);

  return (
    <FormField
      control={form.control}
      name={`dogs.${index}.breed`}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-foreground">Breed</FormLabel>
          <FormControl>
            {!showCustomBreed ? (
              <Select value={field.value || ""} onValueChange={handleBreedChange}>
                <SelectTrigger className="border-border bg-background text-foreground">
                  <SelectValue placeholder="Select a breed" />
                </SelectTrigger>
                <SelectContent className="max-h-96 border-border bg-background text-foreground">
                  {isLoading ? (
                    <SelectItem key="loading" value="loading" className="cursor-default text-muted-foreground">
                      Loading breeds...
                    </SelectItem>
                  ) : (
                    <>
                      {breeds.map((breed, i) => (
                        <SelectItem
                          key={`breed-${i}`}
                          value={breed}
                          className="cursor-pointer text-foreground hover:bg-muted"
                        >
                          {breed}
                        </SelectItem>
                      ))}
                      <SelectItem key="other" value="other" className="cursor-pointer text-foreground hover:bg-muted">
                        Other
                      </SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            ) : (
              <div className="space-y-2">
                <Input
                  placeholder="Enter dog breed"
                  value={field.value || ""}
                  onChange={field.onChange}
                  className="border-border bg-background text-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowCustomBreed(false)}
                  className="text-sm text-accent underline-offset-2 hover:underline"
                >
                  Back to breed list
                </button>
              </div>
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DogBreedSelector;
