import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { InterviewRecord } from '@/db/schema'
import { useCallback } from 'react'

const fetchInterviews = async (): Promise<InterviewRecord[]> => {
  const response = await axios.get('/api/interviews')
  return response.data
}

const deleteInterviewRequest = async (id: string): Promise<void> => {
  await axios.delete(`/api/interviews/${id}`)
}

export function useInterviews(initialInterviews: InterviewRecord[]) {
  const queryClient = useQueryClient()

  const { data: interviews, isLoading, isError, error, refetch } = useQuery<InterviewRecord[], Error>({
    queryKey: ['interviews'],
    queryFn: fetchInterviews,
    initialData: initialInterviews,
    staleTime: 1000, // Consider the data stale after 1 second
  })

  const deleteInterviewMutation = useMutation({
    mutationFn: deleteInterviewRequest,
    onMutate: async (deletedId) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['interviews'] })

      // Snapshot the previous value
      const previousInterviews = queryClient.getQueryData<InterviewRecord[]>(['interviews'])

      // Optimistically update to the new value
      queryClient.setQueryData<InterviewRecord[]>(['interviews'], old => old ? old.filter(interview => interview.id !== deletedId) : [])

      // Return a context object with the snapshotted value
      return { previousInterviews }
    },
    onError: (err, newTodo, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData<InterviewRecord[]>(['interviews'], context?.previousInterviews)
    },
    onSettled: () => {
      // Always refetch after error or success:
      queryClient.invalidateQueries({ queryKey: ['interviews'] })
    },
  })

  const deleteInterview = useCallback(async (id: string) => {
    await deleteInterviewMutation.mutateAsync(id)
  }, [deleteInterviewMutation])

  return {
    interviews,
    isLoading,
    isError,
    error,
    deleteInterview,
    refetch,
  }
}
