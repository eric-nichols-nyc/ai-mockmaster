"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import useInterviewStore, { ExtendedInterview, QuestionData } from '@/store/interviewStore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInterviews } from "@/lib/api";
import { Button } from '@/components/ui/button';

const Summary: React.FC = () => {
  const { interview, setInterview } = useInterviewStore();
  const { getInterviewById } = useInterviews();
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const interviewId = params.id as string;

  useEffect(() => {
    const fetchInterview = async () => {
      if (!interview || interview.id !== interviewId) {
        try {
          const fetchedInterview = await getInterviewById(interviewId);
          if (fetchedInterview) {
            const extendedInterview: ExtendedInterview = {
              ...fetchedInterview,
              questions: Array.isArray(fetchedInterview.questions)
                ? fetchedInterview.questions
                : Object.values(fetchedInterview.questions || {})
            };
            setInterview(extendedInterview);
          }
        } catch (error) {
          console.error('Error fetching interview:', error);
        }
      }
      setIsLoading(false);
    };

    fetchInterview();
  }, [interview, interviewId, getInterviewById, setInterview]);

  if (isLoading) {
    return <div>Loading interview data...</div>;
  }

  if (!interview) {
    return <div>Interview not found.</div>;
  }

  const questions = Array.isArray(interview.questions)
    ? interview.questions
    : Object.values(interview.questions);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Interview Summary</h1>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Job Title: {interview.jobTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Job Description: {interview.jobDescription}</p>
        </CardContent>
      </Card>
      {questions.map((question: QuestionData, index: number) => (
        <Card key={question.id} className="mb-4">
          <CardHeader>
            <CardTitle>Question {index + 1}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2"><strong>Question:</strong> {question.question}</p>
            <p><strong>Suggested Answer:</strong> {question.suggested}</p>
            <p className="mb-2"><strong>Your Answer:</strong> {question.answer}</p>
            <p className="mb-2"><strong>Feedback:</strong> {question.feedback}</p>
            <p className="mb-2"><strong>Grade:</strong> {question.grade}</p>
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
          <Button>Save question</Button>
        </Card>
      ))}
    </div>
  );
};

export default Summary;