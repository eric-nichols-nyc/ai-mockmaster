import React from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { InterviewRecord } from '@/db/schema';

const InterviewCard: React.FC<InterviewRecord> = ({ id, jobTitle, jobDescription, questions }) => {
  console.log('questions ', questions)
  return (
    <Link href={`/dashboard/interview/${id}`} className="block">
      <Card className="w-full hover:shadow-md transition-shadow duration-200">
        <CardHeader>
          <CardTitle>{jobTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mt-2">{jobDescription}</p>
          {questions && questions.length > 0 && (
            <div className="mt-4">
              <p className="font-semibold">Your Question:</p>
              <p>{questions[0].question}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

export default InterviewCard