"use client"
import React from 'react';
import { QuestionCard } from '@/components/question-card';
import { InterviewQuestion } from '@/db/schema';
import { deleteQuestionAndInterview } from '@/actions/interview-actions';
import { toast } from 'sonner';

interface DashboardQuestionsListProps {
  questions: InterviewQuestion[];
}

export const DashboardQuestionsList: React.FC<DashboardQuestionsListProps> = ({ questions }) => {
  const [localQuestions, setLocalQuestions] = React.useState(questions);

  const handleDelete = async (questionId: string) => {
    try {
      const result = await deleteQuestionAndInterview({ questionId });
      if (result.success) {
        setLocalQuestions(prevQuestions => prevQuestions.filter(q => q.id !== questionId));
        toast.success('Question and associated interview deleted successfully');
      } else {
        toast.error('Failed to delete question and interview');
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('An error occurred while deleting the question');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Interview Questions</h2>
      {localQuestions.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {localQuestions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <p>No questions found. Start by adding some interview questions!</p>
      )}
    </div>
  );
};
