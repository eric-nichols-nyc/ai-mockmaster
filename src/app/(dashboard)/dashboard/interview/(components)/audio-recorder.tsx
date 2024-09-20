"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";

interface AudioRecorderUploaderProps {
  isRecording: boolean;
  onStopRecording: (transcription: string, audioUrl: string) => void;
  setIsRecording: React.Dispatch<React.SetStateAction<boolean>>;
  setAudioURL: React.Dispatch<React.SetStateAction<string>>;
  setAudioFile: (value: File) => void;
  isDisabled: boolean;
}

const AudioRecorderUploader: React.FC<AudioRecorderUploaderProps> = ({ 
  isRecording, 
  onStopRecording, 
  setIsRecording, 
  setAudioURL,
  setAudioFile,
  isDisabled 
}) => {

  const [error, setError] = useState<string>("");
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const animationFrameId = useRef<number | null>(null);
  const latestAudioBlob = useRef<Blob | null>(null);

  useEffect(() => {
    if (isRecording && !mediaRecorder.current) {
      startRecording();
    } else if (!isRecording && mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      stopRecording();
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Audio recording is not supported in this browser.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);

      mediaRecorder.current.ondataavailable = (event: BlobEvent) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        latestAudioBlob.current = new Blob(audioChunks.current, { type: "audio/mp3" });
        const audioFile = new File([latestAudioBlob.current], 'recording.mp3', { type: 'audio/mp3' });
        setAudioFile(audioFile);
        audioChunks.current = [];
        updateAudioURL();
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setError("");

      const checkRecorderState = () => {
        if (mediaRecorder.current && isRecording) {
          if (mediaRecorder.current.state === "inactive" && audioChunks.current.length > 0) {
            latestAudioBlob.current = new Blob(audioChunks.current, { type: "audio/webm" });
            audioChunks.current = [];
            updateAudioURL();
          } else {
            animationFrameId.current = requestAnimationFrame(checkRecorderState);
          }
        }
      };
      animationFrameId.current = requestAnimationFrame(checkRecorderState);

    } catch (error) {
      console.error("Error starting recording:", error);
      setError("Failed to start recording. Please ensure you have granted microphone permissions.");
      setIsRecording(false);
    }
  };

  const stopRecording = useCallback(async () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();

      if (mediaRecorder.current.stream) {
        mediaRecorder.current.stream
          .getTracks()
          .forEach((track) => track.stop());
      }
    }

    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }

    setIsRecording(false);

    if (latestAudioBlob.current) {
      try {
        const audioFile = new File([latestAudioBlob.current], 'recording.mp3', { type: 'audio/mp3' });
        const formData = new FormData();
        formData.append('audio', audioFile);

        const response = await fetch('/api/transcript', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const { transcription, audioUrl } = await response.json();
        onStopRecording(transcription, audioUrl);
      } catch (error) {
        console.error('Error transcribing audio:', error);
        setError("Failed to transcribe audio. Please try again.");
      }
    }
  }, [onStopRecording, setIsRecording]);

  const updateAudioURL = useCallback(() => {
    if (latestAudioBlob.current) {
      const newAudioUrl = URL.createObjectURL(latestAudioBlob.current);
      setAudioURL(newAudioUrl);
    }
  }, [setAudioURL]);

  const handleRecordingToggle = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, stopRecording]);

  return (
    <div>
      <div className="flex flex-col items-center w-full">
        <button
          onClick={handleRecordingToggle}
          className={`mt-10 flex items-center justify-center rounded-full w-20 h-20 focus:outline-none ${
            isRecording ? 'bg-red-400 hover:bg-red-500' : 'bg-blue-400 hover:bg-blue-500'
          } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isDisabled}
        >
          {isRecording ? (
            <svg
              className="h-12 w-12"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path fill="white" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 256 256"
              xmlns="http://www.w3.org/2000/svg"
              className="w-12 h-12 text-white"
            >
              <path
                fill="currentColor"
                d="M128 176a48.05 48.05 0 0 0 48-48V64a48 48 0 0 0-96 0v64a48.05 48.05 0 0 0 48 48ZM96 64a32 32 0 0 1 64 0v64a32 32 0 0 1-64 0Zm40 143.6V232a8 8 0 0 1-16 0v-24.4A80.11 80.11 0 0 1 48 128a8 8 0 0 1 16 0a64 64 0 0 0 128 0a8 8 0 0 1 16 0a80.11 80.11 0 0 1-72 79.6Z"
              />
            </svg>
          )}
        </button>
        {error && (
          <p className="text-red-500 mt-2">{error}</p>
        )}
      </div>
    </div>
  );
};

export default AudioRecorderUploader;
