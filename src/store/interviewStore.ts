import { create } from 'zustand'
import { Interview } from '@/db/schema';

/**
 * This file contains two stores:
 * 1. useInterviewStore: Holds the state of the interview.
 * 2. useBlobStore: Holds the current blob state.
 */

type QuestionData = {
  id: string;
  grade?: string;
  question: string;
  suggested?: string;
  answer?: string;
  audioUrl?: string;
  feedback?: string;
  improvements?: string[];
  keyTakeaways?: string[];
  createdAt: Date;
};

interface InterviewState {
  interview: Interview | null;
  currentQuestionIndex: number;
  setInterview: (interview: Interview) => void;
  setCurrentQuestionIndex: (index: number) => void;
  updateQuestion: (questionIndex: number, updates: Partial<QuestionData>) => void;
}

const useInterviewStore = create<InterviewState>((set) => ({
  interview: null,
  currentQuestionIndex: 0,
  setInterview: (interview) => set({ interview }),
  setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),
  updateQuestion: (questionIndex, updates) =>
    set((state) => {
      if (!state.interview) return state;
      
      const questions: QuestionData[] = state.interview.questions 
        ? (state.interview.questions as unknown as QuestionData[])
        : [];

      const updatedQuestions = questions.map((q, index) =>
        index === questionIndex ? { ...q, ...updates } : q
      );

      return {
        interview: {
          ...state.interview,
          questions: updatedQuestions as unknown as Interview['questions'],
        },
      };
    }),
}))

interface BlobState {
  currentBlob: Blob | null;
  setCurrentBlob: (blob: Blob) => void;
}

const useBlobStore = create<BlobState>((set) => ({
  currentBlob: null,
  setCurrentBlob: (blob) => set({ currentBlob: blob }),
}))

export { useInterviewStore, useBlobStore }
export default useInterviewStore // For backward compatibility