import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface AnimatedButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement> | React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  isSubmitted: boolean;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({ onClick, isLoading, isSubmitted }) => {
  const [stage, setStage] = useState<'generate' | 'thinking' | 'start'>('generate');

  useEffect(() => {
    if (isLoading) {
      setStage('thinking');
    } else if (isSubmitted) {
      setStage('start');
    } else {
      setStage('generate');
    }
  }, [isLoading, isSubmitted]);

  const getButtonText = () => {
    switch (stage) {
      case 'generate':
        return 'Generate Interview';
      case 'thinking':
        return 'Thinking...';
      case 'start':
        return 'Start Interview';
    }
  };

  return (
    <Button
      onClick={(e) => onClick(e)}
      disabled={isLoading}
      className={`w-full sm:w-auto px-6 py-2 transition-all duration-300 ease-in-out transform hover:scale-105 ${
        stage === 'thinking' ? 'animate-pulse' : ''
      }`}
    >
      {getButtonText()}
    </Button>
  );
};

export default AnimatedButton;