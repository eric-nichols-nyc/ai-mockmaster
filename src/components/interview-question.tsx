/**
 * @module InterviewQuestion
 * @description A React component that handles the interview question interaction flow,
 * including audio recording, transcription, and feedback generation.
 */

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mic } from "lucide-react";
import { InterviewTimer } from "./interview-timer";
import { QuestionAudio } from "./interview-question-audio";
import Visualizer from "./visualizer";
import { InterviewErrors } from "./interview-errors";
import { InterviewQuestionRecord } from "@/db/schema";
import { useApi } from "@/lib/api";
import useBlobStore from "@/store/interviewStore";
import { useInterview } from "@/hooks/use-tanstack-interview";
import { evaluateInterviewAnswer } from "@/actions/gemini-actions";
import { useParams } from "next/navigation";
import { createAudioFile } from "@/utils/create-audio";
import RecordButton from "./record-button";

/**
 * Props for the InterviewQuestion component
 * @interface InterviewQuestionProps
 */
interface InterviewQuestionProps {
  /** The job title for the interview */
  jobTitle: string;
  /** The current question record containing question details */
  question: InterviewQuestionRecord;
}

/**
 * Data structure for updating an answer
 * @interface UpdateAnswerData
 */
type UpdateAnswerData = {
  /** The transcribed answer text */
  answer: string;
  /** URL to the recorded audio file */
  audioUrl: string;
  /** Feedback provided for the answer */
  feedback: string;
  /** Grade assigned to the answer (optional) */
  grade?: string;
  /** Array of suggested improvements (optional) */
  improvements?: string[];
  /** Array of key takeaways from the answer (optional) */
  keyTakeaways?: string[];
  /** Whether the answer has been saved */
  saved: boolean;
};

/**
 * InterviewQuestion Component
 *
 * This component handles the complete flow of an interview question, including:
 * - Audio recording interface
 * - Timer management
 * - Answer transcription
 * - Feedback generation
 * - State management for the interview process
 *
 * @component
 * @param {InterviewQuestionProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
const InterviewQuestion: React.FC<InterviewQuestionProps> = ({ question }) => {
  const params = useParams();
  const { id } = params;

  // State Management
  const [currentQuestion, setCurrentQuestion] =
    useState<InterviewQuestionRecord | null>(question);
  const [hasRecordingStopped, setHasRecordingStopped] = useState(false);
  const [hasRecordingStarted, setHasRecordingStarted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmittingRecording, setIsSubmittingRecording] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<
    "generate" | "thinking" | "ready"
  >("generate");
  const [hasTimedOut, setHasTimedOut] = useState(false);

  // Hooks and Refs
  const { currentBlob } = useBlobStore();
  const { transcribeAudio } = useApi();
  const { interview, updateQuestion } = useInterview(id as string);
  const visualizerRef = useRef<{ clearCanvas: () => void, handleStartRecording: () => void, handleStopRecording: () => void } | null>(null);

  /**
   * Handles the completion of the interview timer
   * @callback handleTimerComplete
   */
  const handleTimerComplete = useCallback(() => {
    setErrorMessage(
      "Interview time has ended. Please submit your final answer."
    );
    setHasRecordingStopped(true);
    setHasTimedOut(true);
  }, []);

  /**
   * Transcribes the recorded audio using the API
   * @async
   * @param {FormData} formData - Form data containing the audio file
   * @returns {Promise<{answer: string, audioUrl: string}>} Transcription result
   */
  const transcribedAudio = useCallback(
    async (formData: FormData) => {
      const { answer, audioUrl } = await transcribeAudio(formData);
      return { answer, audioUrl };
    },
    [transcribeAudio]
  );

  /**
   * Evaluates the transcribed answer using AI
   * @async
   * @param {string} answer - The transcribed answer to evaluate
   * @returns {Promise<any>} Evaluation results
   */
  const evaluateAnswer = useCallback(
    async (answer: string) => {
      if (!currentQuestion || !interview?.jobTitle) {
        throw new Error("Missing question or job title");
      }
      return evaluateInterviewAnswer(
        currentQuestion.question,
        answer,
        interview.jobTitle,
        currentQuestion.skills || []
      );
    },
    [currentQuestion, interview]
  );

  /**
   * Handles the submission of a recorded answer
   * This includes:
   * 1. Creating the audio file
   * 2. Transcribing the audio
   * 3. Getting AI feedback
   * 4. Updating the question record
   *
   * @async
   * @callback handleSubmitRecording
   */
  const handleSubmitRecording = useCallback(async () => {
    if (!currentBlob || !interview?.id || !currentQuestion?.id) {
      setErrorMessage("Missing required data for submission");
      return;
    }

    setSaveStatus("saving");
    setIsSubmittingRecording(true);
    try {
      const audioResult = createAudioFile(currentBlob);
      if (!audioResult.success || !audioResult.data) {
        throw new Error(
          audioResult.error?.message || "Failed to create audio file"
        );
      }

      const formData = new FormData();
      formData.append("audio", audioResult.data, "audio.mp3");

      const { answer, audioUrl } = await transcribedAudio(formData);
      const evaluationResult = await evaluateAnswer(answer);

      await updateQuestion(currentQuestion.id, {
        answer,
        audioUrl,
        feedback: evaluationResult.feedback,
        grade: evaluationResult.grade?.letter,
        improvements: evaluationResult.improvements,
        keyTakeaways: evaluationResult.keyTakeaways,
        saved: true,
      } as UpdateAnswerData);

      setSaveStatus("success");
      setFeedbackStatus("ready");
    } catch (error) {
      console.error("Error processing interview response:", error);
      setSaveStatus("error");
      setErrorMessage("Failed to process your answer. Please try again.");
    } finally {
      setIsSubmittingRecording(false);
    }
  }, [
    currentBlob,
    interview?.id,
    currentQuestion,
    updateQuestion,
    transcribedAudio,
    evaluateAnswer,
  ]);

  // Update current question when interview data changes
  useEffect(() => {
    if (interview && interview.questions.length) {
      setCurrentQuestion(
        Array.isArray(interview.questions)
          ? interview.questions[0]
          : (Object.values(interview.questions)[0] as InterviewQuestionRecord)
      );
    }
  }, [currentQuestion, interview]);

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
            handleSubmitRecording={handleSubmitRecording}
          />
           <div className="flex justify-center mb-4">
            <RecordButton
              visualizerRef={visualizerRef}
              isRecording={isRecording}
              setIsRecording={setIsRecording}
              disabled={hasTimedOut}
            />
          </div>
        </div>
        <Separator />
        <InterviewErrors errorMessage={errorMessage} />
      </CardContent>
    </Card>
  );
};

export default InterviewQuestion;
