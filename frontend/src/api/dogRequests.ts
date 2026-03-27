
import { Dog } from '@/types/interfaces';
import { apiRequest, apiRequestWithResponse } from './apiService';

// Type for creating a new dog - making all fields from the Dog type required except dog_id
export type CreateDogData = Omit<Dog, 'dog_id'>;

// Fetch all dogs
export const fetchDogs = async (): Promise<Dog[]> => {
  return await apiRequest<Dog[]>('/dogs');
};

interface FetchDogsOptions {
  page?: number;
  page_size?: number;
  search?: string;
}

export const fetchDogsPaginated = async (
  options: FetchDogsOptions = {}
): Promise<{ data: Dog[]; response: Response }> => {
  const params = new URLSearchParams();
  if (options.page) params.set("page", options.page.toString());
  if (options.page_size) params.set("page_size", options.page_size.toString());
  if (options.search) params.set("search", options.search);

  const query = params.toString();
  return await apiRequestWithResponse<Dog[]>(`/dogs${query ? `?${query}` : ""}`);
};

// Get dog by id
export const fetchDogById = async (id: number): Promise<Dog> => {
  return await apiRequest<Dog>(`/dogs/${id}`);
};

export const fetchDogBreeds = async (): Promise<string[]> => {
  return await apiRequest<string[]>("/dogs/breeds");
};

// Create a new dog
export const createDog = async (dogData: CreateDogData): Promise<Dog> => {
  return await apiRequest<Dog>('/dogs', 'POST', dogData);
};

// Update a dog
export const updateDog = async (id: number, dogData: Partial<Dog>): Promise<Dog> => {
  return await apiRequest<Dog>(`/dogs/${id}`, 'PUT', dogData);
};

// Delete a dog
export const deleteDog = async (id: number): Promise<void> => {
  return await apiRequest<void>(`/dogs/${id}`, 'DELETE');
};
