"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import useInterviewStore, { ExtendedInterview } from '@/store/interviewStore';
import { QuestionData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInterviews } from "@/lib/api";
import { Button } from '@/components/ui/button';

const Summary: React.FC = () => {
  const { interview, setInterview } = useInterviewStore();
  const { getInterviewById, getQuestionById } = useInterviews();
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const interviewId = params.id as string;

  useEffect(() => {
    const fetchInterviewAndQuestion = async () => {
      if (!interview || interview.id !== interviewId) {
        setError(null);
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

            // Fetch the first question
            try {
              const questions = extendedInterview.questions;
              if (Array.isArray(questions) && questions.length > 0) {
                const firstQuestionId = questions[0].id;
                const fetchedQuestion = await getQuestionById(interviewId, firstQuestionId);
                console.log('fetched = ', fetchedQuestion)
                setCurrentQuestion(fetchedQuestion);
              }
            } catch (questionError) {
              console.error('Error fetching question:', questionError);
              setError('Failed to fetch the question. Please try again.');
            }
          } else {
            setError('Interview not found.');
          }
        } catch (interviewError) {
          console.error('Error fetching interview:', interviewError);
          setError('Failed to fetch the interview. Please try again.');
        }
      }
      setIsLoading(false);
    };

    fetchInterviewAndQuestion();
  }, [interview, interviewId, getInterviewById, getQuestionById, setInterview]);

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
      <h1 className="text-2xl font-bold mb-4">Interview Summary</h1>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Job Title: {interview.jobTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Job Description: {interview.jobDescription}</p>
        </CardContent>
      </Card>
      {currentQuestion && (
        <Card className="mb-4">
          <CardHeader>
          <p className="mb-2"><strong>{currentQuestion.question}</strong></p>
          </CardHeader>
          <CardContent>
            <p><strong>Suggested Answer:</strong> {currentQuestion.suggested}</p>
            <p className="mb-2"><strong>Your Answer:</strong> {currentQuestion.answer}</p>
            <p className="mb-2"><strong>Feedback:</strong> {currentQuestion.feedback}</p>
            <p className="mb-2"><strong>Grade:</strong> {currentQuestion.grade}</p>
            <div className="mb-2">
              <strong>Improvements:</strong>
              <ul className="list-disc pl-5">
                {currentQuestion.improvements?.map((improvement: string, i: number) => (
                  <li key={i}>{improvement}</li>
                ))}
              </ul>
            </div>
            <div>
              <strong>Key Takeaways:</strong>
              <ul className="list-disc pl-5">
                {currentQuestion.keyTakeaways?.map((takeaway: string, i: number) => (
                  <li key={i}>{takeaway}</li>
                ))}
              </ul>
            </div>
          </CardContent>
          <Button>Save question</Button>
        </Card>
      )}
    </div>
  );
};

export default Summary;