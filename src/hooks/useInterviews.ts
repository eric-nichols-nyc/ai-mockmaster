import { useQuery } from '@tanstack/react-query'
import { useApi } from '@/lib/api'

export function useInterviews() {
  const { fetchApi } = useApi()

  return useQuery({
    queryKey: ['interviews'],
    queryFn: () => fetchApi('/interviews'),
  })
}
