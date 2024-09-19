import { create } from 'zustand'

export interface InterviewState {
  currentQuestionIndex: number
  question: string
  answer: string
  userAnswer: string
  recordedAnswer: string
  grade: string
  summary: string
  feedback: string
  improvements: string[]
  keyTakeaways: string[]
  setCurrentQuestionIndex: (index: number) => void
  setQuestionAndAnswer: (question: string, answer: string) => void
  setUserAnswer: (userAnswer: string) => void
  setRecordedAnswer: (recordedAnswer: string) => void
  setGrade: (grade: string) => void
  setSummary: (summary: string) => void
  setFeedback: (feedback: string) => void
  setImprovements: (improvements: string[]) => void
  setKeyTakeaways: (keyTakeaways: string[]) => void
}

const useInterviewStore = create<InterviewState>((set) => ({
  currentQuestionIndex: 0,
  question: '',
  answer: '',
  userAnswer: '',
  recordedAnswer: '',
  grade: '',
  summary: '',
  feedback: '',
  improvements: [],
  keyTakeaways: [],
  setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),
  setQuestionAndAnswer: (question, answer) => set({ question, answer }),
  setUserAnswer: (userAnswer) => set({ userAnswer }),
  setRecordedAnswer: (recordedAnswer) => set({ recordedAnswer }),
  setGrade: (grade) => set({ grade }),
  setSummary: (summary) => set({ summary }),
  setFeedback: (feedback) => set({ feedback }),
  setImprovements: (improvements) => set({ improvements }),
  setKeyTakeaways: (keyTakeaways) => set({ keyTakeaways }),
}))

export default useInterviewStore