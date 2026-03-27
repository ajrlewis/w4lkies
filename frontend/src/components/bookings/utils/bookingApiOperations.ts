
import { toast } from "@/components/ui/sonner";
import { apiRequest } from "@/api/apiService";
import { fetchUpcomingBookings } from "@/api/commonRequests";
import { EnhancedBooking, UpcomingBooking, PaginationInfo } from "@/types/interfaces";
import { mapBookingToEnhanced, groupBookingsByDate } from "./bookingTransformations";

export const fetchAndProcessBookings = async (
  userFilter: string,
  customerFilter: string,
  currentPage: number
): Promise<{
  groupedBookings: any[];
  originalBookings: any[];
  paginationInfo: PaginationInfo;
}> => {
  console.log("Starting to fetch bookings with current filters and page:", {
    userFilter,
    customerFilter,
    page: currentPage
  });
  
  try {
    // Build query parameters based on selected filters and pagination
    const params: Record<string, string> = {};
    if (userFilter !== "all") params["user_id"] = userFilter;
    if (customerFilter !== "all") params["customer_id"] = customerFilter;
    params["page"] = currentPage.toString();
    params["page_size"] = "20";
    
    console.log("Fetching bookings with params:", params);
    
    // Use the updated common request function with pagination
    const response = await fetchUpcomingBookings(params);
    const bookingsData = response.data;
    const paginationInfo = response.pagination;
    
    console.log("Received bookings:", bookingsData);
    console.log("Received pagination:", paginationInfo);
    
    // Map API bookings to our format - now the data comes pre-populated
    console.log("Starting to map bookings with embedded user, customer, and service data");
    const mappedBookings: EnhancedBooking[] = bookingsData.map(mapBookingToEnhanced);
    
    console.log("Finished mapping bookings:", mappedBookings);
    
    // Group bookings by date and merge similar bookings
    const grouped = groupBookingsByDate(mappedBookings);
    
    return {
      groupedBookings: grouped,
      originalBookings: bookingsData,
      paginationInfo
    };
  } catch (error) {
    console.error("Error fetching bookings:", error);
    toast.error("Failed to fetch bookings");
    throw error;
  }
};

export const deleteBookings = async (
  bookingId: string,
  groupedBookings: any[]
): Promise<string> => {
  // Find the booking to delete - use booking_id instead of id
  const bookingToDelete = groupedBookings
    .flatMap(group => group.bookings)
    .find(booking => booking.booking_id?.toString() === bookingId);
  
  if (!bookingToDelete) {
    toast.error("Booking not found");
    throw new Error("Booking not found");
  }

  // Get all booking IDs that need to be deleted (for grouped bookings)
  const bookingIdsToDelete = bookingToDelete.booking_ids || [bookingToDelete.booking_id!];
  
  console.log("Deleting booking IDs:", bookingIdsToDelete);
  
  // Check if we have valid booking IDs
  const validBookingIds = bookingIdsToDelete.filter(id => id !== undefined && id !== null);
  
  if (validBookingIds.length === 0) {
    console.error("No valid booking IDs found for deletion:", bookingToDelete);
    toast.error("No valid booking IDs found for deletion");
    throw new Error("No valid booking IDs found for deletion");
  }
  
  // Delete all individual bookings
  const deletePromises = validBookingIds.map(id => {
    console.log("Making DELETE request for booking ID:", id);
    return apiRequest(`/bookings/${id}`, "DELETE");
  });
  
  await Promise.all(deletePromises);
  
  toast.success(`Booking deleted successfully`);
  return bookingId;
};
