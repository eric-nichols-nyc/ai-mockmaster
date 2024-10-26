"use client";
import React, {
  useEffect,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useState,
} from "react";
import { useVoiceVisualizer, VoiceVisualizer } from "react-voice-visualizer";
import useBlobStore from "@/store/interviewStore";
import { Button } from "@/components/ui/button";

interface VisualizerProps {
  recordingHasStopped: boolean;
  setHasRecordingStopped: (value: boolean) => void;
  setRecordingStarted: (value: boolean) => void;
  hasTimedOut: boolean;
  audioUrl?: string | null;
}

export interface VisualizerRef {
  clearCanvas: () => void;
}

const Visualizer = forwardRef<VisualizerRef, VisualizerProps>(
  (
    { setHasRecordingStopped, setRecordingStarted, hasTimedOut, audioUrl, recordingHasStopped },
    ref
  ) => {
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
      togglePauseResume,
      setPreloadedAudioBlob
    } = recorderControls;

    const { setCurrentBlob } = useBlobStore();
    const [isPlaying, setIsPlaying] = useState(false);

    useImperativeHandle(ref, () => ({
      clearCanvas: () => {
        clearCanvas();
        setHasRecordingStopped(true);
        setRecordingStarted(false);
        setCurrentBlob(null);
      },
    }));

    useEffect(() => {
      console.log("isAvailableRecordedAudio", isAvailableRecordedAudio);
      if (!recordedBlob) return;
      console.log(recordedBlob);
      setHasRecordingStopped(true);
      setCurrentBlob(recordedBlob);
    }, [isAvailableRecordedAudio,recordedBlob, setHasRecordingStopped, setCurrentBlob, audioUrl]);

    useEffect(() => {
      if (!error) return;
      console.error(error);
    }, [error]);

    useEffect(() => {
      if (audioUrl) {
        fetch(audioUrl)
          .then((response) => response.blob())
          .then((blob) => {
            console.log(blob);
            setPreloadedAudioBlob(blob)
          })
          .catch((error) => {
            console.error("Error fetching the MP3 file:", error);
          });
      }
    }, [audioUrl]);

    useEffect(() => {
      if (isRecordingInProgress) {
        console.log("Recording is in progress...");
        setRecordingStarted(true);
      }
      if (hasTimedOut) {
        console.log("hasTimedOut");
        stopRecording();
      }
    }, [
      isRecordingInProgress,
      hasTimedOut,
      stopRecording,
      setRecordingStarted,
      setHasRecordingStopped,
    ]);

    const handleStartRecording = useCallback(() => {
      startRecording();
      setRecordingStarted(true);
      setHasRecordingStopped(false);
    }, [startRecording, setRecordingStarted]);

    const handleStopRecording = useCallback(() => {
      stopRecording();
      setRecordingStarted(false);
      setHasRecordingStopped(true);
      console.log("Stop Recording");
    }, [stopRecording]);

    const handlePlayPause = useCallback(() => {
      if (audioRef.current) {
        if (isPlaying) {
          togglePauseResume();
        } else {
          togglePauseResume();
        }
        setIsPlaying(!isPlaying);
      }
    }, [audioRef, isPlaying, togglePauseResume]);

    return (
      <div className="flex flex-col items-center">
        <VoiceVisualizer
          isControlPanelShown={false}
          controls={recorderControls}
          width={300}
          height={75}
          backgroundColor="transparent"
          mainBarColor="black"
          onlyRecording={true}
        />
        {!isRecordingInProgress && !recordingHasStopped && (
          <Button onClick={handleStartRecording} className="mt-4">
            Start Recording 
          </Button>
        )}
        {isRecordingInProgress && (
          <Button onClick={handleStopRecording} className="mt-4">
            Stop Recording
          </Button>
        )}
        {isAvailableRecordedAudio && (
          <Button onClick={handlePlayPause} className="mt-4">
            Play
          </Button>
        )}
      </div>
    );
  }
);

Visualizer.displayName = "Visualizer";

export default Visualizer;
