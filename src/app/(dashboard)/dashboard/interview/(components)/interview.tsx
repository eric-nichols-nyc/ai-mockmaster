"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import useBlobStore from "@/store/interviewStore";
import Visualizer from "./visualizer";
import { useApi } from "@/lib/api";
import { Loader2, Mic } from "lucide-react";
import CountdownTimer from "@/components/countdown-timer";
import { InterviewQuestionRecord, InterviewRecord } from "@/db/schema";
import Ripple from "@/components/ui/ripple";
import { toast } from "sonner";

interface InterviewProps {
  interview: InterviewRecord;
}

// Define the structure for feedback data
interface FeedbackData {
  feedback: string | null;
  grade?: {
    letter: string;
  };
  improvements?: string[];
  keyTakeaways?: string[];
}

// Main Interview component
export default function Interview({ interview }: InterviewProps) {
  const router = useRouter();
  const { fetchApi } = useApi();
  const { currentBlob } = useBlobStore();
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasRecordingStopped, setHasRecordingStopped] = useState(false);
  const [hasRecordingStarted, setHasRecordingStarted] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isSubmittingRecording, setIsSubmittingRecording] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestionRecord | null>(null);
  const [feedbackStatus, setFeedbackStatus] = useState<
    "generate" | "thinking" | "ready"
  >("generate");
  const [audioUrl, setAudioUrl] = useState<string | null | undefined>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const visualizerRef = useRef<{ clearCanvas: () => void } | null>(null);

  // Handle timer completion
  const handleTimerComplete = useCallback(() => {
    console.log("Interview time is up!");
    setErrorMessage(
      "Interview time has ended. Please submit your final answer."
    );
    setShowTimer(false);
    setHasRecordingStopped(true);
    setHasTimedOut(true);
  }, []);

  useEffect(() => {
    if (interview && interview.questions.length) {
     setCurrentQuestion(
        Array.isArray(interview.questions)
          ? interview.questions[0]
          : (Object.values(interview.questions)[0] as InterviewQuestionRecord)
      );
      console.log('currentQuestion',currentQuestion)
    }
  }, [currentQuestion, interview]);

  // Effect to manage timer visibility
  useEffect(() => {
    if (hasRecordingStarted) {
      if (!showTimer) {
        setShowTimer(true);
      }
    }
    if (hasRecordingStopped) {
      setShowTimer(false);
    }
  }, [hasRecordingStarted, hasRecordingStopped, showTimer]);

  // Handle submission of recorded answer
  const handleSubmitRecording = useCallback(async () => {
    setSaveStatus("saving");
    setIsSubmittingRecording(true);
    try {
      if (interview && currentBlob) {
        // const currentQuestion = Array.isArray(interview.questions)
        //   ? interview.questions[0]
        //   : (Object.values(interview.questions)[0] as InterviewQuestionRecord);

        const audioFile = new File([currentBlob], "audio.webm", {
          type: currentBlob.type,
        });
        const formData = new FormData();
        formData.append("audio", audioFile, "audio.webm");

        // Transcribe the audio
        const transcriptResponse = await fetchApi("/openai/transcribe", {
          method: "POST",
          body: formData,
        });

        if (transcriptResponse && transcriptResponse.transcription) {
          const answer = transcriptResponse.transcription;
          const url = transcriptResponse.audioUrl;
          // Save the transcribed answer
          const updatedQuestion = await fetchApi(
            `/interviews/${interview.id}/questions/${currentQuestion?.id}/answer`,
            {
              method: "PUT",
              body: JSON.stringify({
                answer: answer,
                audioUrl: url,
              }),
            }
          );
          if(currentQuestion){
            currentQuestion.answer = answer;
            currentQuestion.audioUrl = url;
          }
     
          // add answer and audio url to current question

          if (updatedQuestion && updatedQuestion.audioUrl) {
            setSaveStatus("success");
            // add sonner message
            toast("Your answer has been processed and saved successfully!")
            //set button test
            setFeedbackStatus("generate");
            setAudioUrl(updatedQuestion.audioUrl);
            // replace the 
            
            
          } else {
            throw new Error("Invalid response from server");
          }
        } else {
          throw new Error("Invalid response from transcription service");
        }
      } else if(interview && currentQuestion?.audioUrl) {
          setAudioUrl(currentQuestion.audioUrl);
      }else{
        throw new Error("No interview or audio blob available");
      }
    } catch (error) {
      console.error("Error processing recorded answer:", error);
      setSaveStatus("error");
      setErrorMessage("Failed to process your answer. Please try again.");
    } finally {
      setIsSubmittingRecording(false);
    }
  }, [fetchApi, interview, currentBlob]);

  // Handle "Try Again" button click
  const handleTryAgain = useCallback(() => {
    if (visualizerRef.current) {
      visualizerRef.current.clearCanvas();
    }
    setHasRecordingStopped(false);
    setHasRecordingStarted(false);
    setSaveStatus("idle");
    setErrorMessage(null);
    setHasTimedOut(false);
  }, []);

  // Handle text-to-speech conversion and playback for Avatar
  const handleTextToSpeech = useCallback(async () => {
    if (
      interview &&
      (Array.isArray(interview.questions)
        ? interview.questions[0]
        : Object.values(interview.questions)[0])
    ) {
      if (audioUrl) {
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          setIsPlaying(true);
          audioRef.current.play().catch((error) => {
            console.error("Error playing audio:", error);
            setErrorMessage("Failed to play audio. Please try again.");
            setIsPlaying(false);
          });
        }
      } else {
        setIsLoadingAudio(true);
        try {
          const currentQuestion = Array.isArray(interview.questions)
            ? interview.questions[0]
            : (Object.values(
                interview.questions
              )[0] as InterviewQuestionRecord);

          // Generate audio from text
          const response = await fetchApi("/openai/text-to-speech", {
            method: "POST",
            body: JSON.stringify({ text: currentQuestion.question }),
          });
          if (response && response.audioUrl) {
            setAudioUrl(response.audioUrl);
            if (audioRef.current) {
              audioRef.current.src = response.audioUrl;
              setIsPlaying(true);
              audioRef.current.play().catch((error) => {
                console.error("Error playing audio:", error);
                setErrorMessage("Failed to play audio. Please try again.");
                setIsPlaying(false);
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
    }
  }, [interview, fetchApi, audioUrl]);

  // Update current question with feedback
  const updateCurrentQuestionWithFeedback = useCallback(
    async (feedbackData: FeedbackData) => {
      console.log('feedbackData = ', feedbackData);
      if (
        interview &&
        (Array.isArray(interview.questions)
          ? interview.questions.length > 0
          : Object.keys(interview.questions).length > 0)
      ) {
        const currentQuestion = Array.isArray(interview.questions)
          ? interview.questions[0]
          : (Object.values(interview.questions)[0] as InterviewQuestionRecord);

        const updatedQuestion: InterviewQuestionRecord = {
          ...currentQuestion,
          saved: true,
          feedback: feedbackData.feedback || null,
          grade: feedbackData.grade?.letter || null,
          improvements:
            feedbackData.improvements && feedbackData.improvements.length > 0
              ? feedbackData.improvements
              : null,
          keyTakeaways:
            feedbackData.keyTakeaways && feedbackData.keyTakeaways.length > 0
              ? feedbackData.keyTakeaways
              : null,
          skills: currentQuestion.skills || null,
          answer: currentQuestion.answer || null,
          audioUrl: currentQuestion.audioUrl || null,
        };
        console.log('updatedQuestion', updatedQuestion);

        // Save the updated question with feedback
        const saved = await fetchApi(
          `/interviews/${interview.id}/questions/${updatedQuestion.id}`,
          {
            method: "PUT",
            body: JSON.stringify(updatedQuestion),
          }
        );

        console.log('saved ', saved);
        setFeedbackStatus("ready");
      }
    },
    [interview, fetchApi]
  );

  // Handle feedback button click
  const handleFeedbackButton = useCallback(async () => {
    if(!currentQuestion?.answer){
      throw new Error("You don't have a valid answer")
    }
    if (feedbackStatus === "generate") {
      setFeedbackStatus("thinking");
      if (interview && interview.jobTitle && interview.questions) {
        try {
          // Generate feedback using OpenAI
          const response = await fetchApi(`/openai/get-results`, {
            method: "POST",
            body: JSON.stringify({
              question: currentQuestion.question,
              answer: currentQuestion.answer,
              position: interview.jobTitle,
              skills: currentQuestion.skills || [],
            }),
          });

          await updateCurrentQuestionWithFeedback(response);
        } catch (e) {
          console.error("error", e);
          setFeedbackStatus("generate");
          setErrorMessage("Failed to generate feedback. Please try again.");
        }
      }
    } else if (feedbackStatus === "ready") {
      if (interview && interview.id) {
        const currentQuestion = Array.isArray(interview.questions)
          ? interview.questions[0]
          : (Object.values(interview.questions)[0] as InterviewQuestionRecord);
        router.push(
          `/dashboard/interview/${interview.id}/summary/${currentQuestion.id}`
        );
      }
    }
  }, [
    interview,
    updateCurrentQuestionWithFeedback,
    fetchApi,
    feedbackStatus,
    router,
  ]);

  // Effect to handle audio playback completion
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleEnded = () => setIsPlaying(false);
      audio.addEventListener("ended", handleEnded);
      return () => {
        if (audio) {
          audio.removeEventListener("ended", handleEnded);
        }
      };
    }
  }, []);

  // Render error message if no interview questions are available
  if (
    !interview ||
    (Array.isArray(interview.questions)
      ? interview.questions.length === 0
      : Object.keys(interview.questions).length === 0)
  ) {
    return (
      <div className="text-center text-2xl font-bold text-purple-800">
        No interview questions available.
      </div>
    );
  }

  // const currentQuestion = Array.isArray(interview.questions)
  //   ? interview.questions[0]
  //   : (Object.values(interview.questions)[0] as InterviewQuestionRecord);

  const hasAudioUrl = currentQuestion?.audioUrl !== null && currentQuestion?.audioUrl !== undefined;

  // Render the main interview component
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-4xl card-shadow bg-white">
        <CardContent className="p-6">
          {/* Timer component */}
          {hasRecordingStarted && !hasAudioUrl && (
            <div className="mb-6">
              <CountdownTimer
                initialTime={60}
                onComplete={handleTimerComplete}
                isRunning={hasRecordingStarted && !hasRecordingStopped}
              />
            </div>
          )}
          {/* Microphone permission message */}
          {!hasAudioUrl && (
            <div className="flex items-center justify-center mb-4 p-2 bg-yellow-100 rounded-md">
              <Mic className="w-5 h-5 mr-2 text-yellow-600" />
              <p className="text-yellow-800 font-medium">
                Please enable your microphone to start the interview.
              </p>
            </div>
          )}
          {/* Current question */}
          <h2 className="text-2xl mb-6 text-center font-bold">
            {currentQuestion?.question}
          </h2>
          {/* Avatar image */}
          <div className="flex justify-center mb-6 relative">
            <Image
              src="/images/interview/avatar.png"
              alt="Interview Avatar"
              width={200}
              height={200}
              className="rounded-full relative z-10 shadow-xl"
            />
            {isPlaying && <Ripple />}
          </div>
          {/* Play audio button */}
          <div className="flex justify-center mb-4">
            <Button
              data-testid="playaudio"
              onClick={handleTextToSpeech}
              disabled={isLoadingAudio || isPlaying}
            >
              {isLoadingAudio ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading Audio...
                </>
              ) : isPlaying ? (
                "Playing..."
              ) : (
                "Play Question Audio"
              )}
            </Button>
          </div>
          {/* Hidden audio element */}
          <audio ref={audioRef} className="hidden" />
          {/* Visualizer component */}
          {(
            <div className="relative">
              <Visualizer
                ref={visualizerRef}
                hasTimedOut={hasTimedOut}
                setHasRecordingStopped={setHasRecordingStopped}
                setRecordingStarted={setHasRecordingStarted}
              />
            </div>
          )}
          {/* Action buttons */}
          <div className="flex justify-center mt-6 space-x-4">
            {(hasRecordingStopped || hasAudioUrl) && saveStatus !== "saving" && saveStatus !== "success" && (
              <>
                <Button
                  onClick={handleSubmitRecording}
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
                <Button
                  onClick={handleTryAgain}
                  disabled={!hasRecordingStopped && !hasTimedOut && !hasAudioUrl}
                >
                  Try Again
                </Button>
              </>
            )}
          </div>

          {/* Feedback button */}
          {saveStatus === "success" && (
            <div className="flex justify-center mt-6">
              <Button
                onClick={handleFeedbackButton}
                disabled={feedbackStatus === "thinking"}
              >
                {feedbackStatus === "generate" && "Generate Results"}
                {feedbackStatus === "thinking" && (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    AI is thinking...
                  </>
                )}
                {feedbackStatus === "ready" &&
                  (Array.isArray(interview.questions)
                    ? interview.questions.length > 1
                      ? "See Feedback"
                      : "See Results"
                    : Object.keys(interview.questions).length > 1
                    ? "See Feedback"
                    : "See Results")}
              </Button>
            </div>
          )}
          {/* Status messages */}
        {saveStatus === "saving" && (
            <p className="mt-4 text-yellow-600 font-semibold text-center">
              Processing your answer...
            </p>
          )}
          {saveStatus === "success" && (
            <p className="mt-4 text-green-600 font-semibold text-center">
              Your answer has been processed and saved successfully!
            </p>
          )}   {/*
          {saveStatus === "error" && (
            <p className="mt-4 text-red-600 font-semibold text-center">
              There was an error processing your answer. Please try again.
            </p>
          )} */}
          {/* Error message display */}
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
