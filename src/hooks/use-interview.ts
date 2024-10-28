import { useApi } from '@/lib/api';
import { InterviewRecord, InterviewQuestionRecord } from '@/db/schema';

export const useInterview = () => {
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
};
