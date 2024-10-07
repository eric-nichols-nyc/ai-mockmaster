"use client"
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ExtendedInterview } from "@/store/interviewStore";
import { QuestionData } from "@/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useInterviews } from "@/lib/api";
import { Button } from "@/components/ui/button";

const Summary: React.FC = () => {
  const [interview, setInterview] = useState<ExtendedInterview | null>(null);
  const [savedQuestions, setSavedQuestions] = useState<QuestionData[]>([]);
  const { getInterviewById, updateQuestionSaved } = useInterviews();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();

  const interviewId = params.id as string;

  useEffect(() => {
    const fetchInterviewAndQuestions = async () => {
      setError(null);
      try {
        const fetchedInterview = await getInterviewById(interviewId);
        if (fetchedInterview) {
          const extendedInterview: ExtendedInterview = {
            ...fetchedInterview,
            questions: Array.isArray(fetchedInterview.questions)
              ? fetchedInterview.questions
              : Object.values(fetchedInterview.questions || {}),
          };
          setInterview(extendedInterview);

          // Filter saved questions
          const saved = extendedInterview.questions.filter(q => q.saved === true);
          setSavedQuestions(saved);
        } else {
          setError("Interview not found.");
        }
      } catch (interviewError) {
        console.error("Error fetching interview:", interviewError);
        setError("Failed to fetch the interview. Please try again.");
      }
      setIsLoading(false);
    };

    fetchInterviewAndQuestions();
  }, [interviewId, getInterviewById]);

  const handleUnsave = async (questionId: string) => {
    try {
      await updateQuestionSaved(interviewId, questionId, false);
      // Update the local state
      setSavedQuestions(prev => prev.filter(q => q.id !== questionId));
    } catch (error) {
      console.error("Error unsaving question:", error);
      // Handle error (e.g., show an error message to the user)
    }
  };

  if (isLoading) {
    return <div>Loading interview data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!interview) {
    return <div>Interview not found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Interview Summary - Saved Questions</h1>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{interview.jobTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{interview.jobDescription}</p>
        </CardContent>
      </Card>
      {savedQuestions.length === 0 ? (
        <p>No saved questions for this interview.</p>
      ) : (
        savedQuestions.map((question) => (
          <Card key={question.id} className="mb-4">
            <CardHeader>
              <CardTitle>{question.question}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2">
                <strong>Grade:</strong> {question.grade}
              </p>
              <p className="mb-2">
                <strong>Your Answer:</strong> {question.answer}
              </p>
              <p className="mb-2">
                <strong>Suggested Answer:</strong> {question.suggested}
              </p>
              <p className="mb-2">
                <strong>Feedback:</strong> {question.feedback}
              </p>
              <div className="mb-2">
                <strong>Improvements:</strong>
                <ul className="list-disc pl-5">
                  {question.improvements?.map((improvement, i) => (
                    <li key={i}>{improvement}</li>
                  ))}
                </ul>
              </div>
              <div>
                <strong>Key Takeaways:</strong>
                <ul className="list-disc pl-5">
                  {question.keyTakeaways?.map((takeaway, i) => (
                    <li key={i}>{takeaway}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleUnsave(question.id)}>Unsave Question</Button>
            </CardFooter>
          </Card>
        ))
      )}
    </div>
  );
};

export default Summary;