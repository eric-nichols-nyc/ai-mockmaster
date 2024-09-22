"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import useInterviewStore from "@/store/interviewStore";
import Visualizer from "./visualizer";
import { useApi } from "@/lib/api";

export default function Interview() {
  const router = useRouter();
  const { fetchApi } = useApi();
  const {
    interview,
    setInterview,
    updateQuestion,
  } = useInterviewStore();

  const [transcription, setTranscription] = useState("");
  const [s3Url, setS3Url] = useState("");
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasRecordingStopped, setHasRecordingStopped] = useState(false);
  const [isInitialFetch, setIsInitialFetch] = useState(true);

  useEffect(() => {
    const fetchCurrentInterview = async () => {
      if (!isInitialFetch) return;
      
      try {
        const response = await fetchApi("/interviews/current", { method: "GET" });
        console.log('response', response);
        if (response && JSON.stringify(response) !== JSON.stringify(interview)) {
          setInterview(response);
        } else if (!response) {
          setErrorMessage("No current interview found. Please start a new interview.");
        }
      } catch (error) {
        console.error("Error fetching interview:", error);
        setErrorMessage("Failed to load the interview. Please try again.");
      } finally {
        setIsInitialFetch(false);
      }
    };

    fetchCurrentInterview();
  }, [fetchApi, setInterview, interview, isInitialFetch]);

  const handleSubmitRecording = useCallback(
    async () => {
      setSaveStatus('saving');
      console.log('test')
      try {
        console.log('try', interview, interview?.currentBlob)
        if (interview && interview.currentBlob) {
          const currentQuestion = interview.questions[0];
          const audioFile = new File([interview.currentBlob], 'audio.webm', { type: interview.currentBlob.type });
          console.log(audioFile)
          // Create a FormData object to send the blob
          const formData = new FormData();
          formData.append('audio', audioFile, 'audio.webm');
          // Post to /api/transcript
          const transcriptResponse = await fetchApi("/transcript", {
            method: "POST",
            body: formData,
          });
          console.log('transcriptResponse', transcriptResponse);

          if (transcriptResponse && transcriptResponse.transcription) {
            setTranscription(transcriptResponse.transcription);

            // Update the interview with the transcription
            const updatedResponse = await fetchApi(`/interviews/${interview.id}/questions/${currentQuestion.id}/answer`, {
              method: "POST",
              body: JSON.stringify({
                answer: transcriptResponse.transcription,
                audioUrl: transcriptResponse.audioUrl, // Use the audioUrl from the transcriptResponse
              }),
            });

            if (updatedResponse && updatedResponse.audioUrl) {
              setS3Url(updatedResponse.audioUrl);
              updateQuestion(currentQuestion.id, { 
                userAnswer: transcriptResponse.transcription, 
                recordedAnswer: updatedResponse.audioUrl 
              });
              setSaveStatus('success');
            } else {
              throw new Error('Invalid response from server');
            }
          } else {
            throw new Error('Invalid response from transcription service');
          }
        } else {
          throw new Error('No interview or audio blob available');
        }
      } catch (error) {
        console.error("Error processing recorded answer:", error);
        setSaveStatus('error');
        setErrorMessage("Failed to process your answer. Please try again.");
      }
    },
    [fetchApi, interview, updateQuestion]
  );

  const handleNextQuestion = useCallback(async () => {
    if (interview) {
      if (interview.questions.length > 1) {
        // Remove the first question as it's been answered
        const updatedQuestions = interview.questions.slice(1);
        setInterview({ ...interview, questions: updatedQuestions });
        setSaveStatus('idle');
        setTranscription("");
        setS3Url("");
        setHasRecordingStopped(false);
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
  }, [interview, setInterview, router, fetchApi]);

  if (errorMessage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-2xl">
          <CardContent>
            <p className="text-red-500 text-center">{errorMessage}</p>
            <Button
              onClick={() => {setIsInitialFetch(true); setErrorMessage(null);}}
              className="mt-4 bg-blue-500 hover:bg-blue-600"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!interview || interview.questions.length === 0) {
    return <div>Loading interview...</div>;
  }

  const currentQuestion = interview.questions[0];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-2xl">
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
            saveStatus={saveStatus}
            currentQuestion={currentQuestion}
            onSubmit={handleSubmitRecording}
            setHasRecordingStopped={setHasRecordingStopped}
          />
          {hasRecordingStopped && saveStatus !== 'success' && (
            <div className="flex justify-center mt-4">
              <Button onClick={handleSubmitRecording} className="bg-blue-500 hover:bg-blue-600">
                Submit
              </Button>
            </div>
          )}
          {saveStatus === 'saving' && (
            <p className="mt-2 text-yellow-500">Processing your answer...</p>
          )}
          {saveStatus === 'success' && (
            <p className="mt-2 text-green-500">Your answer has been processed and saved successfully!</p>
          )}
          {saveStatus === 'error' && (
            <p className="mt-2 text-red-500">There was an error processing your answer. Please try again.</p>
          )}
          {saveStatus === 'success' && (
            <Button
              onClick={handleNextQuestion}
              className="mt-4 bg-green-500 hover:bg-green-600"
              disabled={saveStatus === 'saving'}
            >
              {interview.questions.length > 1 ? "Next Question" : "Finish Interview"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}