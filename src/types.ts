
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