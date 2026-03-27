
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useSearchReset = (setSearchTerm: (term: string) => void) => {
  const location = useLocation();

  useEffect(() => {
    setSearchTerm('');
  }, [location.pathname, setSearchTerm]);
};
