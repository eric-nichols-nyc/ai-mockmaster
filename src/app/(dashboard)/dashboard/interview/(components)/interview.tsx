"use client";

// Import necessary dependencies and components
import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import useInterviewStore, {
  useBlobStore,
  ExtendedInterview,
} from "@/store/interviewStore";
import Visualizer from "./visualizer";
import { useApi } from "@/lib/api";
import { Loader2 } from "lucide-react";
import CountdownTimer from "@/components/countdown-timer";

export default function Interview() {
  // Initialize router and API hooks
  const router = useRouter();
  const { fetchApi } = useApi();

  // Access interview state and methods from the interview store
  const { interview, setInterview, updateQuestion } = useInterviewStore();
  const { currentBlob } = useBlobStore();

  // State variables for managing the interview process
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasRecordingStopped, setHasRecordingStopped] = useState(false);
  const [hasRecordingStarted, setHasRecordingStarted] = useState(false);
  const [isInitialFetch, setIsInitialFetch] = useState(true);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isSubmittingRecording, setIsSubmittingRecording] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  // Reference for the audio element
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Callback function to handle timer completion
  const handleTimerComplete = useCallback(() => {
    console.log("Interview time is up!");
    setErrorMessage(
      "Interview time has ended. Please submit your final answer."
    );
    setShowTimer(false);
    setHasRecordingStopped(true);
    setHasTimedOut(true)
  }, []);

  // Effect to fetch the current interview and manage timer visibility
  useEffect(() => {
    const fetchCurrentInterview = async () => {
      if (!isInitialFetch) return;

      try {
        const response = await fetchApi("/interviews/current", {
          method: "GET",
        });
        if (
          response &&
          JSON.stringify(response) !== JSON.stringify(interview)
        ) {
          setInterview(response as ExtendedInterview);
        } else if (!response) {
          setErrorMessage(
            "No current interview found. Please start a new interview."
          );
        }
      } catch (error) {
        console.error("Error fetching interview:", error);
        setErrorMessage("Failed to load the interview. Please try again.");
      } finally {
        setIsInitialFetch(false);
      }
    };

    // Manage timer visibility based on recording state
    if (hasRecordingStarted) {
      if (!showTimer) {
        setShowTimer(true);
      }
    }
    if(hasRecordingStopped){
      setShowTimer(false);
    }

    fetchCurrentInterview();
  }, [fetchApi, setInterview, interview, isInitialFetch, hasRecordingStarted,hasRecordingStopped]);

  // Function to handle submitting the recorded answer
  const handleSubmitRecording = useCallback(async () => {
    setSaveStatus("saving");
    setIsSubmittingRecording(true);
    try {
      if (interview && currentBlob) {
        const currentQuestion = interview.questions[0];
        const audioFile = new File([currentBlob], "audio.webm", {
          type: currentBlob.type,
        });
        const formData = new FormData();
        formData.append("audio", audioFile, "audio.webm");
        
        // Send audio for transcription
        const transcriptResponse = await fetchApi("/openai/transcribe", {
          method: "POST",
          body: formData,
        });

        if (transcriptResponse && transcriptResponse.transcription) {
          // Save the transcribed answer
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

  // Function to handle moving to the next question or completing the interview
  const handleNextQuestion = useCallback(async () => {
    if (interview) {
      // Note: This function is currently commented out. It would typically handle
      // moving to the next question or completing the interview.
    }
  }, [interview, setInterview, router, fetchApi]);

  // Function to handle text-to-speech for the current question
  const handleTextToSpeech = useCallback(async () => {
    if (interview && interview.questions[0]) {
      setIsLoadingAudio(true);
      try {
        const response = await fetchApi("/openai/text-to-speech", {
          method: "POST",
          body: JSON.stringify({ text: interview.questions[0].question }),
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

  // Render loading state if interview is not loaded
  if (!interview || interview.questions.length === 0) {
    return (
      <div className="text-center text-2xl font-bold text-purple-800">
        Loading interview...
      </div>
    );
  }

  const currentQuestion = interview.questions[0];

  // Render the main interview interface
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 gradient-bg">
      <Card className="w-full max-w-2xl card-shadow">
        <CardContent className="p-6">
          {/* Render countdown timer if showTimer is true */}
          {showTimer && (
            <div className="mb-6">
              <CountdownTimer
                initialTime={6}
                onComplete={handleTimerComplete}
              />
            </div>
          )}
          {/* Display current question */}
          <h2 className="text-2xl mb-6 text-center">
            {currentQuestion.question}
          </h2>
          {/* Display avatar image */}
          <div className="flex justify-center mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full blur opacity-75"></div>
            <Image
              src="/images/interview/avatar.png"
              alt="Interview Avatar"
              width={200}
              height={200}
              className="rounded-full relative z-10"
            />
          </div>
          {/* Button to play question audio */}
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
          {/* Render audio visualizer component */}
          <Visualizer
            hasTimedOut={hasTimedOut}
            setHasRecordingStopped={setHasRecordingStopped}
            setRecordingStarted={setHasRecordingStarted}
          />
          {/* Show submit button when recording has stopped and answer is not yet saved */}
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
          {/* Display save status messages */}
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
          {/* Show next question button when answer is successfully saved */}
          {saveStatus === "success" && (
            <div className="flex justify-center mt-6">
              <Button onClick={handleNextQuestion} className="button-gradient">
                {interview.questions.length > 1
                  ? "Next Question"
                  : "Finish Interview"}
              </Button>
            </div>
          )}
          {/* Display error messages */}
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
