export interface InterviewQuestion {
  id: string;
  question: string;
  suggested: string;
  answer?: string;
  audioUrl?: string;
  feedback?: string;
  improvements?: string[];
  keyTakeaways?: string[];
  grade?: string;
  saved?: boolean;
  skills?: string[];
  createdAt?: Date;
  interviewId?: string;
}

export interface Interview {
  id: string;
  userId: string;
  jobTitle: string;
  jobDescription: string | null;
  skills: string[];
  date: Date;
  createdAt: Date;
  completed: boolean;
  questions: InterviewQuestion[];
}

export type QuestionData = InterviewQuestion;

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