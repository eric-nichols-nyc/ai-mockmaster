import React, { useEffect, useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mic } from "lucide-react";
import { InterviewTimer } from "./interview-timer";
import { QuestionAudio } from "./interview-question-audio";
import Visualizer from "./visualizer";
import { InterviewErrors } from "./interview-errors";
import { InterviewQuestionRecord, InterviewRecord } from "@/db/schema";
import { useApi } from "@/lib/api";
import useBlobStore from "@/store/interviewStore";
import { useInterview } from "@/hooks/use-tanstack-interview";
import { useParams } from "next/navigation";

interface InterviewQuestionProps {
  jobTitle: string;
  question: InterviewQuestionRecord;
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
const InterviewQuestion = ({ question }: InterviewQuestionProps) => {
  const params = useParams();

  const {id} = params;
  const [currentQuestion, setCurrentQuestion] =
    useState<InterviewQuestionRecord | null>(question);
  const [hasRecordingStopped, setHasRecordingStopped] = useState(false);
  const [hasRecordingStarted, setHasRecordingStarted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const [isSubmittingRecording, setIsSubmittingRecording] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<
    "generate" | "thinking" | "ready"
  >("generate");

  const [hasTimedOut, setHasTimedOut] = useState(false);
  const { fetchApi } = useApi();
  const { currentBlob } = useBlobStore();
  const { interview, updateAnswer } = useInterview(id);
  const visualizerRef = useRef<{ clearCanvas: () => void } | null>(null);
  console.log("interview", interview);
  // Handle timer completion
  const handleTimerComplete = useCallback(() => {
    setErrorMessage(
      "Interview time has ended. Please submit your final answer."
    );
    setHasRecordingStopped(true);
    setHasTimedOut(true);
  }, []);

  // Update current question with feedback
  const updateCurrentQuestionWithFeedback = useCallback(
    async (feedbackData: FeedbackData) => {
      if (
        interview &&
        (Array.isArray(interview.questions)
          ? interview.questions.length > 0
          : Object.keys(interview.questions).length > 0)
      ) {
        const question = Array.isArray(interview.questions)
          ? interview.questions[0]
          : (Object.values(interview.questions)[0] as InterviewQuestionRecord);

        const updatedQuestion: InterviewQuestionRecord = {
          ...question,
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
          skills: question.skills || null,
          answer: question.answer || null,
          audioUrl: question.audioUrl || null,
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
          //setErrorMessage("Failed to generate feedback. Please try again.");
        }
      }
    } else if (feedbackStatus === "ready") {
      console.log("feedback ready");
    }
  }, [
    interview,
    currentQuestion?.question,
    currentQuestion?.answer,
    currentQuestion?.skills,
    updateCurrentQuestionWithFeedback,
    feedbackStatus,
  ]);

  // Handle submission of recorded answer
  const handleSubmitRecording = useCallback(async () => {
    setSaveStatus("saving");
    setIsSubmittingRecording(true);
    try {
      if (currentBlob) {
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
            `/interviews/${interview.id}/questions/${question?.id}/answer`,
            {
              method: "PUT",
              body: JSON.stringify({
                answer: answer,
                audioUrl: url,
              }),
            }
          );
          console.log("PUT: Update question", updatedQuestion);

          if (question) {
            question.answer = answer;
            question.audioUrl = url;
          }

          // add answer and audio url to current question

          if (updatedQuestion && updatedQuestion.audioUrl) {
            setSaveStatus("success");
            // add sonner message
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
      } else if (interview && question?.audioUrl) {
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
  }, [fetchApi, interview, currentBlob, question, getFeedback]);

  const seeResults = () => {
    console.log("see results");
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

  const hasAudioUrl =
    currentQuestion?.audioUrl !== null &&
    currentQuestion?.audioUrl !== undefined;

  return (
    <Card className="w-full max-w-4xl card-shadow bg-white">
        <CardContent>
        <div className="flex flex-col items-center justify-center mb-4 p-2 bg-yellow-100 rounded-md">
          <div className="flex items-center">
            <Mic className="w-5 h-5 mr-2 text-yellow-600" />
            <p className="text-yellow-800 font-medium">
              Please enable your microphone to start the interview.
            </p>
          </div>
        </div>
        <QuestionAudio question={question.question} />
        <Separator className="my-4" />
        {/* Interview Timer */}
        <InterviewTimer
          duration={60}
          hasRecordingStarted={hasRecordingStarted}
          handleTimerComplete={handleTimerComplete}
        />
        <Separator className="my-4" />
        <div className="relative">
          <Visualizer
            ref={visualizerRef}
            recordingHasStopped={hasRecordingStopped}
            hasTimedOut={hasTimedOut}
            setHasRecordingStopped={setHasRecordingStopped}
            setRecordingStarted={setHasRecordingStarted}
          />
        </div>
        <Separator />
        <InterviewErrors errorMessage={errorMessage} />
      </CardContent>
    </Card>
  );
};

export default InterviewQuestion;

//
