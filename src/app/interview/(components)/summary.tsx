"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InterviewRecord, InterviewQuestionRecord } from "@/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SpeakerLoudIcon } from "@radix-ui/react-icons";

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
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl" data-testid="summary-component">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Interview Analysis
        </h1>

        <Card className="mb-8 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <div className="text-sm text-gray-600 mb-2 flex items-center">
              <span className="bg-primary/10 px-3 py-1 rounded-full">
                {interview.jobTitle}
              </span>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              {question.question}
            </CardTitle>
          </CardHeader>

          <CardContent className="mt-6 space-y-6">
            {/* Grade Section */}
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="font-semibold text-gray-700">Performance Grade</p>
                {question.grade && (
                  <div className="mt-2 flex items-center gap-3">
                    <span className={`text-4xl font-bold ${getGradeColor(question.grade)} px-4 py-2 rounded-lg`}>
                      {question.grade}
                    </span>
                    <p className="text-gray-600 italic flex-1">
                      {getPerformanceMessage(question.grade)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Answer Section */}
            <div className="bg-white p-6 rounded-lg border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <p className="font-semibold text-lg text-gray-800">Your Response</p>
                <Button 
                  onClick={() => setShowAnswer(!showAnswer)}
                  variant="outline"
                  className="text-sm"
                >
                  {showAnswer ? "Hide Transcription" : "Show Transcription"}
                </Button>
              </div>
              
              {question.audioUrl && (
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <audio controls className="w-full">
                    <source src={question.audioUrl} type="audio/mpeg" />
                  </audio>
                </div>
              )}
              
              {showAnswer && (
                <p className="bg-gray-50 p-4 rounded-lg text-gray-700">{question.answer}</p>
              )}
            </div>

            {/* Suggested Answer Section */}
            <div className="bg-green-50/50 p-6 rounded-lg border border-green-100">
              <p className="font-semibold text-lg text-gray-800 mb-4">Model Answer</p>
              <p className="text-gray-700 mb-4">{question?.suggested}</p>
              
              <div className="flex items-center gap-4">
                {!question.suggestedAudioUrl && (
                  <Button 
                    onClick={handleGenerateAudio} 
                    disabled={isGeneratingAudio || !question?.suggested}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium
                               shadow-lg hover:shadow-xl transition-all duration-300
                               flex items-center gap-2 px-6 py-4 rounded-full"
                  >
                    {isGeneratingAudio ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <SpeakerLoudIcon className="h-5 w-5" />
                        Generate Audio Version
                      </>
                    )}
                  </Button>
                )}
                
                {question.suggestedAudioUrl && (
                  <div className="w-full bg-white p-3 rounded-lg">
                    <audio controls className="w-full">
                      <source src={question.suggestedAudioUrl} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
              </div>
            </div>

            {/* Feedback Section */}
            <div className="bg-blue-50/50 p-6 rounded-lg border border-blue-100">
              <p className="font-semibold text-lg text-gray-800 mb-4">Detailed Feedback</p>
              <p className="text-gray-700">{question.feedback}</p>
            </div>

            {/* Improvements Section */}
            <div className="bg-yellow-50/50 p-6 rounded-lg border border-yellow-100">
              <p className="font-semibold text-lg text-gray-800 mb-4">Improvements</p>
              <ul className="list-disc pl-5 space-y-1">
                {question.improvements?.map((improvement, i) => (
                  <li key={i} className="text-gray-700">
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Takeaways Section */}
            <div className="bg-purple-50/50 p-6 rounded-lg border border-purple-100">
              <p className="font-semibold text-lg text-gray-800 mb-4">Key Takeaways</p>
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
    </div>
  );
};

export default Summary;
