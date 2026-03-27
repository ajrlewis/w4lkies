
import { Service } from '@/types/interfaces';
import { apiRequest, apiRequestWithResponse } from './apiService';

// Type for creating a new service - making all fields from the Service type required except service_id
export type CreateServiceData = Omit<Service, 'service_id'>;

// Fetch all services
export const fetchServices = async (): Promise<Service[]> => {
  return await apiRequest<Service[]>('/services');
};

interface FetchServicesOptions {
  page?: number;
  page_size?: number;
  is_active?: boolean;
  is_publicly_offered?: boolean;
  search?: string;
}

export const fetchServicesPaginated = async (
  options: FetchServicesOptions = {}
): Promise<{ data: Service[]; response: Response }> => {
  const params = new URLSearchParams();
  if (options.page) params.set("page", options.page.toString());
  if (options.page_size) params.set("page_size", options.page_size.toString());
  if (typeof options.is_active === "boolean") params.set("is_active", String(options.is_active));
  if (typeof options.is_publicly_offered === "boolean") {
    params.set("is_publicly_offered", String(options.is_publicly_offered));
  }
  if (options.search) params.set("search", options.search);

  const query = params.toString();
  return await apiRequestWithResponse<Service[]>(`/services${query ? `?${query}` : ""}`);
};

// Fetch active services
export const fetchActiveServices = async (): Promise<Service[]> => {
  return await apiRequest<Service[]>('/services/?is_active=true');
};

// Fetch services that are both active and publicly offered
export const fetchPublicActiveServices = async (): Promise<Service[]> => {
  return await apiRequest<Service[]>('/services/?is_active=true&is_publicly_offered=true');
};

// Get service by id
export const fetchServiceById = async (id: number): Promise<Service> => {
  return await apiRequest<Service>(`/services/${id}`);
};

// Create a new service
export const createService = async (serviceData: CreateServiceData): Promise<Service> => {
  return await apiRequest<Service>('/services', 'POST', serviceData);
};

// Update a service
export const updateService = async (id: number, serviceData: Partial<Service>): Promise<Service> => {
  return await apiRequest<Service>(`/services/${id}`, 'PUT', serviceData);
};

// Delete a service
export const deleteService = async (id: number): Promise<void> => {
  return await apiRequest<void>(`/services/${id}`, 'DELETE');
};
