"use client";
import { useEffect, useRef, useState } from "react";
import { useVoiceVisualizer, VoiceVisualizer } from "react-voice-visualizer";
import { useBlobStore } from "@/store/interviewStore";

interface VisualizerProps {
  setHasRecordingStopped: (value: boolean) => void;
  setRecordingStarted: (value: boolean) => void;
  hasTimedOut: boolean;
}

const Visualizer: React.FC<VisualizerProps> = ({
  setHasRecordingStopped,
  setRecordingStarted,
  hasTimedOut,
}) => {
  const recorderControls = useVoiceVisualizer();
  const { recordedBlob, error, isRecordingInProgress, stopRecording } =
    recorderControls;

  const { setCurrentBlob } = useBlobStore();

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
    }
    if (hasTimedOut) {
      console.log("hasTiimedOut");
      stopRecording();
    }
  }, [isRecordingInProgress, hasTimedOut]);

  return (
    <div>
      <VoiceVisualizer
        controls={recorderControls}
        width={500}
        height={100}
        backgroundColor="transparent"
        mainBarColor="black"
      />
    </div>
  );
};

export default Visualizer;
