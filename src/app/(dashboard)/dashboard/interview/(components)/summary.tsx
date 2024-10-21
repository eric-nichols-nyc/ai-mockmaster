"use client";
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { InterviewRecord, InterviewQuestionRecord } from "@/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInterviews, useApi } from "@/lib/api";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Summary: React.FC = () => {
  const [interview, setInterview] = useState<InterviewRecord | null>(null);
  const [question, setQuestion] = useState<InterviewQuestionRecord | null>(
    null
  );
  const { getInterviewById } = useInterviews();
  const getInterviewByIdRef = useRef(getInterviewById);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();

  const interviewId = params.id as string;
  const questionId = params.qid as string;

  useEffect(() => {
    const fetchInterviewAndQuestion = async () => {
      setError(null);
      try {
        const fetchedInterview = await getInterviewByIdRef.current(interviewId);
        if (fetchedInterview) {
          console.log("fetchedInterview", fetchedInterview);
          const extendedInterview: InterviewRecord = {
            ...fetchedInterview,
            questions: Array.isArray(fetchedInterview.questions)
              ? fetchedInterview.questions
              : Object.values(fetchedInterview.questions || {}),
          };
          setInterview(extendedInterview);

          // Find the specific question
          const foundQuestion = extendedInterview.questions.find(
            (q) => q.id === questionId
          );
          if (foundQuestion) {
            setQuestion(foundQuestion);
            setSuggestedAudioUrl(foundQuestion.suggestedAudioUrl);
          } else {
            setError("Question not found.");
          }
        } else {
          setError("Interview not found.");
        }
      } catch (interviewError) {
        console.error("Error fetching interview:", interviewError);
        setError("Failed to fetch the interview. Please try again.");
      }
      setIsLoading(false);
    };

    fetchInterviewAndQuestion();
  }, [interviewId, questionId]);

  const getGradeColor = (grade: string) => {
    if (grade === "A" || grade === "B")
      return "bg-green-100 text-green-800 shadow-md";
    if (grade === "C") return "bg-yellow-100 text-yellow-800 shadow-md";
    return "bg-red-100 text-red-800 shadow-md";
  };

  const getPerformanceMessage = (grade: string) => {
    const numericGrade = grade ? parseFloat(grade) : 0;
    if (numericGrade >= 90)
      return "Excellent job! You've demonstrated outstanding knowledge.";
    if (numericGrade >= 80)
      return "Great work! You've shown a strong understanding of the topic.";
    if (numericGrade >= 70)
      return "Good effort! There's room for improvement, but you're on the right track.";
    return "Keep practicing! Focus on the areas highlighted for improvement.";
  };

  const [showAnswer, setShowAnswer] = useState(false);
  const [suggestedAudioUrl, setSuggestedAudioUrl] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const { generateSpeech, fetchApi } = useApi();

  const updateQuestionInDatabase = async (questionId: string, updateData: Partial<InterviewQuestionRecord>) => {
    try {
      const filteredUpdateData = Object.fromEntries(
        Object.entries(updateData).filter((v) => v !== undefined)
      );
      console.log("filteredUpdateData", filteredUpdateData);

      if (Object.keys(filteredUpdateData).length > 0) {
        const updatedQuestion = await fetchApi(`/interviews/${interviewId}/questions/${questionId}`, {
          method: 'PUT',
          body: filteredUpdateData,
        });
        return updatedQuestion;
      } else {
        console.warn("No valid properties to update");
        return null;
      }
    } catch (error) {
      console.error("Error updating question in database:", error);
      toast.error("Failed to update the question in the database. Please try again.");
      throw error;
    }
  };

  const handleGenerateAudio = async () => {
    if (!question?.suggested) return;
    
    setIsGeneratingAudio(true);
    try {
      const audioUrl = await generateSpeech(question.suggested);
      if (!audioUrl) {
        throw new Error("Failed to generate audio URL");
      }
      setSuggestedAudioUrl(audioUrl);

      const updatedQuestion = await updateQuestionInDatabase(questionId, { suggestedAudioUrl: audioUrl });

      if (updatedQuestion) {
        setQuestion(prevQuestion => ({...prevQuestion, ...updatedQuestion}));
        toast.success("Suggested answer audio has been generated and saved successfully.");
      } else {
        toast.info("No changes were made to the question in the database.");
      }

    } catch (error) {
      console.error("Error generating audio or updating database:", error);
      toast.error("An error occurred while generating audio or updating the database. Please try again.");
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading question data...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 text-center">{error}</div>;
  }

  if (!interview || !question) {
    return <div className="text-center">Question or interview not found.</div>;
  }

  return (
    <div
      className="container mx-auto p-4 max-w-4xl"
      data-testid="summary-component"
    >
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/dashboard/interview/${interviewId}`}>
              Interview
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Question Summary</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-3xl font-bold mb-6 text-center">Question Summary</h1>
      <Card className="mb-8 shadow-lg">
        <CardHeader className="bg-gray-50">
          <CardTitle className="text-lg font-semibold text-gray-600 mb-2">
            Job Title:{" "}
            <span className="text-primary">{interview.jobTitle}</span>
          </CardTitle>
          <CardTitle className="text-xl font-bold">
            Question: {question.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="mt-4 space-y-4">
          <div className="flex items-center justify-start gap-2">
            <p className="font-semibold text-lg">Grade:</p>
            {question.grade && (
              <span
                className={`text-4xl font-bold ${getGradeColor(
                  question.grade
                )} px-4 py-2 rounded-full`}
              >
                {question.grade || "N/A"}
              </span>
            )}
          </div>
          {question.grade && (
            <p className="italic text-gray-600 mt-2">
              {getPerformanceMessage(question.grade)}
            </p>
          )}
          <div>
            <p className="font-semibold mb-2">Your Answer:</p>
            {question.audioUrl && (
              <div className="mt-4">
                <audio controls>
                  <source src={question.audioUrl} type="audio/mpeg" />
                </audio>
              </div>
            )}
            <Button onClick={() => setShowAnswer(!showAnswer)} className="mb-2">
              {showAnswer ? "Hide" : "Transcribe"}
            </Button>
            {showAnswer && (
              <p className="bg-gray-100 p-3 rounded">{question.answer}</p>
            )}
          </div>
          <div>
            <p className="font-semibold mb-2">Suggested Answer:</p>
            <p className="bg-green-50 p-3 rounded">{question?.suggested}</p>
            {!suggestedAudioUrl && (
              <Button 
                onClick={handleGenerateAudio} 
                className="mt-2"
                disabled={isGeneratingAudio || !question?.suggested}
              >
                {isGeneratingAudio ? "Generating..." : "Generate Audio"}
              </Button>
            )}
            {suggestedAudioUrl && (
              <div className="mt-4">
                <audio controls>
                  <source src={suggestedAudioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
          </div>
          <div>
            <p className="font-semibold mb-2">Feedback:</p>
            <p className="bg-blue-50 p-3 rounded">{question.feedback}</p>
          </div>
          <div>
            <p className="font-semibold mb-2">Improvements:</p>
            <ul className="list-disc pl-5 space-y-1">
              {question.improvements?.map((improvement, i) => (
                <li key={i} className="text-gray-700">
                  {improvement}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-2">Key Takeaways:</p>
            <ul className="list-disc pl-5 space-y-1">
              {question.keyTakeaways?.map((takeaway, i) => (
                <li key={i} className="text-gray-700">
                  {takeaway}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Summary;
