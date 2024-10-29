import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square } from 'lucide-react';

interface RecordButtonProps {
  visualizerRef: React.RefObject<{
    handleStartRecording: () => void;
    handleStopRecording: () => void;
  } | null>;
  isRecording: boolean;
  setIsRecording: (value: boolean) => void;
  disabled?: boolean;
}

const RecordButton = ({ visualizerRef, isRecording, setIsRecording, disabled = false }: RecordButtonProps) => {
  const handleClick = () => {
    if (!visualizerRef.current) return;

    if (!isRecording) {
      visualizerRef.current.handleStartRecording();
      setIsRecording(true);
    } else {
      visualizerRef.current.handleStopRecording();
      setIsRecording(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled}
      className={`flex items-center gap-2 ${
        isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
      } text-white px-4 py-2 rounded-md transition-colors duration-200`}
    >
      {isRecording ? (
        <>
          <Square className="w-4 h-4" />
          Stop Recording
        </>
      ) : (
        <>
          <Mic className="w-4 h-4" />
          Start Recording
        </>
      )}
    </Button>
  );
};

export default RecordButton;