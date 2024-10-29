import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInterviewById, updateInterviewQuestion } from "@/actions/interview-actions";
import { InterviewRecord } from "@/db/schema";

// Define types for different kinds of updates
type QuestionUpdatePayload = Partial<{
  answer: string;
  audioUrl: string;
  feedback: string;
  grade: string;
  improvements: string[];
  keyTakeaways: string[];
  saved: boolean;
  skills: string[];
}>;

interface UpdateQuestionParams {
  interviewId: string;
  questionId: string;
  updates: QuestionUpdatePayload;
}

export function useInterview(id: string) {
  const queryClient = useQueryClient();

  // Query for fetching interview data
  const {
    data: interview,
    isLoading,
    error,
    refetch,
  } = useQuery<InterviewRecord>({
    queryKey: ['interview', id] as const,
    queryFn: async ({ queryKey }) => {
      const [interviewId] = queryKey;
      const data = await getInterviewById({ id: interviewId as string });
      if (!data) throw new Error('Interview not found');
      return data as InterviewRecord;
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });

  // Single mutation that handles all types of question updates
  const updateMutation = useMutation({
    mutationFn: async ({ interviewId, questionId, updates }: UpdateQuestionParams) => {
      const response = await updateInterviewQuestion({
        interviewId,
        questionId,
        updates,
      });
      return response;
    },
    onSuccess: (updatedQuestion) => {
      queryClient.setQueryData(['interview', id], (oldData: InterviewRecord | undefined) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          questions: oldData.questions.map(q => 
            q.id === updatedQuestion.id ? updatedQuestion : q
          )
        };
      });
    },
  });

  // Generic update function that can handle any valid question updates
  const updateQuestion = (questionId: string, updates: QuestionUpdatePayload) => {
    return updateMutation.mutate({
      interviewId: id,
      questionId,
      updates,
    });
  };

  return {
    interview,
    isLoading,
    error,
    refetch,
    updateQuestion,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
  };
}