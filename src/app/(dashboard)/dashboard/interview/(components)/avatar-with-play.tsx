"use client"
import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AudioRecorderUploader from './audio-recorder';
import { Loader2 } from "lucide-react";
import useInterviewStore from '@/store/interviewStore';

const placeholderQuestion = {
  question: "What are your greatest strengths?",
  answer: "This is a common interview question. You should be prepared to discuss your skills and experiences that are most relevant to the job you're applying for."
};

export default function AvatarWithPlay() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [displayText, setDisplayText] = useState('');
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasRecordingStopped, setHasRecordingStopped] = useState(false);
  const [audioURL, setAudioURL] = useState<string>('');
  const { question } = useInterviewStore();

  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0) {
      handleStopRecording();
    }
    return () => clearTimeout(timerId);
  }, [timeLeft, isTimerRunning]);

  const handlePlay = () => {
    console.log("Play button clicked");
    if (!question) {
      console.error("No question available in the interview store. Using placeholder question.");
      setDisplayText(placeholderQuestion.question);
    } else {
      setDisplayText(question);
    }
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Reset audio to start
      audioRef.current.play();
    }
    setTimeLeft(120); // Reset timer to 2 minutes
    setIsTimerRunning(true); // Start the timer
    setHasRecordingStopped(false);
    setAudioURL(''); // Reset audioURL when starting a new recording
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setIsTimerRunning(false);
    setHasRecordingStopped(true);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleSubmitForAIFeedback = async () => {
    setIsLoading(true);
    // Simulating an async call with a 3-second delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsLoading(false);
    // Redirect to the summary page
    router.push('/dashboard/interview/summary');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Card className="w-full max-w-2xl mb-8">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Enable Video Microphone to start your AI generated mock interview.</p>
        </CardContent>
      </Card>
      <div className="flex flex-col items-center space-y-4">
        <div className="relative w-40 h-40 md:w-[400px] md:h-[400px]">
          <Image
            src="/images/interview/avatar.png"
            alt="Avatar"
            layout="fill"
            objectFit="cover"
            className="rounded-full"
          />
          <Button
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full w-12 h-12 md:w-24 md:h-24 flex items-center justify-center bg-white bg-opacity-70 hover:bg-opacity-90`}
            onClick={handlePlay}
          >
            <span className="text-blue-500 text-2xl md:text-4xl">▶</span>
          </Button>
        </div>
        {isTimerRunning && (
          <div className="mt-2 text-xl font-bold">
            Time remaining: {formatTime(timeLeft)}
          </div>
        )}
        {displayText && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg max-w-2xl text-center">
            {displayText}
          </div>
        )}
        <div className="flex flex-col items-center space-y-4 w-full max-w-2xl">
          <AudioRecorderUploader 
            isRecording={isRecording} 
            onStopRecording={handleStopRecording}
            setIsRecording={setIsRecording}
            setAudioURL={setAudioURL}
          />
          {audioURL && (
            <div className="mt-4">
              <p>Your recorded answer:</p>
              <audio src={audioURL} controls />
            </div>
          )}
          {hasRecordingStopped && (
            <Button 
              onClick={handleSubmitForAIFeedback}
              className="mt-4 bg-green-500 hover:bg-green-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing
                </>
              ) : (
                'Submit for AI feedback'
              )}
            </Button>
          )}
        </div>
      </div>
      <audio ref={audioRef} src="/mp3/speech.wav" />
    </div>
  );
}