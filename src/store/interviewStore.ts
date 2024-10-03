import { create } from 'zustand'
import { Interview as BaseInterview } from '@/db/schema';

export type QuestionData = {
  id: string;
  interviewId: string;
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

export interface ExtendedInterview extends BaseInterview {
  currentBlob?: Blob;
  questions: QuestionData[];
}

interface InterviewState {
  interview: ExtendedInterview | null;
  currentQuestionIndex: number;
  setInterview: (interview: ExtendedInterview) => void;
  setCurrentQuestionIndex: (index: number) => void;
  updateQuestion: (questionId: string, updates: Partial<QuestionData>) => void;
}

const useInterviewStore = create<InterviewState>((set) => ({
  interview: null,
  currentQuestionIndex: 0,
  setInterview: (interview) => set({ interview }),
  setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),
  updateQuestion: (questionId, updates) => {
    console.log(questionId, updates)
    set((state) => {
      if (!state.interview) return state;

      const updatedQuestions = state.interview.questions.map((q) =>
        q.id === questionId ? { ...q, ...updates } : q
      );

      return {
        interview: {
          ...state.interview,
          questions: updatedQuestions,
        },
      };
    })
  }
}));

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