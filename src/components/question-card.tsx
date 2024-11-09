"use client";
import React from "react";
import Link from "next/link";
import { InterviewQuestion } from "@/db/schema";
import {
  Card,
  CardHeader,
  CardContent,
} from "@/components/ui/card";
import { Trash2, Eye } from "lucide-react";
import { Button } from "./ui/button";

interface QuestionCardProps {
  question: InterviewQuestion;
  onDelete: (questionId: string) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onDelete,
}) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent the Link from navigating
    e.stopPropagation(); // Prevent the event from bubbling up
    onDelete(question.id);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className="w-full h-full flex flex-col hover:shadow-lg transition-shadow duration-300 relative border-gray-100 p-4">
      <CardHeader className="flex-grow space-y-2">
        <p className="text-sm text-gray-500">
          {formatDate(question.createdAt)}
        </p>
        <h2 className="text-xl font-bold text-gray-900">{question.jobTitle}</h2>
        <div className="absolute top-3 right-3 flex items-center space-x-2">
          <Button
            className="p-2 rounded-full transition-colors duration-200 bg-white hover:bg-red-100 hover:shadow-md"
            onClick={handleDelete}
          >
            <Trash2 className="h-5 w-5 text-gray-600 hover:text-red-600" />
          </Button>
          <Button className="p-2 rounded-full transition-colors duration-200 bg-white hover:bg-blue-100 hover:shadow-md">
            <Link
              href={`/interview/${question.interviewId}/summary/${question.id}`}
              passHref
            >
              <Eye className="h-5 w-5 text-gray-600 hover:text-blue-600" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm font-medium leading-5 text-gray-900 line-clamp-4">
            Q1: {question.question}
          </p>
          {/* Add more questions if needed */}
        </div>
      </CardContent>
    </Card>
  );
};
