import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { toast } from "@/components/ui/sonner";
import { apiRequest } from "@/api/apiService";
import { fetchActiveCustomers } from "@/api/commonRequests";
import { User, Customer, GroupedBooking, EnhancedBooking, PaginationInfo } from "@/types/interfaces";

// Interface for historical booking response
interface HistoricalBooking {
  booking_id: number;
  date: string;
  time: string;
  customer: {
    customer_id: number;
    name: string;
  };
  service: {
    service_id: number;
    name: string;
    price: number;
  };
  user: {
    user_id: number;
    username: string;
  };
}

// Interface for booking history response with pagination
interface BookingHistoryResponse {
  data: HistoricalBooking[];
  pagination: PaginationInfo;
}

export const useBookingHistoryData = () => {
  const [groupedBookings, setGroupedBookings] = useState<GroupedBooking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    page: 1,
    page_size: 20,
    total_items: 0,
    total_pages: 1,
    has_next: false,
    has_prev: false,
    next_page: null,
    prev_page: null
  });
  
  // Filter states
  const [userFilter, setUserFilter] = useState<string>("all");
  const [customerFilter, setCustomerFilter] = useState<string>("all");
  
  // Available users and customers from API
  const [users, setUsers] = useState<User[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingFilters, setLoadingFilters] = useState<boolean>(true);

  // Store original booking data for deletion
  const [originalBookings, setOriginalBookings] = useState<HistoricalBooking[]>([]);

  // Fetch users and customers for filters
  useEffect(() => {
    const fetchFilterOptions = async () => {
      console.log("Starting to fetch filter options (users, customers) for history");
      setLoadingFilters(true);
      try {
        // Fetch active users
        console.log("Attempting to fetch users from /users/?is_active=true");
        const usersResponse = await apiRequest<User[]>(`/users/?is_active=true`);
        console.log("Users API response:", usersResponse);
        
        if (!Array.isArray(usersResponse)) {
          console.error("Error: Users response is not an array:", usersResponse);
          toast.error("Invalid users data format received");
        } else {
          console.log(`Received ${usersResponse.length} users for history filters`);
        }
        
        setUsers(usersResponse);
        
        // Fetch active customers using the common request function
        console.log("Attempting to fetch customers from /customers/?is_active=true");
        const customersResponse = await fetchActiveCustomers();
        console.log("Customers API response received for history:", 
          Array.isArray(customersResponse) ? `${customersResponse.length} customers` : "Invalid format");
        setCustomers(customersResponse);
        
        setLoadingFilters(false);
        console.log("Filter options fetch completed successfully for history");
      } catch (error) {
        console.error("Error fetching filter options for history:", error);
        toast.error("Failed to load filter options");
        setLoadingFilters(false);
      }
    };
    
    fetchFilterOptions();
  }, []);

  // Fetch booking history with filters and pagination
  useEffect(() => {
    const fetchBookingHistory = async () => {
      console.log("Starting to fetch booking history with current filters and page:", {
        userFilter,
        customerFilter,
        page: currentPage
      });
      
      setLoading(true);
      try {
        // Build query parameters based on selected filters and pagination
        const params: Record<string, string> = {};
        if (userFilter !== "all") params["user_id"] = userFilter;
        if (customerFilter !== "all") params["customer_id"] = customerFilter;
        params["page"] = currentPage.toString();
        params["page_size"] = "20";
        
        console.log("Fetching booking history with params:", params);
        
        // Build query string
        let endpoint = '/bookings/history';
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== 'all') {
            queryParams.append(key, value);
          }
        });
        
        const queryString = queryParams.toString();
        if (queryString) {
          endpoint += `?${queryString}`;
        }
        
        console.log("Making API request to:", endpoint);
        
        // Make the API request and extract pagination from headers
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000"}${endpoint}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });
        
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        
        const bookingsData = await response.json();
        
        // Store original bookings for deletion purposes
        setOriginalBookings(bookingsData);
        
        // Extract pagination from headers
        const paginationHeader = response.headers.get('x-pagination');
        let pagination: PaginationInfo = {
          page: 1,
          page_size: 20,
          total_items: 0,
          total_pages: 1,
          has_next: false,
          has_prev: false,
          next_page: null,
          prev_page: null
        };
        
        if (paginationHeader) {
          try {
            const parsedPagination = JSON.parse(paginationHeader);
            pagination = {
              page: parsedPagination.page || 1,
              page_size: parsedPagination.page_size || 20,
              total_items: parsedPagination.total_items || 0,
              total_pages: parsedPagination.total_pages || 1,
              has_next: parsedPagination.has_next || false,
              has_prev: parsedPagination.has_prev || false,
              next_page: parsedPagination.next_page || null,
              prev_page: parsedPagination.prev_page || null
            };
            console.log('Parsed pagination from header for history:', pagination);
          } catch (error) {
            console.error('Failed to parse pagination header for history:', error);
          }
        }
        
        setPaginationInfo(pagination);
        
        console.log("Received booking history:", bookingsData);
        console.log("Received pagination for history:", pagination);
        
        // Map API bookings to our format - now the data comes pre-populated
        console.log("Starting to map booking history with embedded user, customer, and service data");
        const mappedBookings: EnhancedBooking[] = bookingsData.map((booking: HistoricalBooking) => {
          const [datePart] = booking.date.split('T');
          const [timePart] = booking.time.split('.');
          
          console.log("Mapping history booking with ID:", booking.booking_id);
          
          return {
            id: `${booking.customer.customer_id}-${booking.service.service_id}-${datePart}-${timePart}`,
            user_name: booking.user.username,
            customer_name: booking.customer.name,
            service_name: booking.service.name,
            date: datePart,
            time: timePart.substring(0, 5), // Format time as HH:MM
            price: booking.service.price,
            booking_id: booking.booking_id // Store the actual booking ID for deletion
          };
        });
        
        console.log("Finished mapping booking history:", mappedBookings);
        
        // Group bookings by date
        const bookingsByDate: { [key: string]: EnhancedBooking[] } = {};
        mappedBookings.forEach(booking => {
          if (!bookingsByDate[booking.date]) {
            bookingsByDate[booking.date] = [];
          }
          bookingsByDate[booking.date].push(booking);
        });
        
        // Merge bookings with the same user, customer, date and time
        Object.keys(bookingsByDate).forEach(date => {
          const bookingsForDate = bookingsByDate[date];
          
          // Create a map to track bookings with the same user, customer, and time
          const bookingMap: { [key: string]: EnhancedBooking } = {};
          
          bookingsForDate.forEach(booking => {
            // Create a unique key for each user+customer+time combination
            const bookingKey = `${booking.user_name}_${booking.customer_name}_${booking.time}`;
            
            if (bookingMap[bookingKey]) {
              // If we already have a booking with this key, merge the services
              const existingBooking = bookingMap[bookingKey];
              
              // If we don't already have extra_services, create the array with just the new service
              if (!existingBooking.extra_services) {
                existingBooking.extra_services = [booking.service_name];
              } else {
                // Add this booking's service to the extra_services array
                existingBooking.extra_services.push(booking.service_name);
              }
              
              // Add the price
              existingBooking.price = (existingBooking.price || 0) + (booking.price || 0);
              
              // Store all booking IDs for deletion - THIS IS THE KEY FIX
              if (!existingBooking.booking_ids) {
                existingBooking.booking_ids = [existingBooking.booking_id!];
              }
              existingBooking.booking_ids.push(booking.booking_id!);
              
              console.log("Merged history booking IDs:", existingBooking.booking_ids);
              
              // Keep the original service name (the first one)
              // existingBooking.service_name stays the same
            } else {
              // If this is the first booking with this key, add it to our map
              bookingMap[bookingKey] = { 
                ...booking,
                booking_ids: [booking.booking_id!] // Initialize with the first booking ID
              };
              console.log("Created new history booking group with ID:", booking.booking_id);
            }
          });
          
          // Convert the map back to an array
          bookingsByDate[date] = Object.values(bookingMap);
        });
        
        // Sort bookings within each date group by time
        Object.keys(bookingsByDate).forEach(date => {
          bookingsByDate[date].sort((a, b) => a.time.localeCompare(b.time));
        });
        
        console.log("Grouped and merged booking history by date:", Object.keys(bookingsByDate));
        
        // Convert to grouped format with total price
        const grouped = Object.entries(bookingsByDate).map(([date, bookings]) => {
          // Calculate total price for the day
          const totalPrice = bookings.reduce((sum, booking) => sum + (booking.price || 0), 0);
          
          return {
            date,
            formattedDate: format(parseISO(date), "EEEE, MMMM d, yyyy"),
            bookings,
            totalPrice: `£${totalPrice.toFixed(2)}`
          };
        });
        
        // Sort dates chronologically (newest first for history)
        grouped.sort((a, b) => b.date.localeCompare(a.date));
        
        console.log("Final grouped booking history:", grouped.length);
        setGroupedBookings(grouped);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching booking history:", error);
        toast.error("Failed to fetch booking history");
        setLoading(false);
        
        // In case of error, set empty bookings to avoid UI errors
        setGroupedBookings([]);
      }
    };
    
    // Only fetch when users and customers are loaded (to have proper mapping data)
    if (!loadingFilters) {
      console.log("Filter options loaded, now fetching booking history");
      fetchBookingHistory();
    } else {
      console.log("Waiting for filter options to load before fetching booking history");
    }
  }, [userFilter, customerFilter, currentPage, loadingFilters]);

  const handleDelete = async (bookingId: string) => {
    console.log("=== BOOKING HISTORY DELETE DEBUG ===");
    console.log("Attempting to delete booking with ID:", bookingId);
    
    try {
      // Find the booking to delete - use booking_id instead of id
      const bookingToDelete = groupedBookings
        .flatMap(group => group.bookings)
        .find(booking => booking.booking_id?.toString() === bookingId);
      
      if (!bookingToDelete) {
        console.error("Booking not found for deletion");
        toast.error("Booking not found");
        return;
      }

      // Get all booking IDs that need to be deleted (for grouped bookings)
      const bookingIdsToDelete = bookingToDelete.booking_ids || [bookingToDelete.booking_id!];
      
      console.log("Deleting history booking IDs:", bookingIdsToDelete);
      
      // Check if we have valid booking IDs
      const validBookingIds = bookingIdsToDelete.filter(id => id !== undefined && id !== null);
      
      if (validBookingIds.length === 0) {
        console.error("No valid booking IDs found for deletion:", bookingToDelete);
        toast.error("No valid booking IDs found for deletion");
        return;
      }
      
      // Delete all individual bookings
      const deletePromises = validBookingIds.map(id => {
        console.log("Making DELETE request for history booking ID:", id);
        return apiRequest(`/bookings/${id}`, "DELETE");
      });
      
      await Promise.all(deletePromises);
      
      toast.success(`Booking deleted successfully`);
      
      // Update UI by removing the deleted booking - use booking_id for comparison
      setGroupedBookings(prevGroups => {
        const updatedGroups = prevGroups.map(group => ({
          ...group,
          bookings: group.bookings.filter(booking => booking.booking_id?.toString() !== bookingId)
        }));
        
        // Remove any date groups that no longer have bookings
        return updatedGroups.filter(group => group.bookings.length > 0);
      });
      
    } catch (error) {
      console.error("Error deleting booking:", error);
      toast.error("Failed to delete booking");
    }
  };

  const resetFilters = () => {
    console.log("Resetting history filters to 'all' and page to 1");
    setUserFilter("all");
    setCustomerFilter("all");
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    console.log(`Changing history to page ${page}`);
    setCurrentPage(page);
  };

  // Enhanced filter handlers that reset page to 1
  const handleUserFilterChange = (value: string) => {
    console.log(`Changing history user filter to ${value} and resetting page to 1`);
    setUserFilter(value);
    setCurrentPage(1);
  };

  const handleCustomerFilterChange = (value: string) => {
    console.log(`Changing history customer filter to ${value} and resetting page to 1`);
    setCustomerFilter(value);
    setCurrentPage(1);
  };

  return {
    groupedBookings,
    loading,
    currentPage,
    paginationInfo,
    userFilter,
    customerFilter,
    users,
    customers,
    loadingFilters,
    setUserFilter: handleUserFilterChange,
    setCustomerFilter: handleCustomerFilterChange,
    handleDelete,
    resetFilters,
    handlePageChange
  };
};
