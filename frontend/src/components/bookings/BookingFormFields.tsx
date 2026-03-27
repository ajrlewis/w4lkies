
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control } from "react-hook-form";
import { User, Service, Customer } from "@/types/interfaces";

interface BookingFormFieldsProps {
  control: Control<any>;
  users?: User[];
  services?: Service[];
  customers?: Customer[];
}

const BookingFormFields = ({ control, users, services, customers }: BookingFormFieldsProps) => {
  return (
    <>
      <FormField
        control={control}
        name="user_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel style={{ color: 'var(--text-primary)' }}>User</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
              </FormControl>
              <SelectContent style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)' }}>
                {users?.map((user) => (
                  <SelectItem key={user.user_id} value={user.user_id.toString()} className="hover:bg-[var(--bg-muted)] transition-colors" style={{ color: 'var(--text-primary)' }}>
                    {user.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="service_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel style={{ color: 'var(--text-primary)' }}>Service</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
              </FormControl>
              <SelectContent style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)' }}>
                {services?.map((service) => (
                  <SelectItem key={service.service_id} value={service.service_id.toString()} className="hover:bg-[var(--bg-muted)] transition-colors" style={{ color: 'var(--text-primary)' }}>
                    {service.name} (£{service.price})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="customer_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel style={{ color: 'var(--text-primary)' }}>Customer</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
              </FormControl>
              <SelectContent style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)' }}>
                {customers?.map((customer) => (
                  <SelectItem key={customer.customer_id} value={customer.customer_id.toString()} className="hover:bg-[var(--bg-muted)] transition-colors" style={{ color: 'var(--text-primary)' }}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default BookingFormFields;
