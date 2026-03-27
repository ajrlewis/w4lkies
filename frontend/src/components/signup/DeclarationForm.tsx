import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";
import { SignupFormData } from "@/types/forms";
import { Check } from "lucide-react";

interface DeclarationFormProps {
  form: UseFormReturn<SignupFormData>;
}

const DeclarationForm = ({ form }: DeclarationFormProps) => {
  return (
    <div className="space-y-4">
      <h3 className="mb-3 flex items-center gap-2 text-xl font-semibold text-foreground">
        <Check className="h-5 w-5 text-primary" />
        Declaration
      </h3>

      <FormField
        control={form.control}
        name="declaration"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-border/70 bg-background p-3 sm:p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                className="border-border data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel className="flex items-center gap-1 text-sm font-normal text-muted-foreground">
                <Check className="h-4 w-4" />
                I confirm that all information provided is accurate and I agree to London W4lkies
                Ltd&apos;s
                <a
                  href="/legal/#terms"
                  target="_blank"
                  className="ml-1 text-accent underline-offset-2 hover:underline"
                >
                  terms and conditions
                </a>
                .
              </FormLabel>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />
    </div>
  );
};

export default DeclarationForm;
