"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InterviewRecord, InterviewQuestionRecord } from "@/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface SummaryProps {
  interview: InterviewRecord;
  question: InterviewQuestionRecord;
  interviewId: string;
}

const Summary: React.FC<SummaryProps> = ({ interview, question: initialQuestion, interviewId }) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const { generateSpeech, fetchApi } = useApi();
  const queryClient = useQueryClient();

  const { data: question } = useQuery<InterviewQuestionRecord>({
    queryKey: ['question', initialQuestion.id],
    queryFn: () => fetchApi(`/interviews/${interviewId}/questions/${initialQuestion.id}`),
    initialData: initialQuestion,
  });

  const updateQuestionMutation = useMutation({
    mutationFn: (updateData: Partial<InterviewQuestionRecord>) => 
      fetchApi(`/interviews/${interviewId}/questions/${initialQuestion.id}`, {
        method: 'PUT',
        body: updateData,
      }),
    onSuccess: (updatedQuestion) => {
      queryClient.setQueryData(['question', initialQuestion.id], updatedQuestion);
      toast.success("Question updated successfully.");
    },
    onError: (error) => {
      console.error("Error updating question:", error);
      toast.error("Failed to update the question. Please try again.");
    },
  });

  const handleGenerateAudio = async () => {
    if (!question?.suggested) return;
    
    setIsGeneratingAudio(true);
    try {
      const audioUrl = await generateSpeech(question.suggested);
      if (!audioUrl) throw new Error("Failed to generate audio URL");
      
      updateQuestionMutation.mutate({ suggestedAudioUrl: audioUrl });
    } catch (error) {
      console.error("Error generating audio:", error);
      toast.error("An error occurred while generating audio. Please try again.");
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade === "A" || grade === "B") return "bg-green-100 text-green-800 shadow-md";
    if (grade === "C") return "bg-yellow-100 text-yellow-800 shadow-md";
    return "bg-red-100 text-red-800 shadow-md";
  };

  if (!question) {
    return <div className="text-center">Question not found.</div>;
  }

  const getPerformanceMessage = (grade: string) => {
    const numericGrade = grade ? parseFloat(grade) : 0;
    if (numericGrade >= 90) return "Excellent job! You've demonstrated outstanding knowledge.";
    if (numericGrade >= 80) return "Great work! You've shown a strong understanding of the topic.";
    if (numericGrade >= 70) return "Good effort! There's room for improvement, but you're on the right track.";
    return "Keep practicing! Focus on the areas highlighted for improvement.";
  };

  return (
    <div
      className="container mx-auto p-4 max-w-4xl"
      data-testid="summary-component"
    >
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
            {!question.suggestedAudioUrl && (
              <Button 
                onClick={handleGenerateAudio} 
                className="mt-2"
                disabled={isGeneratingAudio || !question?.suggested}
              >
                {isGeneratingAudio ? "Generating..." : "Generate Audio"}
              </Button>
            )}
            {question.suggestedAudioUrl && (
              <div className="mt-4">
                <audio controls>
                  <source src={question.suggestedAudioUrl} type="audio/mpeg" />
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
