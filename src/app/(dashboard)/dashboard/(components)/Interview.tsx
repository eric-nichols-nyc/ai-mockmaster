import React from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface InterviewProps {
  id: number;
  jobTitle: string;
  date: string;
  jobDescription: string;
}

const Interview: React.FC<InterviewProps> = ({ id, jobTitle, date, jobDescription }) => {
  return (
    <Link href={`/dashboard/interview/${id}`} className="block">
      <Card className="w-full hover:shadow-md transition-shadow duration-200">
        <CardHeader>
          <CardTitle>{jobTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">{date}</p>
          <p className="mt-2">{jobDescription}</p>
        </CardContent>
      </Card>
    </Link>
  )
}

export default Interview