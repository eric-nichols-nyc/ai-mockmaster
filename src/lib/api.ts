import { useAuth } from '@clerk/nextjs';
import { Interview, QuestionData } from '@/types';

// Define a custom type that extends RequestInit
type CustomRequestInit = Omit<RequestInit, 'body'> & {
  body?: FormData | string | object;
};

export const useApi = () => {
  const { getToken } = useAuth();

  const fetchApi = async (endpoint: string, options: CustomRequestInit = {}) => {
    const token = await getToken();
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      ...Object.fromEntries(
        Object.entries(options.headers || {}).map(([key, value]) => [key, String(value)])
      ),
    };
    // Only set Content-Type to application/json if it's not FormData
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers,
      // Don't stringify the body if it's FormData
      body: options.body instanceof FormData ? options.body : 
            typeof options.body === 'string' ? options.body : 
            options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('api error = ',error);
      throw new Error(error.message || 'An error occurred');
    }

    return response.json();
  };

  return { fetchApi };
};

export const useInterviews = () => {
  const { fetchApi } = useApi();

  const getInterviewById = async (id: string): Promise<Interview | null> => {
    try {
      const interview = await fetchApi(`/interviews/${id}`, { method: 'GET' });
      return interview;
    } catch (error) {
      console.error('Error fetching interview:', error);
      return null;
    }
  };

  const getQuestionById = async (interviewId: string, questionId: string): Promise<QuestionData | null> => {
    try {
      const question = await fetchApi(`/interviews/${interviewId}/questions/${questionId}`, { method: 'GET' });
      return question;
    } catch (error) {
      console.error('Error fetching question:', error);
      return null;
    }
  };

  const getCompletedInterviews = async (): Promise<Interview[]> => {
    try {
      const completedInterviews = await fetchApi('/interviews/list/completed', { method: 'GET' });
      return completedInterviews;
    } catch (error) {
      console.error('Error fetching completed interviews:', error);
      return [];
    }
  };

  return { getInterviewById, getQuestionById, getCompletedInterviews };
};