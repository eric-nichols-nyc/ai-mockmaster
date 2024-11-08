"use client"
import React from 'react';
import Link from 'next/link';
import { InterviewQuestion } from '@/db/schema';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Calendar, ArrowRight } from 'lucide-react';
import { Separator } from './ui/separator';

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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Link href={`/interview/${question.interviewId}/summary/${question.id}`} passHref>
      <Card className="w-full h-full flex flex-col hover:shadow-lg transition-shadow duration-300 cursor-pointer relative">
        <CardHeader className="flex-grow">
          <div 
            className="absolute top-2 right-2 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            onClick={handleDelete}
          >
            <Trash2 className="h-5 w-5 text-gray-500 hover:text-red-500" />
          </div>
            <p className="text-md font-semibold pr-6">{question.question}</p> {/* Full question text */}
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {question.skills && question.skills.length > 0 && (
              <div>
                <strong className="text-sm text-gray-600">Skills:</strong>
                <div className="flex flex-wrap gap-1 mt-1">
                  {question.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <Separator />
        <CardFooter className="text-sm text-gray-500 flex items-center bg-white pt-3">
          {/* Removed the div above the calendar component */}
          <Calendar className="h-4 w-4 mr-1" />
          {formatDate(question.createdAt)}
          <div className="ml-auto flex items-center text-blue-500 cursor-pointer">
            <span className="mr-1">View Details</span>
            <ArrowRight className="h-4 w-4" /> {/* Right arrow icon */}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};
