'use client';

import { useState, useCallback } from 'react';

interface UseApiState<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
}

export function useApi<T>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const execute = useCallback(async (apiCall: () => Promise<T>) => {
    setState({ data: null, error: null, isLoading: true });
    try {
      const data = await apiCall();
      setState({ data, error: null, isLoading: false });
      return data;
    } catch (err: any) {
      const error = err.message || 'Something went wrong';
      setState({ data: null, error, isLoading: false });
      throw err;
    }
  }, []);

  return { ...state, execute };
}
