import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { toast } from "@/components/ui/sonner";
import { submitBookings } from "./utils/bookingSubmission";
import AdditionalDatesSection, { AdditionalDate } from "./AdditionalDatesSection";
import ExtraServicesSection from "./ExtraServicesSection";
import BookingDateTimeSection from "./BookingDateTimeSection";
import { useBookingFormData } from "./hooks/useBookingFormData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const FormSchema = z.object({
  user_id: z.string({ required_error: "Please select a user." }),
  service_id: z.string({ required_error: "Please select a service." }),
  customer_id: z.string({ required_error: "Please select a customer." }),
  date: z.date({ required_error: "Please select a date." }),
  time: z.string({ required_error: "Please select a time." }),
});

interface BookingFormProps {
  onSubmitted?: () => void;
  submitLabel?: string;
}

const BookingForm = ({ onSubmitted, submitLabel = "Submit Booking" }: BookingFormProps) => {
  const [additionalDates, setAdditionalDates] = useState<AdditionalDate[]>([]);
  const [extraServiceIds, setExtraServiceIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { timeSlots, isLoadingTimeSlots, services, customers, users } = useBookingFormData();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      user_id: "",
      service_id: "",
      customer_id: "",
      date: new Date(),
      time: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (!data.user_id || !data.service_id || !data.customer_id || !data.date || !data.time) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);

      const bookingData = {
        user_id: data.user_id,
        service_id: data.service_id,
        extra_services: data.extra_services || [],
        customer_id: data.customer_id,
        date: data.date,
        time: data.time,
      };

      await submitBookings(bookingData, additionalDates, extraServiceIds);
      form.reset();
      setAdditionalDates([]);
      setExtraServiceIds([]);
      onSubmitted?.();
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addAdditionalDate = () => {
    const newDate: AdditionalDate = {
      id: `date-${Date.now()}`,
      date: new Date(),
      time: "",
      isDatePickerOpen: false,
    };
    setAdditionalDates([...additionalDates, newDate]);
  };

  const removeAdditionalDate = (idToRemove: string) => {
    setAdditionalDates(additionalDates.filter((date) => date.id !== idToRemove));
  };

  const updateAdditionalDate = (id: string, date: Date) => {
    setAdditionalDates(additionalDates.map((item) => (item.id === id ? { ...item, date } : item)));
  };

  const updateAdditionalTime = (id: string, time: string) => {
    setAdditionalDates(additionalDates.map((item) => (item.id === id ? { ...item, time } : item)));
  };

  const handleDatePickerOpenChange = (id: string, isOpen: boolean) => {
    setAdditionalDates(additionalDates.map((item) => (item.id === id ? { ...item, isDatePickerOpen: isOpen } : item)));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="user_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">User</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="border-border bg-background text-foreground">
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="border-border bg-popover">
                    {users?.map((user) => (
                      <SelectItem key={user.user_id} value={user.user_id.toString()} className="text-foreground focus:bg-muted">
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
            control={form.control}
            name="customer_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Customer</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="border-border bg-background text-foreground">
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="border-border bg-popover">
                    {customers?.map((customer) => (
                      <SelectItem
                        key={customer.customer_id}
                        value={customer.customer_id.toString()}
                        className="text-foreground focus:bg-muted"
                      >
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="service_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Service</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="border-border bg-background text-foreground">
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="border-border bg-popover">
                    {services?.map((service) => (
                      <SelectItem key={service.service_id} value={service.service_id.toString()} className="text-foreground focus:bg-muted">
                        {service.name} (£{service.price})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <ExtraServicesSection
          services={services || []}
          extraServiceIds={extraServiceIds}
          onAddExtraService={(serviceId) => setExtraServiceIds([...extraServiceIds, serviceId])}
          onRemoveExtraService={(serviceId) => setExtraServiceIds(extraServiceIds.filter((id) => id !== serviceId))}
        />

        <BookingDateTimeSection control={form.control} timeSlots={timeSlots} />

        <AdditionalDatesSection
          additionalDates={additionalDates}
          timeSlots={timeSlots || []}
          isLoadingTimeSlots={isLoadingTimeSlots}
          onAddDate={addAdditionalDate}
          onRemoveDate={removeAdditionalDate}
          onUpdateAdditionalDate={updateAdditionalDate}
          onUpdateAdditionalTime={updateAdditionalTime}
          onDatePickerOpenChange={handleDatePickerOpenChange}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-11 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Submitting..." : submitLabel}
        </Button>
      </form>
    </Form>
  );
};

export default BookingForm;
