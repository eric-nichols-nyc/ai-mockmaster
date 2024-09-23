"use client";
import { useEffect, useRef, useState } from "react";
import { useVoiceVisualizer, VoiceVisualizer } from "react-voice-visualizer";
import useInterviewStore from "@/store/interviewStore";

interface VisualizerProps {
  setHasRecordingStopped: (value: boolean) => void;
}

const Visualizer: React.FC<VisualizerProps> = ({ setHasRecordingStopped }) => {
  const recorderControls = useVoiceVisualizer();
  const {
    recordedBlob,
    error,
    isRecordingInProgress,
    stopRecording,
  } = recorderControls;

  const { setCurrentBlob } = useInterviewStore();
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
    setCurrentBlob(recordedBlob); // Store the blob in the interviewStore
  }, [recordedBlob, setHasRecordingStopped, setCurrentBlob]);

  // Get the error when it occurs
  useEffect(() => {
    if (!error) return;

    console.error(error);
  }, [error]);

  // Reset hasRecordingStopped and start time when starting a new recording
  useEffect(() => {
    if (isRecordingInProgress) {
      setHasRecordingStopped(false);
      setRecordingStartTime(Date.now());
      setLastAudioTime(Date.now());
    } else {
      setRecordingStartTime(null);
      setLastAudioTime(null);
    }
  }, [isRecordingInProgress, setHasRecordingStopped]);

  // Handle recording time limit and silence detection
  useEffect(() => {
    if (!isRecordingInProgress || !recordingStartTime) return;

    const checkRecordingStatus = () => {
      const currentTime = Date.now();
      const recordingDuration = currentTime - recordingStartTime;
      const silenceDuration = currentTime - (lastAudioTime || currentTime);

      if (recordingDuration >= 60000 || silenceDuration >= 10000) {
        stopRecording();
        return;
      }

      if (analyserRef.current) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        const sum = dataArray.reduce((a, b) => a + b, 0);
        if (sum > 0) {
          setLastAudioTime(currentTime);
        }
      }

      requestAnimationFrame(checkRecordingStatus);
    };

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          sourceNodeRef.current = audioContextRef.current!.createMediaStreamSource(stream);
          sourceNodeRef.current.connect(analyserRef.current!);
        })
        .catch(err => console.error("Error accessing microphone:", err));
    }

    const animationFrame = requestAnimationFrame(checkRecordingStatus);

    return () => {
      cancelAnimationFrame(animationFrame);
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [isRecordingInProgress, recordingStartTime, lastAudioTime, stopRecording]);

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