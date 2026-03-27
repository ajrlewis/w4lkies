
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/sonner";
import { apiRequest } from "@/api/apiService";
import { fetchActiveUsers } from "@/api/userRequests";
import { fetchActiveCustomers } from "@/api/customerRequests";
import { fetchActiveServices } from "@/api/serviceRequests";
import { User, Customer, Service } from "@/types/interfaces";

export const useBookingFilters = () => {
  // Filter states
  const [userFilter, setUserFilter] = useState<string>("all");
  const [customerFilter, setCustomerFilter] = useState<string>("all");
  
  // Available users and customers from API
  const [users, setUsers] = useState<User[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingFilters, setLoadingFilters] = useState<boolean>(true);

  // Fetch users, customers and services for filters
  useEffect(() => {
    const fetchFilterOptions = async () => {
      console.log("Starting to fetch filter options (users, customers, services)");
      setLoadingFilters(true);
      try {
        // Fetch active users
        console.log("Attempting to fetch active users");
        const usersResponse = await fetchActiveUsers();
        setUsers(usersResponse);
        
        // Fetch active customers
        console.log("Attempting to fetch active customers");
        const customersResponse = await fetchActiveCustomers();
        setCustomers(customersResponse);

        // Fetch active services
        console.log("Attempting to fetch active services");
        const servicesResponse = await fetchActiveServices();
        setServices(servicesResponse);

        setLoadingFilters(false);
        console.log("Filter options fetch completed successfully");
      } catch (error) {
        console.error("Error fetching filter options:", error);
        toast.error("Failed to load filter options");
        setLoadingFilters(false);
      }
    };
    
    fetchFilterOptions();
  }, []);

  const resetFilters = () => {
    console.log("Resetting filters to 'all'");
    setUserFilter("all");
    setCustomerFilter("all");
  };

  // Enhanced filter handlers that reset page to 1
  const handleUserFilterChange = (value: string) => {
    console.log(`Changing user filter to ${value}`);
    setUserFilter(value);
  };

  const handleCustomerFilterChange = (value: string) => {
    console.log(`Changing customer filter to ${value}`);
    setCustomerFilter(value);
  };

  return {
    userFilter,
    customerFilter,
    users,
    customers,
    loadingFilters,
    setUserFilter: handleUserFilterChange,
    setCustomerFilter: handleCustomerFilterChange,
    resetFilters
  };
};
