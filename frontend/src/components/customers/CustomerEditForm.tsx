
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Customer } from "@/types/interfaces";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/sonner";
import { updateCustomer, createCustomer, CreateCustomerData } from "@/api/customerRequests";

// Form validation schema
const customerFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  email: z.string().email("Invalid email address"),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  is_active: z.boolean().default(true)
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;

interface CustomerEditFormProps {
  customer?: Customer;
  onCancel: () => void;
  onSuccess: () => void;
}

const CustomerEditForm = ({ customer, onCancel, onSuccess }: CustomerEditFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!customer;

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: customer?.name || "",
      phone: customer?.phone || "",
      email: customer?.email || "",
      emergency_contact_name: customer?.emergency_contact_name || "",
      emergency_contact_phone: customer?.emergency_contact_phone || "",
      is_active: customer?.is_active ?? true
    }
  });

  const onSubmit = async (data: CustomerFormValues) => {
    try {
      setIsSubmitting(true);
      if (isEditing && customer) {
        await updateCustomer(customer.customer_id, data);
        toast.success("Customer updated successfully");
      } else {
        // Create a new customer with all required fields, ensuring they're all present
        const newCustomerData: CreateCustomerData = {
          name: data.name,
          phone: data.phone,
          email: data.email,
          emergency_contact_name: data.emergency_contact_name || "",
          emergency_contact_phone: data.emergency_contact_phone || "",
          is_active: data.is_active,
          signed_up_on: new Date().toISOString() // Set current date for new customers
        };
        await createCustomer(newCustomerData);
        toast.success("Customer created successfully");
      }
      onSuccess();
    } catch (error) {
      toast.error(`Failed to save: ${(error as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter customer name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter phone number" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder="Enter email address" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="pt-4 border-t">
          <h3 className="text-sm font-medium mb-3">Emergency Contact</h3>
          
          <FormField
            control={form.control}
            name="emergency_contact_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Emergency Contact Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter emergency contact name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="emergency_contact_phone"
            render={({ field }) => (
              <FormItem className="mt-3">
                <FormLabel>Emergency Contact Phone</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter emergency contact phone" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between pt-4 border-t">
              <FormLabel>Active Customer</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : isEditing ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CustomerEditForm;
