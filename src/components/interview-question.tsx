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
import { create } from "domain";
import { createAudioFile } from "@/utils/create-audio";
import { SaveAnswerProps } from "@/types";

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

    const { id } = params;
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
    const { currentBlob } = useBlobStore();
    const { fetchApi, transcribeAudio } = useApi();

    const { interview, updateAnswer } = useInterview(id as string);
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
                console.log("updatedQuestion", updatedQuestion);
                setCurrentQuestion(updatedQuestion);

                // Save the updated question with feedback
                const saved = await fetchApi(
                    `/interviews/${interview.id}/questions/${updatedQuestion.id}`,
                    {
                        method: "PUT",
                        body: JSON.stringify(updatedQuestion),
                    }
                );

                console.log("updated question was saved ", saved);
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
                    console.log("evaluationResult", evaluationResult);
                    // new functionality to stream feedback
                    await updateCurrentQuestionWithFeedback(evaluationResult);
                } catch (e) {
                    console.error("there was an error generating feedback", e);
                    setFeedbackStatus("generate");
                    setErrorMessage("Failed to generate feedback. Please try again.");
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

    // 1.Handle submission of recorded answer
    // 2. Save the answer to the database
    // 3. Get feedback from OpenAI
    // 4. Update the question with the feedback

    const transcribedAudio = useCallback(async (formData: FormData) => {
        const { answer, audioUrl } = await transcribeAudio(formData);
        return { answer, audioUrl };
    },[transcribeAudio]);

    const saveAnswer =useCallback( async ({ interviewId, questionId, answer, audioUrl }: SaveAnswerProps) => {
        try {
            const saved = await fetchApi(
                `/interviews/${interviewId}/questions/${questionId}`,
                {
                    method: "PUT",
                    body: JSON.stringify({ answer, audioUrl }),
                }
            );
            console.log("saved", saved);
            return saved;

        } catch (error) {
            console.error('Failed to save answer:', error);
        }
    },[fetchApi]);

    const handleSubmitRecording = useCallback(async () => {
        console.log("handleSubmitRecording");

        setSaveStatus("saving");
        setIsSubmittingRecording(true);
        let audioFile: Blob;
        if (!currentBlob) {
            throw new Error("No audio blob available");
        }
        if (!interview?.id || !currentQuestion?.id) {
            throw new Error("No interview or question id available");
        }
        try {
            const audioResult = createAudioFile(currentBlob);
            if (!audioResult.success || !audioResult.data) {
                throw new Error(audioResult.error?.message || 'Failed to create audio file');
            }
            audioFile = audioResult.data;
            const formData = new FormData();
            formData.append("audio", audioFile, "audio.mp3");

            // Get transcription
            const { answer, audioUrl } = await transcribedAudio(formData);

            // Save answer
            await saveAnswer({ interviewId: interview?.id, questionId: currentQuestion?.id, answer, audioUrl });
            await getFeedback();
            console.log("feedback generated");
        } catch (error) {
            console.error('Failed to create audio file:', error);
        }
    },[interview, currentQuestion, currentBlob, saveAnswer,transcribedAudio,getFeedback]);


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
            {/* Interview Timer */}
            <InterviewTimer
                duration={60}
                hasRecordingStarted={hasRecordingStarted}
                handleTimerComplete={handleTimerComplete}
            />
            <Separator className="my-4" />
            <div className="relative">
                <Visualizer
                    handleSubmitRecording={handleSubmitRecording}
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
