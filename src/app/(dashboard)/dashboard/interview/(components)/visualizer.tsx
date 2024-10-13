"use client";
import React, { useEffect, useImperativeHandle, forwardRef, useCallback, useRef } from "react";
import { useVoiceVisualizer, VoiceVisualizer } from "react-voice-visualizer";
import useBlobStore from "@/store/interviewStore";
import { Button } from "@/components/ui/button";

interface VisualizerProps {
  setHasRecordingStopped: (value: boolean) => void;
  setRecordingStarted: (value: boolean) => void;
  hasTimedOut: boolean;
}

export interface VisualizerRef {
  clearCanvas: () => void;
}

const Visualizer = forwardRef<VisualizerRef, VisualizerProps>(({
  setHasRecordingStopped,
  setRecordingStarted,
  hasTimedOut,
}, ref) => {
  const recorderControls = useVoiceVisualizer();
  const { recordedBlob, error, isRecordingInProgress, stopRecording, clearCanvas, audioRef, startRecording } =
    recorderControls;

  const { setCurrentBlob } = useBlobStore();

  useImperativeHandle(ref, () => ({
    clearCanvas: () => {
      clearCanvas();
      setHasRecordingStopped(true);
      setRecordingStarted(false);
      setCurrentBlob(null);
    },
  }));

  // Get the recorded audio blob
  useEffect(() => {
    if (!recordedBlob) return;

    console.log(recordedBlob);
    setHasRecordingStopped(true);
    setCurrentBlob(recordedBlob); // Store the blob in the blobStore
  }, [recordedBlob, setHasRecordingStopped, setCurrentBlob]);

  // Get the error when it occurs
  useEffect(() => {
    if (!error) return;

    console.error(error);
  }, [error]);

  // Reset hasRecordingStopped and start time when starting a new recording
  useEffect(() => {
    if (isRecordingInProgress) {
      console.log("Recording is in progress...");
      setRecordingStarted(true);
    }
    if (hasTimedOut) {
      console.log("hasTimedOut");
      stopRecording();
    }
  }, [isRecordingInProgress, hasTimedOut, stopRecording, setRecordingStarted]);

  const handleStartRecording = useCallback(() => {
    startRecording();
    setRecordingStarted(true);
  }, [startRecording, setRecordingStarted]);

  const handleStopRecording = useCallback(() => {
    stopRecording();
  }, [stopRecording]);

  useEffect(() => {
    const currentAudioRef = audioRef.current;
    
    const handleEnded = () => {
      // Handle any logic needed when audio playback ends
    };

    if (currentAudioRef) {
      currentAudioRef.addEventListener('ended', handleEnded);
    }

    return () => {
      if (currentAudioRef) {
        currentAudioRef.removeEventListener('ended', handleEnded);
      }
    };
  }, [audioRef]);

  return (
    <div className="flex flex-col items-center">
      <VoiceVisualizer
        controls={recorderControls}
        width={500}
        height={100}
        backgroundColor="transparent"
        mainBarColor="black"
      />
      {!isRecordingInProgress && !recordedBlob && (
        <Button onClick={handleStartRecording} className="mt-4">
          Start Recording
        </Button>
      )}
      {isRecordingInProgress && (
        <Button onClick={handleStopRecording} className="mt-4">
          Stop Recording
        </Button>
      )}
    </div>
  );
});

Visualizer.displayName = "Visualizer";

export default Visualizer;
