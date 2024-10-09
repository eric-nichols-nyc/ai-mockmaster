import React from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { InterviewRecord } from '@/db/schema';
import { motion } from 'framer-motion';

const InterviewCard: React.FC<InterviewRecord> = ({ id, jobTitle, jobDescription, questions }) => {
  const truncateDescription = (text: string | null, maxLength: number) => {
    if (!text) return "No description available";
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  return (
    <Link href={`/dashboard/interview/${id}`} className="block">
      <motion.div
        whileHover={{ scale: 1.03 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Card className="w-full h-full bg-white hover:shadow-lg transition-shadow duration-300 overflow-hidden">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="text-xl font-bold text-gray-800">{jobTitle}</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-gray-600 mb-4 h-12 overflow-hidden">
              {truncateDescription(jobDescription, 100)}
            </p>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>{questions ? questions.length : 0} questions</span>
              <span className="text-blue-500 font-semibold">View Details →</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  )
}

export default InterviewCard