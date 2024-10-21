import DashboardUI from './(components)/dashboard-ui'
import { getInterviews } from '@/actions/interview-actions'

export default async function DashboardPage() {
  const interviews = await getInterviews()

  return (
      <DashboardUI initialInterviews={interviews} getInterviews={getInterviews} />
  )
}
