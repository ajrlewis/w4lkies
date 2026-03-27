
import { Vet } from '@/types/interfaces';
import { apiRequest, apiRequestWithResponse } from './apiService';

// Type for creating a new vet
export type CreateVetData = Omit<Vet, 'vet_id'>;

// Fetch all vets
export const fetchVets = async (): Promise<Vet[]> => {
  return await apiRequest<Vet[]>('/vets');
};

interface FetchVetsOptions {
  page?: number;
  page_size?: number;
  search?: string;
}

export const fetchVetsPaginated = async (
  options: FetchVetsOptions = {}
): Promise<{ data: Vet[]; response: Response }> => {
  const params = new URLSearchParams();
  if (options.page) params.set("page", options.page.toString());
  if (options.page_size) params.set("page_size", options.page_size.toString());
  if (options.search) params.set("search", options.search);

  const query = params.toString();
  return await apiRequestWithResponse<Vet[]>(`/vets${query ? `?${query}` : ""}`);
};

// Get vet by id
export const fetchVetById = async (id: number): Promise<Vet> => {
  return await apiRequest<Vet>(`/vets/${id}`);
};

// Create a new vet
export const createVet = async (vetData: CreateVetData): Promise<Vet> => {
  return await apiRequest<Vet>('/vets', 'POST', vetData);
};

// Update a vet
export const updateVet = async (id: number, vetData: Partial<Vet>): Promise<Vet> => {
  return await apiRequest<Vet>(`/vets/${id}`, 'PUT', vetData);
};

// Delete a vet
export const deleteVet = async (id: number): Promise<void> => {
  return await apiRequest<void>(`/vets/${id}`, 'DELETE');
};
