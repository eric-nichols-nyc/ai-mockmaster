import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  initialTime: number; // Initial time in seconds
  onComplete?: () => void; // Optional callback for when timer reaches zero
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ initialTime, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
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
  }, [timeLeft, onComplete]);

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="countdown-timer">
      <h2>Time Remaining</h2>
      <div className="timer-display">{formatTime(timeLeft)}</div>
    </div>
  );
};

export default CountdownTimer;