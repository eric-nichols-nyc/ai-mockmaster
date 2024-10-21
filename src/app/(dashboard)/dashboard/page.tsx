import DashboardUI from './(components)/dashboard-ui'
import { getInterviews } from '@/actions/interview-actions'

export default async function DashboardPage() {
  const interviews = await getInterviews()
  console.log(interviews)

  return (
      <DashboardUI initialInterviews={interviews} />
  )
}
