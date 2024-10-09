"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import useInterviewStore, {
  useBlobStore,
  ExtendedInterview
} from "@/store/interviewStore";
import Visualizer from "./visualizer";
import { useApi } from "@/lib/api";
import { Loader2, Mic } from "lucide-react";
import CountdownTimer from "@/components/countdown-timer";
import { FeedbackData, InterviewQuestion } from '@/types';

export default function Interview() {
  const router = useRouter();
  const { fetchApi } = useApi();
  const { interview, setInterview, updateQuestion } = useInterviewStore();
  const { currentBlob } = useBlobStore();
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasRecordingStopped, setHasRecordingStopped] = useState(false);
  const [hasRecordingStarted, setHasRecordingStarted] = useState(false);
  const [isInitialFetch, setIsInitialFetch] = useState(true);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isSubmittingRecording, setIsSubmittingRecording] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<"generate" | "thinking" | "ready">("generate");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleTimerComplete = useCallback(() => {
    console.log("Interview time is up!");
    setErrorMessage("Interview time has ended. Please submit your final answer.");
    setShowTimer(false);
    setHasRecordingStopped(true);
    setHasTimedOut(true)
  }, []);

  useEffect(() => {
    const fetchCurrentInterview = async () => {
      if (!isInitialFetch) return;

      try {
        const response = await fetchApi("/interviews/current", {
          method: "GET",
        });
        if (response && JSON.stringify(response) !== JSON.stringify(interview)) {
          setInterview(response as ExtendedInterview);
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

    if (hasRecordingStarted) {
      if (!showTimer) {
        setShowTimer(true);
      }
    }
    if(hasRecordingStopped){
      setShowTimer(false);
    }

    fetchCurrentInterview();
    console.log('interview = ', interview)
  }, [fetchApi, setInterview, interview, isInitialFetch, hasRecordingStarted,hasRecordingStopped]);

  const handleSubmitRecording = useCallback(async () => {
    setSaveStatus("saving");
    setIsSubmittingRecording(true);
    try {
      if (interview && currentBlob) {
        const currentQuestion = Array.isArray(interview.questions) 
          ? interview.questions[0] 
          : Object.values(interview.questions)[0] as InterviewQuestion;
        
        const audioFile = new File([currentBlob], "audio.webm", {
          type: currentBlob.type,
        });
        const formData = new FormData();
        formData.append("audio", audioFile, "audio.webm");
        
        const transcriptResponse = await fetchApi("/openai/transcribe", {
          method: "POST",
          body: formData,
        });

        if (transcriptResponse && transcriptResponse.transcription) {
          const updatedResponse = await fetchApi(
            `/interviews/${interview.id}/questions/${currentQuestion.id}/answer`,
            {
              method: "POST",
              body: JSON.stringify({
                answer: transcriptResponse.transcription,
                audioUrl: transcriptResponse.audioUrl,
              }),
            }
          );

          if (updatedResponse && updatedResponse.audioUrl) {
            updateQuestion(currentQuestion.id, {
              answer: transcriptResponse.transcription,
              audioUrl: updatedResponse.audioUrl,
            });
            setSaveStatus("success");
            setFeedbackStatus("generate");
          } else {
            throw new Error("Invalid response from server");
          }
        } else {
          throw new Error("Invalid response from transcription service");
        }
      } else {
        throw new Error("No interview or audio blob available");
      }
    } catch (error) {
      console.error("Error processing recorded answer:", error);
      setSaveStatus("error");
      setErrorMessage("Failed to process your answer. Please try again.");
    } finally {
      setIsSubmittingRecording(false);
    }
  }, [fetchApi, interview, updateQuestion, currentBlob]);

  const updateCurrentQuestionWithFeedback = useCallback(async (feedbackData: FeedbackData) => {
    if (interview && (Array.isArray(interview.questions) ? interview.questions.length > 0 : Object.keys(interview.questions).length > 0)) {
      const currentQuestion = Array.isArray(interview.questions) 
        ? interview.questions[0] 
        : Object.values(interview.questions)[0] as InterviewQuestion;

      const updatedQuestion: InterviewQuestion = {
        ...currentQuestion,
        feedback: feedbackData.feedback,
        grade: feedbackData.grade.letter,
        improvements: feedbackData.improvements,
        keyTakeaways: feedbackData.keyTakeaways,
        skills: currentQuestion.skills || []
      };

      const update = await fetchApi(`/interviews/${interview.id}/questions/${updatedQuestion.id}`, {
        method: "POST",
        body: JSON.stringify(updatedQuestion),
      });

      console.log('update ', update)

      updateQuestion(updatedQuestion.id, updatedQuestion);
      setFeedbackStatus("ready");
    }
  }, [interview, updateQuestion, fetchApi]);

  const handleFeedbackButton = useCallback(async () => {
    if (feedbackStatus === "generate") {
      setFeedbackStatus("thinking");
      if (interview && interview.jobTitle && interview.questions) {
        const currentQuestion = Array.isArray(interview.questions) 
          ? interview.questions[0] 
          : Object.values(interview.questions)[0] as InterviewQuestion;

        try {
          const response = await fetchApi(`/openai/get-results`, {
            method: "POST",
            body: JSON.stringify({
              question: currentQuestion.question,
              answer: currentQuestion.answer,
              position: interview.jobTitle,
              skills: currentQuestion.skills || [],
              saved:true
            }),
          });

          console.log('response ', response);
          await updateCurrentQuestionWithFeedback(response);
        } catch(e) {
          console.log('error', e);
          setFeedbackStatus("generate");
          setErrorMessage("Failed to generate feedback. Please try again.");
        }
      }
    } else if (feedbackStatus === "ready") {
      if (interview && interview.id) {
        const currentQuestion = Array.isArray(interview.questions) 
          ? interview.questions[0] 
          : Object.values(interview.questions)[0] as InterviewQuestion;
        router.push(`/dashboard/interview/${interview.id}/summary/${currentQuestion.id}`);
      }
    }
  }, [interview, updateCurrentQuestionWithFeedback, fetchApi, feedbackStatus, router]);

  const handleTextToSpeech = useCallback(async () => {
    if (interview && (Array.isArray(interview.questions) ? interview.questions[0] : Object.values(interview.questions)[0])) {
      setIsLoadingAudio(true);
      try {
        const currentQuestion = Array.isArray(interview.questions) 
          ? interview.questions[0] 
          : Object.values(interview.questions)[0] as InterviewQuestion;

        const response = await fetchApi("/openai/text-to-speech", {
          method: "POST",
          body: JSON.stringify({ text: currentQuestion.question }),
        });
        if (response && response.audioUrl) {
          if (audioRef.current) {
            audioRef.current.src = response.audioUrl;
            audioRef.current.play().catch((error) => {
              console.error("Error playing audio:", error);
              setErrorMessage("Failed to play audio. Please try again.");
            });
          }
        }
      } catch (error) {
        console.error("Error generating text-to-speech:", error);
        setErrorMessage("Failed to generate audio. Please try again.");
      } finally {
        setIsLoadingAudio(false);
      }
    }
  }, [interview, fetchApi]);

  if (!interview || (Array.isArray(interview.questions) ? interview.questions.length === 0 : Object.keys(interview.questions).length === 0)) {
    return (
      <div className="text-center text-2xl font-bold text-purple-800">
        Loading interview...
      </div>
    );
  }

  const currentQuestion = Array.isArray(interview.questions) 
    ? interview.questions[0] 
    : Object.values(interview.questions)[0] as InterviewQuestion;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-4xl card-shadow">
        <CardContent className="p-6">
          {showTimer && (
            <div className="mb-6">
              <CountdownTimer
                initialTime={60}
                onComplete={handleTimerComplete}
              />
            </div>
          )}
          <div className="flex items-center justify-center mb-4 p-2 bg-yellow-100 rounded-md">
            <Mic className="w-5 h-5 mr-2 text-yellow-600" />
            <p className="text-yellow-800 font-medium">
              Please enable your microphone to start the interview.
            </p>
          </div>
          <h2 className="text-2xl mb-6 text-center font-bold">
            {currentQuestion.question}
          </h2>
          <div className="flex justify-center mb-6 relative">
            <Image
              src="/images/interview/avatar.png"
              alt="Interview Avatar"
              width={200}
              height={200}
              className="rounded-full relative z-10"
            />
          </div>
          <div className="flex justify-center mb-4">
            <Button
              onClick={handleTextToSpeech}
              className="button-gradient"
              disabled={isLoadingAudio}
            >
              {isLoadingAudio ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading Audio...
                </>
              ) : (
                "Play Question Audio"
              )}
            </Button>
          </div>
          <audio ref={audioRef} className="hidden" />
          <div className="relative">
            <Visualizer
              hasTimedOut={hasTimedOut}
              setHasRecordingStopped={setHasRecordingStopped}
              setRecordingStarted={setHasRecordingStarted}
            />
          </div>
          {hasRecordingStopped && saveStatus !== "success" && (
            <div className="flex justify-center mt-6">
              <Button
                onClick={handleSubmitRecording}
                className="button-gradient"
                disabled={isSubmittingRecording}
              >
                {isSubmittingRecording ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Recording"
                )}
              </Button>
            </div>
          )}
      
          {saveStatus === "success" && (
            <div className="flex justify-center mt-6">
              <Button onClick={handleFeedbackButton} className="button-gradient" disabled={feedbackStatus === "thinking"}>
                {feedbackStatus === "generate" && "Generate Results"}
                {feedbackStatus === "thinking" && (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    AI is thinking...
                  </>
                )}
                {feedbackStatus === "ready" && (Array.isArray(interview.questions) 
                  ? (interview.questions.length > 1 ? "See Feedback" : "See Results")
                  : (Object.keys(interview.questions).length > 1 ? "See Feedback" : "See Results"))}
              </Button>
            </div>
          )}
              {saveStatus === "saving" && (
            <p className="mt-4 text-yellow-600 font-semibold text-center">
              Processing your answer...
            </p>
          )}
          {saveStatus === "success" && (
            <p className="mt-4 text-green-600 font-semibold text-center">
              Your answer has been processed and saved successfully!
            </p>
          )}
          {saveStatus === "error" && (
            <p className="mt-4 text-red-600 font-semibold text-center">
              There was an error processing your answer. Please try again.
            </p>
          )}
          {errorMessage && errorMessage !== "" && (
            <div className="flex flex-col items-center justify-center p-4 gradient-bg">
              <Card className="w-full max-w-2xl card-shadow">
                <CardContent>
                  <p className="text-red-500 text-center font-semibold">
                    {errorMessage}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
