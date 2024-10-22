import { DashboardHeader } from './(components)/dashboard-header'
import { DashboardQuestionsList } from './(components)/dashboard-questions-list'
import { getAllUserQuestions } from '@/actions/interview-actions'

export default async function DashboardPage() {
  const allQuestions = await getAllUserQuestions()
  const questionsWithDefaultSaved = allQuestions.map(q => ({
    ...q,
    saved: q.saved ?? false
  }))

  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader />
      <DashboardQuestionsList questions={questionsWithDefaultSaved} />
    </div>
  )
}
