export type FeedbackData = {
  feedback: string;
  grade: {
    letter: string;
    explanation: string;
  };
  improvements: string[];
  keyTakeaways: string[];
};

export type QuestionData = {
  id: string;
  interviewId: string;
  question: string;
  suggested: string | null;
  answer: string | null;
  feedback: string | null;
  grade: string | null;
  improvements: string[] | null;
  keyTakeaways: string[] | null;
  audioUrl: string | null;
  skills: string[] | null;
  createdAt: Date;
};

export type Interview = {
  id: string;
  createdAt: Date;
  userId: string;
  jobTitle: string;
  jobDescription: string | null;
  skills: string[];
  completed: boolean;
  questions: QuestionData[] | Record<string, QuestionData>;
  date: Date;
};