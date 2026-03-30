import { Customer, UpcomingBooking, User } from "@/types/interfaces";
import { apiRequest, apiRequestWithResponse } from "./apiService";

interface FetchBookingsOptions {
  page?: number;
  page_size?: number;
  user_id?: number;
  customer_id?: number;
  search?: string;
}

export type BookingFilterUser = Pick<User, "user_id" | "username">;
export type BookingFilterCustomer = Pick<Customer, "customer_id" | "name">;

export interface BookingFilterOptionsResponse {
  users: BookingFilterUser[];
  customers: BookingFilterCustomer[];
}

export interface BookingCreatePayload {
  date: string;
  time: string;
  customer_id: number;
  service_id: number;
  user_id: number;
}

const buildBookingsQuery = (options: FetchBookingsOptions = {}) => {
  const params = new URLSearchParams();
  if (options.page) params.set("page", options.page.toString());
  if (options.page_size) params.set("page_size", options.page_size.toString());
  if (typeof options.user_id === "number") params.set("user_id", options.user_id.toString());
  if (typeof options.customer_id === "number") params.set("customer_id", options.customer_id.toString());
  if (options.search) params.set("search", options.search);
  return params.toString();
};

export const fetchBookingTimes = async (): Promise<[string, string][]> => {
  return await apiRequest<[string, string][]>("/bookings/time_choices");
};

export const fetchBookingFilterOptions = async (
  view: "upcoming" | "history"
): Promise<BookingFilterOptionsResponse> => {
  return await apiRequest<BookingFilterOptionsResponse>(
    `/bookings/filter_options?view=${view}`
  );
};

export const fetchUpcomingBookingsPaginated = async (
  options: FetchBookingsOptions = {}
): Promise<{ data: UpcomingBooking[]; response: Response }> => {
  const query = buildBookingsQuery(options);
  return await apiRequestWithResponse<UpcomingBooking[]>(
    `/bookings/upcoming${query ? `?${query}` : ""}`
  );
};

export const fetchBookingHistoryPaginated = async (
  options: FetchBookingsOptions = {}
): Promise<{ data: UpcomingBooking[]; response: Response }> => {
  const query = buildBookingsQuery(options);
  return await apiRequestWithResponse<UpcomingBooking[]>(
    `/bookings/history${query ? `?${query}` : ""}`
  );
};

export const updateBooking = async (
  bookingId: number,
  payload: { date: string; time: string; user_id: number; customer_id: number }
) => {
  return await apiRequest(`/bookings/${bookingId}`, "PUT", payload);
};

export const createBooking = async (payload: BookingCreatePayload) => {
  return await apiRequest("/bookings", "POST", payload);
};

export const deleteBooking = async (bookingId: number) => {
  return await apiRequest(`/bookings/${bookingId}`, "DELETE");
};
