"use client";
import { useEffect } from "react";
import { useVoiceVisualizer, VoiceVisualizer } from "react-voice-visualizer";

interface VisualizerProps {
  setHasRecordingStopped: (value: boolean) => void;
}

const Visualizer: React.FC<VisualizerProps> = ({ setHasRecordingStopped }) => {
  const recorderControls = useVoiceVisualizer();
  const {
    recordedBlob,
    error,
    isRecordingInProgress,
  } = recorderControls;

  // Get the recorded audio blob
  useEffect(() => {
    if (!recordedBlob) return;

    console.log(recordedBlob);
    setHasRecordingStopped(true);
  }, [recordedBlob, setHasRecordingStopped]);

  // Get the error when it occurs
  useEffect(() => {
    if (!error) return;

    console.error(error);
  }, [error]);

  // Reset hasRecordingStopped when starting a new recording
  useEffect(() => {
    if (isRecordingInProgress) {
      setHasRecordingStopped(false);
    }
  }, [isRecordingInProgress, setHasRecordingStopped]);

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