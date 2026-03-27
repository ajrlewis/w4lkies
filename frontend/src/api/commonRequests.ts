
import { Customer, Service, Booking, UpcomingBooking, PaginationInfo } from '@/types/interfaces';
import { apiRequest, buildApiUrl } from './apiService';

// Helper function to fetch active customers
export const fetchActiveCustomers = async (): Promise<Customer[]> => {
  return await apiRequest<Customer[]>('/customers/?is_active=true');
};

// Helper function to fetch all services
export const fetchAllServices = async (): Promise<Service[]> => {
  return await apiRequest<Service[]>('/services');
};

// Updated interface for upcoming bookings response with pagination
export interface UpcomingBookingsResponse {
  data: UpcomingBooking[];
  pagination: PaginationInfo;
}

// Helper function to fetch upcoming bookings with pagination
export const fetchUpcomingBookings = async (queryParams?: Record<string, string>): Promise<UpcomingBookingsResponse> => {
  // Build query string if params are provided
  let endpoint = '/bookings/upcoming';
  
  if (queryParams && Object.keys(queryParams).length > 0) {
    const params = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== 'all') {
        params.append(key, value);
      }
    });
    
    const queryString = params.toString();
    if (queryString) {
      endpoint += `?${queryString}`;
    }
  }
  
  console.log("Making API request to:", endpoint);
  
  // Make the API request and extract pagination from headers
  const response = await fetch(buildApiUrl(endpoint), {
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json",
    },
  });
  
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  
  const data = await response.json();
  const paginationHeader = response.headers.get('X-Pagination');
  
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
      console.log('Parsed pagination from header:', pagination);
    } catch (error) {
      console.error('Failed to parse pagination header:', error);
    }
  } else {
    console.warn('No x-pagination header found in response');
  }
  
  return {
    data,
    pagination
  };
};

// Helper function to fetch booking history with pagination
export const fetchBookingHistory = async (page: number = 1, pageSize: number = 10): Promise<Booking[]> => {
  return await apiRequest<Booking[]>(`/bookings/history?page=${page}&page_size=${pageSize}`);
};
