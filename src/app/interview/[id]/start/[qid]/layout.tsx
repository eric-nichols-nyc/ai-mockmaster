import { 
  HydrationBoundary, 
  QueryClient,
  dehydrate 
} from "@tanstack/react-query";
import { getInterviewAndQuestion } from "@/actions/interview-actions";

// Move this outside the component
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Prevent refetching on window focus for all queries by default
      refetchOnWindowFocus: false,
    },
  },
});

export default async function InterviewLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string; qid?: string };
}) {
  // Conditionally prefetch based on whether qid exists
  if (params.qid) {
    await queryClient.prefetchQuery({
      queryKey: ['interview-question', params.id, params.qid],
      queryFn: () => getInterviewAndQuestion({ questionId: params.qid! }),
    });
  }
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}
