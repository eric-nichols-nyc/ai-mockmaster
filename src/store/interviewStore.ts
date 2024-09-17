import { create } from 'zustand'

interface InterviewState {
  currentQuestionIndex: number
  question: string
  answer: string
  setCurrentQuestionIndex: (index: number) => void
  setQuestionAndAnswer: (question: string, answer: string) => void
}

const useInterviewStore = create<InterviewState>((set) => ({
  currentQuestionIndex: 0,
  question: '',
  answer: '',
  setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),
  setQuestionAndAnswer: (question, answer) => set({ question, answer }),
}))

export default useInterviewStore