import React from 'react'
import { CountdownCircleTimer } from 'react-countdown-circle-timer'


type InterviewTimerProps = {
    hasRecordingStarted: boolean;
    handleTimerComplete: () => void;
    duration: number;
}
const renderTime = ({ remainingTime }: { remainingTime: number }) => {
    if (remainingTime === 0) {
      return <div className="timer">Interview time is up!</div>;
    }
    return <div className="timer text-4xl font-bold">{remainingTime}s</div>; // Add this line
  }; // Add closing bracket
  
export const InterviewTimer = ({hasRecordingStarted, handleTimerComplete, duration}: InterviewTimerProps) => {
  return (
    <div className="timer-wrapper flex justify-center">
            <CountdownCircleTimer
              isPlaying={hasRecordingStarted}
              duration={duration}
              colors={["#004777", "#F7B801", "#A30000", "#A30000"]}
              colorsTime={[10, 6, 3, 0]}
              onComplete={() => ({
                shouldRepeat: false,
                delay: 1,
                handleTimerComplete,
              })}
            >
              {renderTime}
            </CountdownCircleTimer>
          </div>
  )
}

