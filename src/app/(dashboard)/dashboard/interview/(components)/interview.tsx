"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import useInterviewStore from "@/store/interviewStore";
import Visualizer from "./visualizer";
import { useApi } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function Interview() {
  const router = useRouter();
  const { fetchApi } = useApi();
  const { interview, setInterview, updateQuestion } = useInterviewStore();

  const [transcription, setTranscription] = useState("");
  const [s3Url, setS3Url] = useState("");
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasRecordingStopped, setHasRecordingStopped] = useState(false);
  const [isInitialFetch, setIsInitialFetch] = useState(true);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isSubmittingRecording, setIsSubmittingRecording] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

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
          setInterview(response);
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

    fetchCurrentInterview();
  }, [fetchApi, setInterview, interview, isInitialFetch]);

  const handleSubmitRecording = useCallback(async () => {
    setSaveStatus("saving");
    setIsSubmittingRecording(true);
    try {
      if (interview && interview.currentBlob) {
        const currentQuestion = interview.questions[0];
        const audioFile = new File([interview.currentBlob], "audio.webm", {
          type: interview.currentBlob.type,
        });
        const formData = new FormData();
        formData.append("audio", audioFile, "audio.webm");
        const transcriptResponse = await fetchApi("/transcript", {
          method: "POST",
          body: formData,
        });

        if (transcriptResponse && transcriptResponse.transcription) {
          setTranscription(transcriptResponse.transcription);

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
            setS3Url(updatedResponse.audioUrl);
            updateQuestion(currentQuestion.id, {
              userAnswer: transcriptResponse.transcription,
              recordedAnswer: updatedResponse.audioUrl,
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
  }, [fetchApi, interview, updateQuestion]);

  const handleNextQuestion = useCallback(async () => {
    if (interview) {
      if (interview.questions.length > 1) {
        const updatedQuestions = interview.questions.slice(1);
        setInterview({ ...interview, questions: updatedQuestions });
        setSaveStatus("idle");
        setTranscription("");
        setS3Url("");
        setHasRecordingStopped(false);
        setAudioUrl(null);
      } else {
        try {
          await fetchApi(`/interviews/${interview.id}/complete`, {
            method: "POST",
          });
          router.push("/dashboard/interview/summary");
        } catch (error) {
          console.error("Error completing interview:", error);
          setErrorMessage(
            "Failed to complete the interview. Please try again."
          );
        }
      }
    }
  }, [interview, setInterview, router, fetchApi]);

  const handleTextToSpeech = useCallback(async () => {
    if (interview && interview.questions[0]) {
      setIsLoadingAudio(true);
      try {
        const response = await fetchApi("/openai/text-to-speech", {
          method: "POST",
          body: JSON.stringify({ text: interview.questions[0].question }),
        });
        if (response && response.audioUrl) {
          setAudioUrl(response.audioUrl);
          if (audioRef.current) {
            audioRef.current.src = response.audioUrl;
            audioRef.current.play().catch(error => {
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

  if (errorMessage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 gradient-bg">
        <Card className="w-full max-w-2xl card-shadow">
          <CardContent>
            <p className="text-red-500 text-center font-semibold">
              {errorMessage}
            </p>
            <Button
              onClick={() => {
                setIsInitialFetch(true);
                setErrorMessage(null);
              }}
              className="mt-4 button-gradient w-full"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!interview || interview.questions.length === 0) {
    return (
      <div className="text-center text-2xl font-bold text-purple-800">
        Loading interview...
      </div>
    );
  }

  const currentQuestion = interview.questions[0];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 gradient-bg">
      <Card className="w-full max-w-2xl card-shadow">
        <CardContent className="p-6">
          <h2 className="text-2xl mb-6 text-center">
            {currentQuestion.question}
          </h2>
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
          <Visualizer setHasRecordingStopped={setHasRecordingStopped} />
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
          {saveStatus === "success" && (
            <div className="flex justify-center mt-6">
              <Button
                onClick={handleNextQuestion}
                className="button-gradient"
              >
                {interview.questions.length > 1
                  ? "Next Question"
                  : "Finish Interview"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
