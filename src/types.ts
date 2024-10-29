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