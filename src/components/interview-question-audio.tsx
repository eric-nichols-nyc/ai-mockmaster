import React, {
  useRef,
  useState,
  useEffect,
} from "react";
import { useTTS } from "@/hooks/use-tts";
import { Button } from "./ui/button";
import { PlayIcon } from "lucide-react";
import { Loader2 } from "lucide-react";

type QuestionAudioProps = {
  question: string;
};

export const QuestionAudio = ({ question }: QuestionAudioProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const { audioUrl, isLoading, error, generateAudio } = useTTS({
    text: question,
  });
  const [playError, setPlayError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    setPlayError(error);
  }, [error]);

  // Effect to handle audio playback completion
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;

      const handlePlaying = () => setIsPlaying(true);
      const handleEnded = () => setIsPlaying(false);
      const handleError = (e: Event) => {
        setIsPlaying(false);
        setPlayError("Error playing audio");
        console.error("Audio playback error:", e);
      };

      audio.addEventListener("playing", handlePlaying);
      audio.addEventListener("ended", handleEnded);
      audio.addEventListener("error", handleError);

      if (audioUrl) {
        audio.src = audioUrl;
        audio.play();
      }

      return () => {
        audio.removeEventListener("playing", handlePlaying);
        audio.removeEventListener("ended", handleEnded);
        audio.removeEventListener("error", handleError);
      };
    }
  }, [audioUrl]);

  return (
    <div className="flex flex-col items-center justify-center">
      <h2 className="text-xl mb-6 text-center font-bold">{question}</h2>

      <div className="flex flex-col items-center justify-center m-4">
        <Button
          className="rounded-full w-20 h-20"
          disabled={isLoading || isPlaying}
          onClick={generateAudio}
        >
          {isLoading ? (
            <Loader2 className="w-10 h-10 animate-spin" />
          ) : (
            <PlayIcon className="w-10 h-10" />
          )}
        </Button>
        {playError && <p className="text-red-500">{playError}</p>}
        <audio ref={audioRef} />
      </div>
    </div>
  );
};
