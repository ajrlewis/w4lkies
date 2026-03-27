import { useQuery } from '@tanstack/react-query';
import { fetchActiveCustomers } from '@/api/customerRequests';
import { Customer } from '@/types/interfaces';

export const useActiveCustomers = () => {
  return useQuery<Customer[], Error>({
    queryKey: ['activeCustomers'],
    queryFn: fetchActiveCustomers,
    staleTime: 1000 * 60 * 5, // cache for 5 min
  });
};