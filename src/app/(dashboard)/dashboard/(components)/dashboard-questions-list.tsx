import React from 'react';
import { QuestionCard } from '@/components/question-card';
import { InterviewQuestion } from '@/db/schema';

interface DashboardQuestionsListProps {
  questions: InterviewQuestion[];
  onDelete: (questionId: string) => Promise<void>;
}

export const DashboardQuestionsList: React.FC<DashboardQuestionsListProps> = ({ questions, onDelete }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Interview Questions</h2>
      {questions.length > 0 ? (
        questions.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            onDelete={onDelete}
          />
        ))
      ) : (
        <p>No questions found. Start by adding some interview questions!</p>
      )}
    </div>
  );
};
