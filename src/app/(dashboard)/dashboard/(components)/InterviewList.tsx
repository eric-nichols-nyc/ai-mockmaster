import React from 'react'
import InterviewCard from './interview-card'
import { InterviewRecord } from '@/db/schema';

interface InterviewListProps {
  interviews: InterviewRecord[] | undefined;
}

const InterviewList: React.FC<InterviewListProps> = ({ interviews }) => {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Your Interview Questions</h2>
      {interviews&&interviews.length > 0 ? (
        <div className="space-y-4">
          {interviews.map((interview) => (
            <InterviewCard
              key={interview.id}
              {...interview}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No interviews questions found. Start a new interview!</p>
      )}
    </div>
  )
}

export default InterviewList