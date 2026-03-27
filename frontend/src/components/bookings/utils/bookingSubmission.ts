
import { format } from "date-fns";
import { toast } from "@/components/ui/sonner";
import { apiRequest } from "@/api/apiService";
import type { AdditionalDate } from "../AdditionalDatesSection";

interface BookingFormData {
  user_id: string;
  service_id: string;
  extra_services?: string[];
  customer_id: string;
  date: Date;
  time: string;
}

export const submitBookings = async (
  data: BookingFormData,
  additionalDates: AdditionalDate[],
  extraServiceIds: string[]
) => {
  console.log("=== BOOKING FORM DATA SUBMISSION ===");
  console.log("Raw form data:", data);
  console.log("Additional dates:", additionalDates);
  console.log("Extra service IDs:", extraServiceIds);

  // Validate that additional dates have times selected
  const invalidDates = additionalDates.filter(d => !d.time);
  if (invalidDates.length > 0) {
    toast.error("Please select a time for all additional dates");
    throw new Error("Invalid additional dates");
  }

  // Format the booking dates
  const datetimes = [
    {
      date: format(data.date, "yyyy-MM-dd"),
      time: data.time
    },
    ...additionalDates.map(d => ({
      date: format(d.date, "yyyy-MM-dd"),
      time: d.time
    }))
  ];

  console.log("Formatted datetimes:", datetimes);

  // Combine main service and extra services into service_ids array
  const serviceIds = [
    parseInt(data.service_id),
    ...(data.extra_services?.map(id => parseInt(id)) || []),
    ...extraServiceIds.map(id => parseInt(id))
  ];

  console.log("Combined service IDs:", serviceIds);

  const customerId = parseInt(data.customer_id);
  const userId = parseInt(data.user_id);

  console.log("Parsed IDs - Customer:", customerId, "User:", userId);

  console.log("Creating bookings with nested loop approach...");
  
  // Create bookings using nested loops
  const createdBookings = [];
  let successCount = 0;
  let totalBookings = datetimes.length * serviceIds.length;

  console.log(`Total bookings to create: ${totalBookings}`);

  for (const datetime of datetimes) {
    for (const serviceId of serviceIds) {
      const bookingData = {
        date: datetime.date,
        time: datetime.time,
        customer_id: customerId,
        service_id: serviceId,
        user_id: userId
      };

      console.log("Creating individual booking:", bookingData);
      console.log("Posting to /bookings endpoint with data:", JSON.stringify(bookingData, null, 2));
      
      try {
        const response = await apiRequest("/bookings", "POST", bookingData);
        createdBookings.push(response);
        successCount++;
        console.log("Successfully created booking:", response);
      } catch (error) {
        console.error("Failed to create individual booking:", error);
        toast.error(`Failed to create booking for ${datetime.date} at ${datetime.time}`);
      }
    }
  }

  console.log(`Booking creation completed. Success: ${successCount}/${totalBookings}`);

  if (successCount === totalBookings) {
    toast.success(`Successfully created ${successCount} booking${successCount > 1 ? 's' : ''}!`);
  } else if (successCount > 0) {
    toast.warning(`Created ${successCount} of ${totalBookings} bookings. Some bookings failed.`);
  } else {
    toast.error("Failed to create any bookings. Please try again.");
    throw new Error("Failed to create any bookings");
  }

  return { successCount, totalBookings };
};
