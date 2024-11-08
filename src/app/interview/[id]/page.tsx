"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInterviews } from "@/lib/api";
import { InterviewRecord, InterviewQuestionRecord } from "@/db/schema";
import { format } from "date-fns";

const InterviewPage = () => {
  const [interview, setInterview] = useState<InterviewRecord | undefined>(undefined);
  const [savedQuestions, setSavedQuestions] = useState<InterviewQuestionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getInterviewById } = useInterviews();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    const fetchInterviewData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Assuming we have the interview ID. You might need to adjust this based on your routing.
        const interviewId = id; // Replace with actual ID or fetch from route params
        const fetchedInterview = await getInterviewById(interviewId);
        if (fetchedInterview) {
          setInterview(fetchedInterview);
          // Filter saved questions
          const savedQuestions = fetchedInterview.questions.filter(
            (q) => q.saved === true
          );
          setSavedQuestions(savedQuestions);
        } else {
          setError("Interview not found.");
        }
      } catch (err) {
        console.error("Error fetching interview:", err);
        setError("Failed to fetch the interview. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterviewData();
  }, []);

  if (isLoading) {
    return <div>Loading interview data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!interview) {
    return <div>No interview data available.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{interview.jobTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-2">
            <strong>Date:</strong>{" "}
            {format(new Date(interview.date), "MMMM d, yyyy")}
          </p>
          <p>
            <strong>Job Description:</strong> {interview.jobDescription}
          </p>
        </CardContent>
      </Card>

      <h2 className="text-xl font-semibold mb-4">Saved Questions</h2>
      {savedQuestions.length === 0 ? (
        <p>No saved questions for this interview.</p>
      ) : (
        savedQuestions.map((question, index) => (
          <Card key={question.id} className="mb-4">
            <CardHeader>
              <CardTitle>Question {index + 1}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2">
                <strong>Your Answer:</strong> {question.answer}
              </p>
              <p>
                <strong>Feedback:</strong> {question.feedback}
              </p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default InterviewPage;
