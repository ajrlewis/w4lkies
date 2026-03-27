
import { Customer } from '@/types/interfaces';
import { apiRequest, apiRequestWithResponse } from './apiService';

// Type for creating a new customer - making all fields from the Customer type required except customer_id
export type CreateCustomerData = Omit<Customer, 'customer_id'>;
export type UpdateCustomerData = Partial<Omit<Customer, 'customer_id'>>;

interface FetchCustomersOptions {
  page?: number;
  page_size?: number;
  is_active?: boolean;
  search?: string;
}

// Fetch all customers
export const fetchCustomers = async (): Promise<Customer[]> => {
  return await apiRequest<Customer[]>('/customers');
};

export const fetchCustomersPaginated = async (
  options: FetchCustomersOptions = {}
): Promise<{ data: Customer[]; response: Response }> => {
  const params = new URLSearchParams();
  if (options.page) params.set("page", options.page.toString());
  if (options.page_size) params.set("page_size", options.page_size.toString());
  if (typeof options.is_active === "boolean") params.set("is_active", String(options.is_active));
  if (options.search) params.set("search", options.search);

  const query = params.toString();
  return await apiRequestWithResponse<Customer[]>(`/customers${query ? `?${query}` : ""}`);
};

// Fetch active customers
export const fetchActiveCustomers = async (): Promise<Customer[]> => {
  return await apiRequest<Customer[]>('/customers?is_active=true');
};

// Get customer by id
export const fetchCustomerById = async (id: number): Promise<Customer> => {
  return await apiRequest<Customer>(`/customers/${id}`);
};

// Create a new customer
export const createCustomer = async (customerData: CreateCustomerData): Promise<Customer> => {
  return await apiRequest<Customer>('/customers', 'POST', customerData);
};

// Update a customer
export const updateCustomer = async (id: number, customerData: UpdateCustomerData): Promise<Customer> => {
  return await apiRequest<Customer>(`/customers/${id}`, 'PUT', customerData);
};

// Delete a customer
export const deleteCustomer = async (id: number): Promise<void> => {
  return await apiRequest<void>(`/customers/${id}`, 'DELETE');
};
