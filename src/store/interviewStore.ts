import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Interview, QuestionData } from '@/types';

export interface ExtendedInterview extends Interview {
  currentBlob?: Blob;
}

interface InterviewState {
  interview: ExtendedInterview | null;
  currentQuestionIndex: number;
  setInterview: (interview: ExtendedInterview) => void;
  setCurrentQuestionIndex: (index: number) => void;
  updateQuestion: (questionId: string, updates: Partial<QuestionData>) => void;
}

const useInterviewStore = create<InterviewState>()(
  persist(
    (set) => ({
      interview: null,
      currentQuestionIndex: 0,
      setInterview: (interview) => set({
        interview: {
          ...interview,
          questions: Array.isArray(interview.questions)
            ? interview.questions
            : Object.values(interview.questions || {})
        }
      }),
      setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),
      updateQuestion: (questionId, updates) => {
        set((state) => {
          if (!state.interview) return state;

          const updatedQuestions = (state.interview.questions as QuestionData[]).map((q: QuestionData) =>
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
    }),
    {
      name: 'interview-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

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