import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getInterviewById, 
  //updateInterviewAnswer,
  //updateInterviewFeedback,
  updateInterviewQuestion
} from "@/actions/interview-actions";
import { InterviewRecord } from "@/db/schema";

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

  const updateMutation = useMutation({
    mutationFn: updateInterviewQuestion,
    onSuccess: (updatedQuestion) => {
      queryClient.setQueryData(['interview', id], (oldData: InterviewRecord | undefined) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          questions: oldData.questions.map(q => 
            q.id === updatedQuestion.id ? updatedQuestion : q
          ),
        };
      });
    },
  });

  // Mutation for updating answer
//   const answerMutation = useMutation<InterviewQuestionRecord>({
//     mutationFn: updateInterviewAnswer,
//     onSuccess: (updatedQuestion) => {
//       // Optimistically update the cache
//       queryClient.setQueryData(['interview', id], (oldData: InterviewRecord | undefined) => {
//         if (!oldData) return oldData;
        
//         return {
//           ...oldData,
//           questions: oldData.questions.map(q => 
//             q.id === updatedQuestion.id ? updatedQuestion : q
//           ),
//         };
//       });
//     },
//   });

  // Mutation for updating feedback
//   const feedbackMutation = useMutation<InterviewQuestionRecord>({
//     mutationFn: updateInterviewFeedback,
//     onSuccess: (updatedQuestion) => {
//       queryClient.setQueryData(['interview', id], (oldData: InterviewRecord | undefined) => {
//         if (!oldData) return oldData;
        
//         return {
//           ...oldData,
//           questions: oldData.questions.map(q => 
//             q.id === updatedQuestion.id ? updatedQuestion : q
//           ),
//         };
//       });
//     },
//   });

  return {
    interview,
    isLoading,
    error,
    refetch,
    //updateAnswer: answerMutation.mutate,
    //isUpdatingAnswer: answerMutation.isPending,
    //updateFeedback: feedbackMutation.mutate,
    //isUpdatingFeedback: feedbackMutation.isPending,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
  };
}
