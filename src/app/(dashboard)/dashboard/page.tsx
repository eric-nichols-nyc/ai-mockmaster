import { Button } from "@/components/ui/button";
import { DashboardQuestionsList } from "./(components)/dashboard-questions-list";
import {
  getAllUserQuestions,
  updateQuestionsFromInterviews,
} from "@/actions/interview-actions";
import Link from "next/link";
import { PlusIcon } from "@radix-ui/react-icons";
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
const updateSkills = async () => {
  // Update skills
  try {
    const result = await updateQuestionsFromInterviews({
      field: "skills",
      batchSize: 100,
    });

    if (result.success) {
      console.log(`Updated ${result.updatedCount} questions with skills`);
    } else {
      console.error(`Update failed: ${result.error}`);
    }
  } catch (error) {
    console.error("Failed to update skills:", error);
  }
};
export default async function DashboardPage() {
  //const test = await testFeedback();
  const update = await updateSkills();
  console.log("update", update);
  const allQuestions = await getAllUserQuestions();
  const questionsWithDefaultSaved = allQuestions.map((q) => ({
    ...q,
    saved: q.saved ?? false,
    jobTitle: q.jobTitle ?? "Untitled Position",
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="mb-10 space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Your Dashboard
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Welcome to your personal interview preparation space. Track your
            progress, review saved questions, and start new practice sessions.
          </p>
        </div>

        {/* Action Section */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/interview">
            <Button
              className="bg-primary hover:bg-primary/90 text-white shadow-lg 
                             hover:shadow-xl transition-all duration-300 
                             px-6 py-2 rounded-full"
            >
              <PlusIcon className="mr-2 h-5 w-5" />
              Start New Interview
            </Button>
          </Link>

          {/* Optional: Add stats or additional actions here */}
          <div className="flex gap-4 text-sm text-gray-600">
            <div className="px-4 py-2 bg-white rounded-lg shadow">
              <p className="font-semibold">
                {questionsWithDefaultSaved.length}
              </p>
              <p>Total Questions</p>
            </div>
            {/* Add more stats as needed */}
          </div>
        </div>

        {/* Questions List */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <DashboardQuestionsList questions={questionsWithDefaultSaved} />
        </div>
      </div>
    </div>
  );
}
