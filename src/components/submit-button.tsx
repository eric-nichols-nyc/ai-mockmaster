import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Send, Check, XCircle } from 'lucide-react';

type SubmitStatus = 'idle' | 'saving' | 'success' | 'error';
type FeedbackStatus = 'generate' | 'thinking' | 'ready';

interface SubmitButtonProps {
  onSubmit: () => void;
  saveStatus: SubmitStatus;
  feedbackStatus: FeedbackStatus;
  isSubmitting: boolean;
  disabled?: boolean;
  showFeedback?: boolean;
}

const SubmitButton = ({ 
  onSubmit, 
  saveStatus, 
  feedbackStatus,
  isSubmitting,
  disabled = false,
  showFeedback = false
}: SubmitButtonProps) => {
  const getButtonContent = () => {
    if (isSubmitting || saveStatus === 'saving') {
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Submitting...
        </>
      );
    }

    if (saveStatus === 'success' && showFeedback) {
      switch (feedbackStatus) {
        case 'generate':
          return (
            <>
              <Send className="mr-2 h-4 w-4" />
              Generate Results
            </>
          );
        case 'thinking':
          return (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              AI is thinking...
            </>
          );
        case 'ready':
          return (
            <>
              <Check className="mr-2 h-4 w-4" />
              See Results
            </>
          );
        default:
          return 'Submit';
      }
    }

    if (saveStatus === 'success') {
      return (
        <>
          <Check className="mr-2 h-4 w-4" />
          Submitted Successfully
        </>
      );
    }

    if (saveStatus === 'error') {
      return (
        <>
          <XCircle className="mr-2 h-4 w-4" />
          Error - Try Again
        </>
      );
    }

    return (
      <>
        <Send className="mr-2 h-4 w-4" />
        Submit Answer
      </>
    );
  };

  const getButtonStyles = () => {
    const baseStyles = 'flex items-center justify-center gap-2 min-w-[160px] transition-all duration-200';
    
    if (saveStatus === 'error') {
      return `${baseStyles} bg-red-500 hover:bg-red-600`;
    }
    
    if (saveStatus === 'success') {
      return `${baseStyles} bg-green-500 hover:bg-green-600`;
    }
    
    return `${baseStyles} bg-blue-500 hover:bg-blue-600`;
  };

  return (
    <Button
      onClick={onSubmit}
      disabled={disabled || isSubmitting || (saveStatus === 'saving')}
      className={getButtonStyles()}
    >
      {getButtonContent()}
    </Button>
  );
};

export default SubmitButton;