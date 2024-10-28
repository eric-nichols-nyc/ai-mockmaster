import { useQuery } from '@tanstack/react-query'
import { useApi } from '@/lib/api'

export function useInterviews() {
  const { fetchApi } = useApi()

  return useQuery({
    queryKey: ['interviews'],
    queryFn: () => fetchApi('/interviews'),
  })
}

// create fetching an interview by id
export function useInterview(id: string) {
  const { fetchApi } = useApi()
  return useQuery({
    queryKey: ['interview', id],
    queryFn: () => fetchApi(`/interview/${id}`),
  })
}