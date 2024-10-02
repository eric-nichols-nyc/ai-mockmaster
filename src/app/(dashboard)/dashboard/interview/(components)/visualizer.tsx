"use client";
import { useEffect, useRef, useState } from "react";
import { useVoiceVisualizer, VoiceVisualizer } from "react-voice-visualizer";
import { useBlobStore } from "@/store/interviewStore";

interface VisualizerProps {
  setHasRecordingStopped: (value: boolean) => void;
  setRecordingStarted: (value: boolean) => void
  hasTimedOut: boolean;
}

type AudioContextType = typeof AudioContext;

interface ExtendedWindow extends Window {
  AudioContext: AudioContextType;
  webkitAudioContext?: AudioContextType;
}

declare const window: ExtendedWindow;

const Visualizer: React.FC<VisualizerProps> = ({ 
  setHasRecordingStopped, 
  setRecordingStarted, 
  hasTimedOut 
}) => {
  const recorderControls = useVoiceVisualizer();
  const {
    recordedBlob,
    error,
    isRecordingInProgress,
    stopRecording,
    onStartRecording
  } = recorderControls;

  const { setCurrentBlob } = useBlobStore();
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  const [lastAudioTime, setLastAudioTime] = useState<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);

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
      setRecordingStarted(true)
      setRecordingStartTime(Date.now());
      setLastAudioTime(Date.now());
    } else {
      setRecordingStartTime(null);
      setLastAudioTime(null);
    }
    if(hasTimedOut){
      console.log('hasTiimedOut')
      stopRecording();
    }
  }, [isRecordingInProgress, hasTimedOut]);


  // Handle recording time limit and silence detection
  //useEffect(() => {
   // if (!isRecordingInProgress || !recordingStartTime) return;

    // const checkRecordingStatus = () => {
    //   const currentTime = Date.now();
    //   const recordingDuration = currentTime - recordingStartTime;
    //   //const silenceDuration = currentTime - (lastAudioTime || currentTime);

    //   if (recordingDuration >= 60000) {
    //     stopRecording();
    //     return;
    //   }

      // if (analyserRef.current) {
      //   console.log("Recording")
      //   const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      //   analyserRef.current.getByteFrequencyData(dataArray);
      //   const sum = dataArray.reduce((a, b) => a + b, 0);
      //   if (sum > 0) {
      //     setLastAudioTime(currentTime);
      //   }
      // }

      //requestAnimationFrame(checkRecordingStatus);
    //};

    // if (!audioContextRef.current) {
    //   console.log('No audio context')
    //   const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    //   if (AudioContextClass) {
    //     audioContextRef.current = new AudioContextClass();
    //     analyserRef.current = audioContextRef.current.createAnalyser();
    //     navigator.mediaDevices.getUserMedia({ audio: true })
    //       .then(stream => {
    //         if (audioContextRef.current && analyserRef.current) {
    //           sourceNodeRef.current = audioContextRef.current.createMediaStreamSource(stream);
    //           sourceNodeRef.current.connect(analyserRef.current);
    //         }
    //       })
    //       .catch(err => console.error("Error accessing microphone:", err));
    //   } else {
    //     console.error("AudioContext is not supported in this browser");
    //   }
    // }

    //const animationFrame = requestAnimationFrame(checkRecordingStatus);

    //return () => {
      //cancelAnimationFrame(animationFrame);
      // if (sourceNodeRef.current) {
      //   sourceNodeRef.current.disconnect();
      // }
      // if (audioContextRef.current) {
      //   audioContextRef.current.close();
      //   audioContextRef.current = null;
      // }
    //};
  //}, [isRecordingInProgress, recordingStartTime, stopRecording]);

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