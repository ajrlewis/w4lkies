import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { SignupFormData } from "@/types/forms";
import { User, Phone, Mail, Heart } from "lucide-react";

interface PersonalDetailsFormProps {
  form: UseFormReturn<SignupFormData>;
}

const PersonalDetailsForm = ({ form }: PersonalDetailsFormProps) => {
  return (
    <div className="space-y-4">
      <h3 className="mb-3 flex items-center gap-2 text-xl font-semibold text-foreground">
        <Heart className="h-5 w-5 text-primary" />
        Personal Details
      </h3>

      <FormField
        control={form.control}
        name="customer.name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1 text-foreground">
              <User className="h-4 w-4" />
              Name
            </FormLabel>
            <FormControl>
              <Input placeholder="Your full name" {...field} className="border-border bg-background text-foreground" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="customer.email"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1 text-foreground">
              <Mail className="h-4 w-4" />
              Email
            </FormLabel>
            <FormControl>
              <Input type="email" placeholder="your@email.com" {...field} className="border-border bg-background text-foreground" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="customer.phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1 text-foreground">
              <Phone className="h-4 w-4" />
              Phone
            </FormLabel>
            <FormControl>
              <Input placeholder="Your phone number" {...field} className="border-border bg-background text-foreground" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="customer.emergency_contact_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1 text-foreground">
              <User className="h-4 w-4" />
              Emergency Contact Name
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Emergency contact name"
                {...field}
                className="border-border bg-background text-foreground"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="customer.emergency_contact_phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1 text-foreground">
              <Phone className="h-4 w-4" />
              Emergency Contact Phone
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Emergency contact phone"
                {...field}
                className="border-border bg-background text-foreground"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default PersonalDetailsForm;
