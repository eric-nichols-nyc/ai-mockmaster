import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2, Send, Check, XCircle } from 'lucide-react';

type SubmitStatus = 'idle' | 'saving' | 'success' | 'error';
type FeedbackStatus = 'generate' | 'thinking' | 'ready';

interface SubmitButtonProps {
  onSubmit: () => void;
  onFeedbackSubmit?: (value: boolean) => void;
  saveStatus: SubmitStatus;
  feedbackStatus: FeedbackStatus;
  isSubmitting: boolean;
  disabled?: boolean;
  showFeedback?: boolean;
}

const SubmitButton = ({ 
  onSubmit, 
  onFeedbackSubmit,
  saveStatus, 
  feedbackStatus,
  isSubmitting,
  disabled = false,
  showFeedback = false
}: SubmitButtonProps) => {
  const handleClick = () => {
    if (saveStatus === 'success' && feedbackStatus === 'ready' && onFeedbackSubmit) {
        console.log('onFeedbackSubmit called');
      onFeedbackSubmit(false);
    } else {
      onSubmit();
    }
  };

  const buttonVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.02 },
    tap: { scale: 0.98 },
  };

  const iconVariants = {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 10 }
  };

  const getButtonContent = () => {
    if (isSubmitting || saveStatus === 'saving') {
      return (
        <>
          <motion.div
            variants={iconVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          </motion.div>
          Submitting...
        </>
      );
    }

    if (saveStatus === 'success' && showFeedback) {
      switch (feedbackStatus) {
        case 'generate':
        case 'thinking':
          return (
            <>
              <motion.div
                variants={iconVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              </motion.div>
              AI is thinking...
            </>
          );
        case 'ready':
          return (
            <>
              <motion.div
                variants={iconVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Check className="mr-2 h-4 w-4" />
              </motion.div>
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
          <motion.div
            variants={iconVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Check className="mr-2 h-4 w-4" />
          </motion.div>
          Submitted Successfully
        </>
      );
    }

    if (saveStatus === 'error') {
      return (
        <>
          <motion.div
            variants={iconVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <XCircle className="mr-2 h-4 w-4" />
          </motion.div>
          Error - Try Again
        </>
      );
    }

    return (
      <>
        <motion.div
          variants={iconVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <Send className="mr-2 h-4 w-4" />
        </motion.div>
        Submit Answer
      </>
    );
  };

  const getButtonStyles = () => {
    const baseStyles = 'flex items-center justify-center gap-2 min-w-[160px] transition-all duration-200 w-full';
    
    if (saveStatus === 'error') {
      return `${baseStyles} bg-red-500 hover:bg-red-600`;
    }
    
    if (feedbackStatus === 'ready') {
      return `${baseStyles} bg-green-500 hover:bg-green-600`;
    }
    
    return `${baseStyles} bg-blue-500 hover:bg-blue-600`;
  };

  const isButtonDisabled = () => {
    if (feedbackStatus === 'thinking') return true;
    if (isSubmitting || saveStatus === 'saving') return true;
    return disabled;
  };

  return (
    <motion.div
      variants={buttonVariants}
      initial="idle"
      whileHover="hover"
      whileTap="tap"
      animate={isButtonDisabled() ? "idle" : undefined}
    >
      <Button
        onClick={handleClick}
        disabled={isButtonDisabled()}
        className={getButtonStyles()}
      >
        {getButtonContent()}
      </Button>
    </motion.div>
  );
};

export default SubmitButton;