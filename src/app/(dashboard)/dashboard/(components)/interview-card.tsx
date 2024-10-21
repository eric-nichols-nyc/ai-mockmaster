import React from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { InterviewRecord, InterviewQuestionRecord } from '@/db/schema';
import { motion } from 'framer-motion';
import { Calendar, Trash2 } from 'lucide-react';

type InterviewCardProps = Omit<InterviewRecord, 'questions'> & {
  questions: InterviewQuestionRecord[];
  onDelete: (id: string) => void;
};

const InterviewCard: React.FC<InterviewCardProps> = ({ id, jobTitle, jobDescription, date, questions, skills, onDelete }) => {
  const truncateText = (text: string | null, maxLength: number) => {
    if (!text) return "No description available";
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };
  console.log(questions)

  const firstSavedQuestionId = questions.find(q => q.saved)?.id;
  const firstSavedQuestion = questions.find(q => q.saved)?.question || "No saved questions";

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(id);
  };

  return (
    <Link href={`/dashboard/interview/${id}/review/${firstSavedQuestionId ? `/${firstSavedQuestionId}` : ''}`} className="block">
      <motion.div
        whileHover={{ scale: 1.03 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Card className="w-full h-full bg-white hover:shadow-lg transition-shadow duration-300 overflow-hidden relative">
          <CardHeader className="bg-gray-50 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-bold text-gray-800">{jobTitle}</CardTitle>
              <Button variant="ghost" size="icon" onClick={handleDelete} className="absolute top-2 right-2">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="mr-2 h-4 w-4" />
              <p>{new Date(date).toLocaleDateString()}</p>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-gray-600 mb-4 h-12 overflow-hidden">
              {truncateText(jobDescription, 100)}
            </p>
            <p className="text-gray-600 mb-4 h-12 overflow-hidden">
              {truncateText(firstSavedQuestion, 100)}
            </p>
            <div className="flex justify-between items-center text-sm">
              <div className="space-x-2">
                {skills && skills.slice(0, 2).map((skill, index) => (
                  <Badge key={index} variant="secondary">{skill}</Badge>
                ))}
              </div>
              <span className="text-blue-500 font-semibold">View Details →</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  )
}

export default InterviewCard
