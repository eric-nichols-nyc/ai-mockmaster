import { create } from 'zustand'

export interface Question {
  id: string;
  question: string;
  answer: string;
  userAnswer?: string;
  recordedAnswer?: string;
  grade?: string;
  feedback?: string;
}

export interface Interview {
  id: string;
  title: string;
  jobTitle: string;
  jobDescription: string;
  questions: Question[];
  currentQuestionIndex: number;
  summary?: string;
  improvements?: string[];
  keyTakeaways?: string[];
  currentBlob?: Blob;
}

interface InterviewState {
  interview: Interview | null;
  currentBlob?: Blob | null; // New field for storing the current
  setInterview: (interview: Interview) => void;
  setCurrentQuestionIndex: (index: number) => void;
  updateQuestion: (questionId: string, updates: Partial<Question>) => void;
  setSummary: (summary: string) => void;
  setImprovements: (improvements: string[]) => void;
  setKeyTakeaways: (keyTakeaways: string[]) => void;
  setCurrentBlob: (blob: Blob) => void; // New function to set the current blob
}

const useInterviewStore = create<InterviewState>((set) => ({
  interview: null,
  currentQuestionIndex: 0,
  currentBlob: null,
  setInterview: (interview) => set({ interview }),
  setCurrentQuestionIndex: (index) => 
    set((state) => ({
      interview: state.interview 
        ? { ...state.interview, currentQuestionIndex: index }
        : null
    })),
  updateQuestion: (questionId, updates) =>
    set((state) => ({
      interview: state.interview
        ? {
            ...state.interview,
            questions: state.interview.questions.map((q) =>
              q.id === questionId ? { ...q, ...updates } : q
            ),
          }
        : null
    })),
  setSummary: (summary) =>
    set((state) => ({
      interview: state.interview
        ? { ...state.interview, summary }
        : null
    })),
  setImprovements: (improvements) =>
    set((state) => ({
      interview: state.interview
        ? { ...state.interview, improvements }
        : null
    })),
  setKeyTakeaways: (keyTakeaways) =>
    set((state) => ({
      interview: state.interview
        ? { ...state.interview, keyTakeaways }
        : null
    })),
  setCurrentBlob: (blob) =>
    set((state) => ({
      interview: state.interview
        ? { ...state.interview, currentBlob: blob }
        : null
    })),
}))

export default useInterviewStore