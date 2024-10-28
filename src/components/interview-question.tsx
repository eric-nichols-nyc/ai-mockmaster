import React, { useEffect, useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mic } from "lucide-react";
import { InterviewTimer } from "./interview-timer";
import { QuestionAudio } from "./interview-question-audio";
import Visualizer from "./visualizer";
import { InterviewErrors } from "./interview-errors";
interface InterviewQuestionProps {
  jobTitle: string;
  question: string;
}
const InterviewQuestion = ({ question }: InterviewQuestionProps) => {
  const [hasRecordingStopped, setHasRecordingStopped] = useState(false);
  const [hasRecordingStarted, setHasRecordingStarted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [hasTimedOut, setHasTimedOut] = useState(false);
  const visualizerRef = useRef<{ clearCanvas: () => void } | null>(null);

  // Handle timer completion
  const handleTimerComplete = useCallback(() => {
    setErrorMessage(
      "Interview time has ended. Please submit your final answer."
    );
    setHasRecordingStopped(true);
    setHasTimedOut(true);
  }, []);

  return (
    <Card className="w-full max-w-4xl card-shadow bg-white">
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center mb-4 p-2 bg-yellow-100 rounded-md">
          <div className="flex items-center">
            <Mic className="w-5 h-5 mr-2 text-yellow-600" />
            <p className="text-yellow-800 font-medium">
              Please enable your microphone to start the interview.
            </p>
          </div>
        </div>
        <QuestionAudio question={question} />
        <Separator className="my-4"/>
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
