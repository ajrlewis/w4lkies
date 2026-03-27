
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/sonner";
import { apiRequest } from "@/api/apiService";
import { useActiveUsers } from '@/hooks/useActiveUsers';
import { useActiveCustomers } from '@/hooks/useActiveCustomers';
import { useActiveServices } from '@/hooks/useActiveServices';

export const useBookingFormData = () => {
  const [timeSlots, setTimeSlots] = useState<[string, string][]>([]);
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);

  // Fetch time slots from API
  useEffect(() => {
    const fetchTimeSlots = async () => {
      setIsLoadingTimeSlots(true);
      try {
        const data = await apiRequest<[string, string][]>("/bookings/time_choices");
        setTimeSlots(data);
      } catch (error) {
        console.error("Error fetching time slots:", error);
        toast.error("Failed to load available time slots");
      } finally {
        setIsLoadingTimeSlots(false);
      }
    };

    fetchTimeSlots();
  }, []);

  const { data: services = [], isLoading: isLoadingServices } = useActiveServices();
  const { data: users = [], isLoading: isLoadingUsers } = useActiveUsers();
  const { data: customers = [], isLoading: isLoadingCustomers } = useActiveCustomers();

  return {
    timeSlots,
    isLoadingTimeSlots,
    services,
    isLoadingServices,
    customers,
    isLoadingCustomers,
    users,
    isLoadingUsers,
  };
};
