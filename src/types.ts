export  type FeedbackData = {
    feedback: string;
    grade: {
      letter: string;
      explanation: string;
    };
    improvements: string[];
    keyTakeaways: string[];
  };