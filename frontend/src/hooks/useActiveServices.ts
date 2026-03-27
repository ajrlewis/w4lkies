import { useQuery } from '@tanstack/react-query';
import { fetchActiveServices } from '@/api/serviceRequests';
import { Service } from '@/types/interfaces';

export const useActiveServices = () => {
  return useQuery<Service[], Error>({
    queryKey: ['activeServices'],
    queryFn: fetchActiveServices,
    staleTime: 1000 * 60 * 5, // cache for 5 min
  });
};