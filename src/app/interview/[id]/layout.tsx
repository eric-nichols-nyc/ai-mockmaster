import { Suspense } from "react";
import { 
  HydrationBoundary, 
  QueryClient,
  dehydrate 
} from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { getInterviewById } from "@/actions/interview-actions";

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
  params: { id: string };
}) {
  // Prefetch the interview data
  await queryClient.prefetchQuery({
    queryKey: ['interview', params.id],
    queryFn: () => getInterviewById({ id: params.id }),
  });

  return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        {children}
      </HydrationBoundary>
  );
}
