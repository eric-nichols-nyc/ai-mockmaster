import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  initialTime: number; // Initial time in seconds
  onComplete?: () => void; // Optional callback for when timer reaches zero
  isRunning: boolean; // New prop to control whether the timer is running
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ initialTime, onComplete, isRunning }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (!isRunning) {
      return; // Don't start the timer if isRunning is false
    }

    if (timeLeft <= 0) {
      if (onComplete) {
        onComplete();
      }
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, onComplete, isRunning]);

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center countdown-timer font-semibold">
      <h2>Time Remaining</h2>
      <div className="timer-display text-2xl">{formatTime(timeLeft)}</div>
    </div>
  );
};

export default CountdownTimer;