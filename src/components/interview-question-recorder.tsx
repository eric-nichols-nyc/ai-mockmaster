import React, { useRef } from 'react'
import Visualizer from './visualizer'

type QuestionRecorderProps = {
    hasRecordingStopped: boolean;
    hasTimedOut: boolean;
    setHasRecordingStopped: (value: boolean) => void;
    setHasRecordingStarted: (value: boolean) => void;
}

export const QuestionRecorder = ({hasRecordingStopped, hasTimedOut, setHasRecordingStopped, setHasRecordingStarted}: QuestionRecorderProps) => {
  const visualizerRef = useRef<{ clearCanvas: () => void } | null>(null);

  return (
    <div className="relative">
      <Visualizer
        ref={visualizerRef}
        recordingHasStopped={hasRecordingStopped}
        hasTimedOut={hasTimedOut}
        setHasRecordingStopped={setHasRecordingStopped}
        setRecordingStarted={setHasRecordingStarted}
      />
  </div>
  )
}
