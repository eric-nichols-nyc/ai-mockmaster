"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import useBlobStore from "@/store/interviewStore";
import { useApi } from "@/lib/api";
import { InterviewQuestionRecord, InterviewRecord } from "@/db/schema";
import { toast } from "sonner";
import { useInterviews } from "@/hooks/useInterviews";
import { evaluateInterviewAnswer } from '@/actions/gemini-actions';
import InterviewQuestion from "@/components/interview-question";
import InterviewResults from "@/components/interview-results";
import { useInterview } from "@/hooks/use-tanstack-interview";
interface InterviewProps {
  interviewId: string;
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
/**
 *
 * @param param0
 * to start the timer
 * timer starts when user clicks the mic button in visualizer
 * visualizer needs to be able to start and stop the timer
 * visulizer need state from interview component to know when to start and stop the timer
 * @returns
 */
// Main Interview component
export default function Interview({ interviewId }: InterviewProps) {
  const router = useRouter();
  const { fetchApi } = useApi();
  const { currentBlob } = useBlobStore();
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const [view, setView] = useState<"question" | "results">("question");
  // const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasRecordingStopped, setHasRecordingStopped] = useState(false);
  const [isSubmittingRecording, setIsSubmittingRecording] = useState(false);
  const [currentQuestion, setCurrentQuestion] =
    useState<InterviewQuestionRecord | null>(null);
  const [feedbackStatus, setFeedbackStatus] = useState<
    "generate" | "thinking" | "ready"
  >("generate");

  const { interview } = useInterview(interviewId);
  console.log("interview", interview);


   // Update current question with feedback
   const updateCurrentQuestionWithFeedback = useCallback(
    async (feedbackData: FeedbackData) => {
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
        setCurrentQuestion(updatedQuestion);

        // Save the updated question with feedback
        const saved = await fetchApi(
          `/interviews/${interview.id}/questions/${updatedQuestion.id}`,
          {
            method: "PUT",
            body: JSON.stringify(updatedQuestion),
          }
        );

        console.log("saved ", saved);
        setFeedbackStatus("ready");
      }
    },
    [interview, fetchApi]
  );

  // Handle feedback button click
  const getFeedback = useCallback(async () => {
    if (!currentQuestion?.answer) {
      throw new Error("You don't have a valid answer");
    }
    if (feedbackStatus === "generate") {
      setFeedbackStatus("thinking");
      if (interview && interview.jobTitle && interview.questions) {
        try {
          const evaluationResult = await evaluateInterviewAnswer(
            currentQuestion.question,
            currentQuestion.answer,
            interview.jobTitle,
            currentQuestion.skills || []
          );
          // new functionality to stream feedback
          await updateCurrentQuestionWithFeedback(evaluationResult);
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
    currentQuestion?.question,
    currentQuestion?.answer,
    currentQuestion?.skills,
    updateCurrentQuestionWithFeedback,
    feedbackStatus,
    router,
  ]);

  // Handle submission of recorded answer
  const handleSubmitRecording = useCallback(async () => {
    setSaveStatus("saving");
    setIsSubmittingRecording(true);
    try {
      if (interview && currentBlob) {
        const audioFile = new File([currentBlob], "audio.mp3", {
          type: currentBlob.type,
        });
        const formData = new FormData();
        formData.append("audio", audioFile, "audio.mp3");

        // Transcribe the audio
        const transcriptResponse = await fetchApi("/openai/transcribe", {
          method: "POST",
          body: formData,
        });

        if (transcriptResponse && transcriptResponse.transcription) {
          const answer = transcriptResponse.transcription;
          const url = transcriptResponse.audioUrl;
          console.log("Update question");

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
          console.log("PUT: Update question", updatedQuestion);

          if (currentQuestion) {
            currentQuestion.answer = answer;
            currentQuestion.audioUrl = url;
          }

          // add answer and audio url to current question

          if (updatedQuestion && updatedQuestion.audioUrl) {
            setSaveStatus("success");
            // add sonner message
            toast("Your answer has been processed and saved successfully!");
            //set button test
            setFeedbackStatus("generate");
            // set audio url of user response
            // get feedback from openai
            getFeedback();
          } else {
            throw new Error("Invalid response from server");
          }
        } else {
          throw new Error("Invalid response from transcription service");
        }
      } else if (interview && currentQuestion?.audioUrl) {
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
  }, [fetchApi, interview, currentBlob, currentQuestion, getFeedback]);
 
  const seeResults = () => {
    if (interview && currentQuestion) {
      router.push(
        `/dashboard/interview/${interview.id}/summary/${currentQuestion?.id}`
      );
    }
  };

  useEffect(() => {
    if (interview && interview.questions.length) {
      setCurrentQuestion(
        Array.isArray(interview.questions)
          ? interview.questions[0]
          : (Object.values(interview.questions)[0] as InterviewQuestionRecord)
      );
    }
  }, [currentQuestion, interview]);

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
  
  const hasAudioUrl =
    currentQuestion?.audioUrl !== null &&
    currentQuestion?.audioUrl !== undefined;

  // Render the main interview component
  return (
    <div className="flex flex-col items-center justify-center p-4">
      {
        view === "question" && (
          <>
            <InterviewQuestion jobTitle={interview.jobTitle} question={currentQuestion?.question || ""} />
            <div className="w-full max-w-4xl bg-white">
                {/* Action buttons */}
                {/* <div className="flex justify-center mt-6 space-x-4">
                  {(hasRecordingStopped || hasAudioUrl) &&
                    saveStatus !== "saving" &&
                    saveStatus !== "success" && (
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
                          "Submit for AI feedback"
                        )}
                      </Button>
                    )}
                </div> */}
                {/* Feedback button */}
                {/* {saveStatus === "success" && (
                  <div className="flex justify-center mt-6">
                    <Button
                      onClick={seeResults}
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
                )} */}
                {/* Status messages */}

                {/* {saveStatus === "saving" && (
                  <p className="mt-4 text-yellow-600 font-semibold text-center">
                    Processing your answer...
                  </p>
                )}
                {saveStatus === "success" && (
                  <p className="mt-4 text-green-600 font-semibold text-center">
                    Your answer has been processed and saved successfully!
                  </p>
                )} */}
                {/*
                {saveStatus === "error" && (
                  <p className="mt-4 text-red-600 font-semibold text-center">
                    There was an error processing your answer. Please try again.
                  </p>
                )} */}
                {/* Error message display */}
                {/* {errorMessage && errorMessage !== "" && (
                  <div className="flex flex-col items-center justify-center p-4 gradient-bg">
                    <Card className="w-full max-w-2xl card-shadow">
                      <CardContent>
                        <p className="text-red-500 text-center font-semibold">
                          {errorMessage}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )} */}
            </div>
          </>
        )
      }
      {
        view === "results" && (
          <InterviewResults />
        )
      }

    </div>
  );
}
