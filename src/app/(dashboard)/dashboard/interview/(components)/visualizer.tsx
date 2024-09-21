"use client";
import { useEffect } from "react";
import { useVoiceVisualizer, VoiceVisualizer } from "react-voice-visualizer";
const Visualizer = () => {
  const recorderControls = useVoiceVisualizer();
  const {
    // ... (Extracted controls and states, if necessary)
    recordedBlob,
    error,
  } = recorderControls;

  // Get the recorded audio blob
  useEffect(() => {
    if (!recordedBlob) return;

    console.log(recordedBlob);
  }, [recordedBlob, error]);

  // Get the error when it occurs
  useEffect(() => {
    if (!error) return;

    console.error(error);
  }, [error]);
  return (
    <div>
      {" "}
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
