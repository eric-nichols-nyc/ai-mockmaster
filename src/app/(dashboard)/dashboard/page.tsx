import { DashboardHeader } from './(components)/dashboard-header'
import { DashboardQuestionsList } from './(components)/dashboard-questions-list'
import { getAllUserQuestions } from '@/actions/interview-actions'
import { currentUser } from '@clerk/nextjs/server'
//import { getFeedbackTool } from "@/actions/feedback-action";
// import { FeedbackDisplay } from '@/components/feedback-display';
//import { FeedbackStreamComponent } from '@/components/feedback-stream';
// const testFeedback = async () => {
//   const feedback = await getFeedbackTool({
//     question:"How do you handle conflicting priorities?",
//     answer: "I first assess the urgency and importance of each task. Then I communicate with stakeholders to align on expectations and deadlines. I use project management tools to track progress and adjust priorities as needed.",
//     position:  "Senior Project Manager",
//     skills: ["communication", "prioritization"],
//   });
//   return feedback;
// };
export default async function DashboardPage() {
  //const test = await testFeedback();
  const user = await currentUser();
  console.log(user);  
  const allQuestions = await getAllUserQuestions()
  const questionsWithDefaultSaved = allQuestions.map(q => ({
    ...q,
    saved: q.saved ?? false
  }))

  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader />
      <DashboardQuestionsList questions={questionsWithDefaultSaved} />
      {/* <FeedbackDisplay feedback={test} /> */}
    </div>
  )
}
