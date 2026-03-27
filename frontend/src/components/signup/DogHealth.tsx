import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { SignupFormData } from "@/types/forms";

interface DogHealthProps {
  form: UseFormReturn<SignupFormData>;
  index: number;
}

const DogHealth = ({ form, index }: DogHealthProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name={`dogs.${index}.behavioral_issues`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground">Behavioral Issues</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Please describe any behavioral issues..."
                {...field}
                className="min-h-[100px] border-border bg-background text-foreground"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`dogs.${index}.medical_needs`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground">Medical Needs / Allergies</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Please describe any medical needs or allergies..."
                {...field}
                className="min-h-[100px] border-border bg-background text-foreground"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default DogHealth;
