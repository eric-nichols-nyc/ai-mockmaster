"use client"
import React from 'react';
import Link from 'next/link';
import { InterviewQuestion } from '@/db/schema';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from 'lucide-react';

interface QuestionCardProps {
  question: InterviewQuestion;
  onDelete: (questionId: string) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, onDelete }) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent the Link from navigating
    e.stopPropagation(); // Prevent the event from bubbling up
    onDelete(question.id);
  };

  return (
    <Link href={`/dashboard/interview/${question.interviewId}/review/${question.id}`} passHref>
      <Card className="w-full mb-4 hover:shadow-lg transition-shadow duration-300 cursor-pointer relative">
        <CardHeader>
          <CardTitle className="text-lg font-semibold pr-8">{question.question}</CardTitle>
          <div 
            className="absolute top-2 right-2 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            onClick={handleDelete}
          >
            <Trash2 className="h-5 w-5 text-gray-500 hover:text-red-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {question.skills && question.skills.length > 0 && (
              <div>
                <strong>Skills:</strong>
                <div className="flex flex-wrap gap-1 mt-1">
                  {question.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
