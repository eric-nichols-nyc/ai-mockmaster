// src/hooks/use-button-state.ts
import { useState } from 'react';

export type ButtonState = 'idle' | 'loading' | 'success' | 'error';

interface UseButtonStateProps {
  initialState?: ButtonState;
  onSuccess?: () => void;
  onError?: () => void;
}

const useButtonState = ({ initialState = 'idle', onSuccess, onError }: UseButtonStateProps) => {
  const [state, setState] = useState<ButtonState>(initialState);

  const onSubmit = async () => {
    setState('loading');
    
    try {
      // Simulate an async operation
      //await new Promise(resolve => setTimeout(resolve, 3500));
      setState('success');
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setState('error');
      if (onError) {
        onError();
      }
    }
  };

  const handleButtonSubmit = async (validateForm: () => Promise<boolean>) => {
    setState('loading');
    
    // Validate form
    const isValid = await validateForm();
    // console.log any validation errors
 
    if (isValid) {
      setState('success');
      onSubmit();
    } else {
      setState('error');
    }
    return isValid;
  };

  const getButtonText = () => {
    switch (state) {
      case 'idle':
        return 'Submit Interview Form';
      case 'loading':
        return 'Submitting...';
      case 'success':
        return 'Submitted Successfully!';
      case 'error':
        return 'Submission Failed';
      default:
        return 'Submit';
    }
  };

  return {
    onSubmit,
    state,
    handleButtonSubmit,
    getButtonText,
    setState,
  };
};

export default useButtonState;
