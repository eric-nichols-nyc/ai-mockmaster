import { useAuth } from '@clerk/nextjs';

export const useApi = () => {
  const { getToken } = useAuth();

  const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
    const token = await getToken();
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };

    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'An error occurred');
    }

    return response.json();
  };

  return { fetchApi };
};