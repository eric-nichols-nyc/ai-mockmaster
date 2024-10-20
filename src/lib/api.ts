import { useAuth } from '@clerk/nextjs';
import { InterviewRecord, InterviewQuestionRecord } from '@/db/schema';

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

  const generateSpeech = async (text: string): Promise<string> => {
    try {
      const response = await fetchApi('/openai/text-to-speech', {
        method: 'POST',
        body: { text },
      });
      return response.audioUrl;
    } catch (error) {
      console.error('Error generating speech:', error);
      throw error;
    }
  };

  return { fetchApi, generateSpeech };
};

export const useInterviews = () => {
  const { fetchApi } = useApi();

  const getInterviewById = async (id: string): Promise<InterviewRecord | null> => {
    try {
      const interview = await fetchApi(`/interviews/${id}`, { method: 'GET' });
      return interview;
    } catch (error) {
      console.error('Error fetching interview:', error);
      return null;
    }
  };

  const getQuestionById = async (interviewId: string, questionId: string): Promise<InterviewQuestionRecord | null> => {
    try {
      const question = await fetchApi(`/interviews/${interviewId}/questions/${questionId}`, { method: 'GET' });
      return question;
    } catch (error) {
      console.error('Error fetching question:', error);
      return null;
    }
  };

  const getCompletedInterviews = async (): Promise<InterviewRecord[]> => {
    try {
      const completedInterviews = await fetchApi('/interviews/list/completed', { method: 'GET' });
      return completedInterviews;
    } catch (error) {
      console.error('Error fetching completed interviews:', error);
      return [];
    }
  };

  const updateQuestionSaved = async (interviewId: string, questionId: string, saved: boolean): Promise<void> => {
    try {
      await fetchApi(`/interviews/${interviewId}/questions/${questionId}/save`, {
        method: 'PUT',
        body: { saved },
      });
    } catch (error) {
      console.error('Error updating question saved status:', error);
      throw error;
    }
  };

  const getSavedInterviewQuestions = async (): Promise<InterviewRecord[]> => {
    try {
      const interviewsWithSavedQuestions = await fetchApi('/interviews/list/saved-questions', { method: 'GET' });
      return interviewsWithSavedQuestions;
    } catch (error) {
      console.error('Error fetching interviews with saved questions:', error);
      return [];
    }
  };

  const deleteInterview = async (id: string): Promise<void> => {
    try {
      await fetchApi(`/interviews/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error('Error deleting interview:', error);
      throw error;
    }
  };

  return {
    getInterviewById,
    getQuestionById,
    getCompletedInterviews,
    updateQuestionSaved,
    getSavedInterviewQuestions,
    deleteInterview,
  };
}

// New function for server-side use

