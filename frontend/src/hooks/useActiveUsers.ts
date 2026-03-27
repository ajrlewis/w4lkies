import { useQuery } from '@tanstack/react-query';
import { fetchActiveUsers } from '@/api/userRequests';
import { User } from '@/types/interfaces';

export const useActiveUsers = () => {
  return useQuery<User[], Error>({
    queryKey: ['activeUsers'],
    queryFn: fetchActiveUsers,
    staleTime: 1000 * 60 * 5, // cache for 5 min
  });
};