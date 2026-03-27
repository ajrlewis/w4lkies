import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Dog, CalendarDays } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { SignupFormData } from "@/types/forms";
import VetSelector from "@/components/signup/VetSelector";
import DogBreedSelector from "@/components/signup/DogBreedSelector";

interface DogBasicInfoProps {
  form: UseFormReturn<SignupFormData>;
  index: number;
}

const DogBasicInfo = ({ form, index }: DogBasicInfoProps) => {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name={`dogs.${index}.name`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1 text-foreground">
                <Dog className="h-4 w-4" />
                Name
              </FormLabel>
              <FormControl>
                <Input placeholder="Dog's name" {...field} className="border-border bg-background text-foreground" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DogBreedSelector form={form} index={index} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name={`dogs.${index}.date_of_birth`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1 text-foreground">
                <CalendarDays className="h-4 w-4" />
                Date of Birth
              </FormLabel>
              <FormControl>
                <Input type="date" {...field} className="border-border bg-background text-foreground" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <VetSelector form={form} index={index} />
      </div>
    </>
  );
};

export default DogBasicInfo;
