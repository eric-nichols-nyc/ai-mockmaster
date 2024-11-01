import { Option } from '@/components/ui/multi-select';

export type FeedbackGrade = {
  letter: string;
  feedback?: string;
}

export interface FeedbackData {
  feedback: string;
  improvements: string[];
  keyTakeaways: string[];
  grade: FeedbackGrade;
}

export type Job = {
  title: string;
  description: string;
  skills: string[];
}

export type SaveAnswerProps = {
  interviewId: string;
  questionId: string;
  answer:string;
  audioUrl:string;
}


export type FormState = {
  jobTitle: string;
  jobDescription: string;
  selectedSkills: string[];
  availableSkills: Option[];
  isSubmitted: boolean;
  isLoading: boolean;
  errors: { [key: string]: string };
}

export type FormAction =
  | { type: 'SET_JOB'; payload: { title: string; description: string; skills: string[] } }
  | { type: 'SET_SKILLS'; payload: string[] }
  | { type: 'SET_AVAILABLE_SKILLS'; payload: Option[] }
  | { type: 'SET_ERRORS'; payload: { [key: string]: string } }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SUBMITTED'; payload: boolean }
  | { type: 'RESET_FORM' };


