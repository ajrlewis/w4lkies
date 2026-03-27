import { useState, useEffect } from "react";
import { GroupedBooking, PaginationInfo } from "@/types/interfaces";
import { useBookingFilters } from "./useBookingFilters";
import { fetchAndProcessBookings, deleteBookings } from "../utils/bookingApiOperations";

export const useBookingsData = () => {
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

  // Store original booking data for deletion
  const [originalBookings, setOriginalBookings] = useState<any[]>([]);

  // Use the filter hook
  const {
    userFilter,
    customerFilter,
    users,
    customers,
    loadingFilters,
    setUserFilter: handleUserFilterChange,
    setCustomerFilter: handleCustomerFilterChange,
    resetFilters: resetFiltersOnly
  } = useBookingFilters();

  // Fetch bookings with filters and pagination when filter values or page changes
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const result = await fetchAndProcessBookings(userFilter, customerFilter, currentPage);
        
        setGroupedBookings(result.groupedBookings);
        setOriginalBookings(result.originalBookings);
        setPaginationInfo(result.paginationInfo);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        // In case of error, set empty bookings to avoid UI errors
        setGroupedBookings([]);
      }
    };
    
    // Only fetch when users and customers are loaded (to have proper mapping data)
    if (!loadingFilters) {
      console.log("Filter options loaded, now fetching bookings");
      fetchBookings();
    } else {
      console.log("Waiting for filter options to load before fetching bookings");
    }
  }, [userFilter, customerFilter, currentPage, loadingFilters]);

  // Create a refetch function that can be called manually
  const refetchBookings = async () => {
    if (!loadingFilters) {
      setLoading(true);
      try {
        const result = await fetchAndProcessBookings(userFilter, customerFilter, currentPage);
        setGroupedBookings(result.groupedBookings);
        setOriginalBookings(result.originalBookings);
        setPaginationInfo(result.paginationInfo);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        setGroupedBookings([]);
      }
    }
  };

  const handleDelete = async (bookingId: string) => {
    try {
      await deleteBookings(bookingId, groupedBookings);
      
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
      // Error handling is done in deleteBookings function
    }
  };

  const resetFilters = () => {
    console.log("Resetting filters and page to 1");
    resetFiltersOnly();
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    console.log(`Changing to page ${page}`);
    setCurrentPage(page);
  };

  // Enhanced filter handlers that reset page to 1
  const setUserFilter = (value: string) => {
    console.log(`Changing user filter to ${value} and resetting page to 1`);
    handleUserFilterChange(value);
    setCurrentPage(1);
  };

  const setCustomerFilter = (value: string) => {
    console.log(`Changing customer filter to ${value} and resetting page to 1`);
    handleCustomerFilterChange(value);
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
    setUserFilter,
    setCustomerFilter,
    handleDelete,
    resetFilters,
    handlePageChange,
    refetchBookings
  };
};
