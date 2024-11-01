"use client";

import { useState } from "react";
//import { evaluateInterviewAnswer } from '@/actions/gemini-actions';
import InterviewQuestion from "@/components/interview-question";
import InterviewResults from "@/components/interview-results";
import { useInterview } from "@/hooks/use-tanstack-interview";
interface InterviewProps {
  interviewId: string;
}

// Main Interview component
export default function Interview({ interviewId }: InterviewProps) {
  console.log("InterviewId:", interviewId);
  const [questionView, setQuestionView] = useState<boolean>(true);

  const { interview } = useInterview(interviewId);
  console.log("Interview:", interview);
  const currentQuestion = interview?.questions[0];

 


  if (!currentQuestion) {
    return <div>No questions available</div>;
  }
  // Render the main interview component
  return (
    <div className="flex flex-col items-center justify-center p-4">
      {
        questionView && (
            <InterviewQuestion jobTitle={interview?.jobTitle || ""} question={currentQuestion} setQuestionView={setQuestionView}/>)
      }
      {
        !questionView && (
          <InterviewResults interviewId={interviewId} />
        )
      }

    </div>
  );
}
