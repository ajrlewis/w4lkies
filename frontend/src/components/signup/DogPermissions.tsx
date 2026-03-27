import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";
import { SignupFormData } from "@/types/forms";

interface DogPermissionsProps {
  form: UseFormReturn<SignupFormData>;
  index: number;
}

const permissionCardClass =
  "flex flex-row items-start space-x-3 space-y-0 rounded-md border border-border bg-background p-3 sm:p-4";

const DogPermissions = ({ form, index }: DogPermissionsProps) => {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
      <FormField
        control={form.control}
        name={`dogs.${index}.is_allowed_treats`}
        render={({ field }) => (
          <FormItem className={permissionCardClass}>
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                className="border-border data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              />
            </FormControl>
            <FormLabel className="font-normal text-foreground">Allowed treats?</FormLabel>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`dogs.${index}.is_allowed_off_the_lead`}
        render={({ field }) => (
          <FormItem className={permissionCardClass}>
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                className="border-border data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              />
            </FormControl>
            <FormLabel className="font-normal text-foreground">Allowed off the lead?</FormLabel>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`dogs.${index}.is_allowed_on_social_media`}
        render={({ field }) => (
          <FormItem className={permissionCardClass}>
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                className="border-border data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              />
            </FormControl>
            <FormLabel className="font-normal text-foreground">Allowed on Instagram/Website?</FormLabel>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`dogs.${index}.is_neutered_or_spayed`}
        render={({ field }) => (
          <FormItem className={permissionCardClass}>
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                className="border-border data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              />
            </FormControl>
            <FormLabel className="font-normal text-foreground">Neutered/Spayed?</FormLabel>
          </FormItem>
        )}
      />
    </div>
  );
};

export default DogPermissions;
