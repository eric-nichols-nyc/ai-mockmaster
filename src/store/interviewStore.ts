import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Interview as BaseInterview } from '@/db/schema';

export type QuestionData = {
  id: string;
  interviewId: string;
  grade: string | null;
  question: string;
  suggested: string | null;
  answer: string | null;
  audioUrl: string | null;
  feedback: string | null;
  improvements: string[] | null;
  keyTakeaways: string[] | null;
  skills: string[] | null; // Added skills property as optional
  createdAt: Date;
};

export interface ExtendedInterview extends Omit<BaseInterview, 'questions'> {
  currentBlob?: Blob;
  questions: QuestionData[] | Record<string, QuestionData>;
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