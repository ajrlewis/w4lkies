
// User type definition
export interface User {
  user_id: number;
  username: string;
  email: string;
  is_admin: boolean;
  is_active: boolean;
}

// Customer type definition
export interface Customer {
  customer_id: number;
  name: string;
  phone: string;
  email: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  signed_up_on: string;
  is_active: boolean;
}

// Service type definition
export interface Service {
  service_id: number;
  name: string;
  price: number | null;
  description: string;
  duration: number | null;
  is_publicly_offered: boolean;
  is_active: boolean;
}

// Vet type definition
export interface Vet {
  vet_id: number;
  name: string;
  address: string;
  phone: string;
}

// Dog type definition
export interface Dog {
  dog_id: number;
  name: string;
  date_of_birth: string;
  breed: string;
  is_allowed_treats: boolean;
  is_allowed_off_the_lead: boolean;
  is_allowed_on_social_media: boolean;
  is_neutered_or_spayed: boolean;
  behavioral_issues: string;
  medical_needs: string;
  customer_id: number;
  vet_id: number;
  customer?: {
    customer_id?: number;
    name: string;
    is_active?: boolean;
  };
  vet?: {
    vet_id?: number;
    name: string;
  };
}
 
// Booking type definition
export interface Booking {
  booking_id: number;
  date: string;
  time: string;
  customer_id: number;
  service_id: number;
  user_id: number;
}

// New API response structure for upcoming bookings
export interface UpcomingBooking {
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

// Enhanced booking with UI display properties
export interface EnhancedBooking {
  id: string;
  user_name: string;
  user_id?: number;
  customer_name: string;
  customer_id?: number;
  service_name: string;
  extra_services?: string[];
  date: string;
  time: string;
  time_value?: string;
  price?: number;
  booking_id?: number; // Individual booking ID
  booking_ids?: number[]; // Array of booking IDs for grouped bookings
}

// Interface for grouped bookings display
export interface GroupedBooking {
  date: string;
  formattedDate: string;
  bookings: EnhancedBooking[];
  totalPrice: string;
}

// Invoice type definition
export interface Invoice {
  invoice_id: number;
  customer_id: number;
  date_start: string;
  date_end: string;
  date_issued: string;
  date_due: string;
  date_paid: string;
  reference: string;
  price_subtotal: number;
  price_discount: number;
  price_total: number;
  bookings?: any[];
  customer?: Customer;
}

// Interface for pagination metadata
export interface PaginationInfo {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
  next_page: number | null;
  prev_page: number | null;
}

// Default pagination values
export const DEFAULT_PAGINATION: PaginationInfo = {
  page: 1,
  page_size: 20,
  total_items: 0,
  total_pages: 1,
  has_next: false,
  has_prev: false,
  next_page: null,
  prev_page: null
};
