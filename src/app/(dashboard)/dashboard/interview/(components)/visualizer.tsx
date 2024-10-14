"use client";
import React, { useEffect, useImperativeHandle, forwardRef, useCallback, useState } from "react";
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
  const { 
    recordedBlob, 
    error, 
    isRecordingInProgress, 
    stopRecording, 
    clearCanvas, 
    audioRef, 
    startRecording, 
    isAvailableRecordedAudio,
    togglePauseResume
  } = recorderControls;

  const { setCurrentBlob } = useBlobStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  useImperativeHandle(ref, () => ({
    clearCanvas: () => {
      clearCanvas();
      setHasRecordingStopped(true);
      setRecordingStarted(false);
      setCurrentBlob(null);
    },
  }));

  useEffect(() => {
    if (!recordedBlob) return;
    console.log(recordedBlob);
    setHasRecordingStopped(true);
    setCurrentBlob(recordedBlob);
  }, [recordedBlob, setHasRecordingStopped, setCurrentBlob]);

  useEffect(() => {
    if (!error) return;
    console.error(error);
  }, [error]);

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

  const handlePlayPause = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [audioRef, isPlaying]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  }, [audioRef]);

  useEffect(() => {
    const currentAudioRef = audioRef.current;
    
    const handleTimeUpdate = () => {
      if (currentAudioRef) {
        setCurrentTime(currentAudioRef.currentTime);
      }
    };

    const handleDurationChange = () => {
      if (currentAudioRef) {
        setDuration(currentAudioRef.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    if (currentAudioRef) {
      currentAudioRef.addEventListener('timeupdate', handleTimeUpdate);
      currentAudioRef.addEventListener('durationchange', handleDurationChange);
      currentAudioRef.addEventListener('ended', handleEnded);
    }

    return () => {
      if (currentAudioRef) {
        currentAudioRef.removeEventListener('timeupdate', handleTimeUpdate);
        currentAudioRef.removeEventListener('durationchange', handleDurationChange);
        currentAudioRef.removeEventListener('ended', handleEnded);
      }
    };
  }, [audioRef]);

  return (
    <div className="flex flex-col items-center">
      <VoiceVisualizer
       isControlPanelShown={false}
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
      {/* show play/pause button if recordedBlob is available */}
      {isAvailableRecordedAudio && (
        <Button onClick={togglePauseResume} className="mt-4">
          Play
        </Button>
      )}
    </div>
  );
});

Visualizer.displayName = "Visualizer";

export default Visualizer;
