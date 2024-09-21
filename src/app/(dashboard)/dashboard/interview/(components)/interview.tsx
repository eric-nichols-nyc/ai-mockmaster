"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVoiceVisualizer } from "react-voice-visualizer";
import useInterviewStore from "@/store/interviewStore";
import Visualizer from "./visualizer";
import { useApi } from "@/lib/api";

export default function Interview() {
  const router = useRouter();
  const { fetchApi } = useApi();
  const {
    interview,
    setInterview,
    setCurrentQuestionIndex,
    updateQuestion,
  } = useInterviewStore();

  const [isRecording, setIsRecording] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [hasRecordingStopped, setHasRecordingStopped] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [s3Url, setS3Url] = useState("");
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { startRecording, stopRecording } = useVoiceVisualizer();

  useEffect(() => {
    const fetchCurrentInterview = async () => {
      try {
        const response = await fetchApi("/interviews/current", { method: "GET" });
        if (response) {
          setInterview(response);
        } else {
          setErrorMessage("No current interview found. Please start a new interview.");
        }
      } catch (error) {
        console.error("Error fetching interview:", error);
        setErrorMessage("Failed to load the interview. Please try again.");
      }
    };

    fetchCurrentInterview();
  }, [fetchApi, setInterview]);

  const handleStartRecording = useCallback(() => {
    setIsRecording(true);
    setIsTimerRunning(true);
    setHasRecordingStopped(false);
    startRecording();
  }, [startRecording]);

  const handleStopRecording = useCallback(
    async (transcription: string, audioUrl: string) => {
      setIsRecording(false);
      setIsTimerRunning(false);
      setHasRecordingStopped(true);
      setTranscription(transcription);
      setS3Url(audioUrl);
      setSaveStatus('saving');

      try {
        if (interview) {
          const currentQuestion = interview.questions[interview.currentQuestionIndex];
          await fetchApi(`/interviews/${interview.id}/questions/${currentQuestion.id}/answer`, {
            method: "POST",
            body: JSON.stringify({ 
              answer: transcription, 
              audioUrl 
            }),
          });
          updateQuestion(currentQuestion.id, { userAnswer: transcription, recordedAnswer: audioUrl });
          setSaveStatus('success');
        }
      } catch (error) {
        console.error("Error saving recorded answer:", error);
        setSaveStatus('error');
        setErrorMessage("Failed to save your answer. Please try again.");
      }
    },
    [fetchApi, interview, updateQuestion]
  );

  const handleNextQuestion = useCallback(async () => {
    if (interview) {
      if (interview.currentQuestionIndex < interview.questions.length - 1) {
        setCurrentQuestionIndex(interview.currentQuestionIndex + 1);
        setSaveStatus('idle');
        setHasRecordingStopped(false);
        setTranscription("");
        setS3Url("");
      } else {
        // Mark the interview as complete
        try {
          await fetchApi(`/interviews/${interview.id}/complete`, {
            method: "POST",
          });
          router.push("/dashboard/interview/summary");
        } catch (error) {
          console.error("Error completing interview:", error);
          setErrorMessage("Failed to complete the interview. Please try again.");
        }
      }
    }
  }, [interview, setCurrentQuestionIndex, router, fetchApi]);

  if (errorMessage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-2xl">
          <CardContent>
            <p className="text-red-500 text-center">{errorMessage}</p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4 bg-blue-500 hover:bg-blue-600"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!interview) {
    return <div>Loading interview...</div>;
  }

  const currentQuestion = interview.questions[interview.currentQuestionIndex];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Interview Question {interview.currentQuestionIndex + 1}/{interview.questions.length}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg mb-4">{currentQuestion.question}</p>
          <div className="flex justify-center mb-4">
            <Image
              src="/images/interview/avatar.png"
              alt="Interview Avatar"
              width={200}
              height={200}
              className="rounded-full"
            />
          </div>
          <Visualizer
            isRecording={isRecording}
            isTimerRunning={isTimerRunning}
            hasRecordingStopped={hasRecordingStopped}
            transcription={transcription}
          />
          <div className="flex justify-center mt-4">
            {!isRecording && !hasRecordingStopped && (
              <Button onClick={handleStartRecording} className="bg-blue-500 hover:bg-blue-600">
                Start Recording
              </Button>
            )}
            {isRecording && (
              <Button onClick={() => stopRecording(handleStopRecording)} className="bg-red-500 hover:bg-red-600">
                Stop Recording
              </Button>
            )}
          </div>
          {saveStatus === 'saving' && (
            <p className="mt-2 text-yellow-500">Saving your answer...</p>
          )}
          {saveStatus === 'success' && (
            <p className="mt-2 text-green-500">Your answer has been saved successfully!</p>
          )}
          {saveStatus === 'error' && (
            <p className="mt-2 text-red-500">There was an error saving your answer. Please try again.</p>
          )}
          {hasRecordingStopped && (
            <Button
              onClick={handleNextQuestion}
              className="mt-4 bg-green-500 hover:bg-green-600"
              disabled={saveStatus === 'saving'}
            >
              {interview.currentQuestionIndex < interview.questions.length - 1 ? "Next Question" : "Finish Interview"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
