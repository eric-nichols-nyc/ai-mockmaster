import React from 'react'
import InterviewCard from './Interview'
import { Interview } from '@/db/schema';

interface InterviewListProps {
  interviews: Interview[] | undefined;
}

const InterviewList: React.FC<InterviewListProps> = ({ interviews }) => { 
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Your Interviews</h2>
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
        <p className="text-gray-500">No interviews found. Start a new one!</p>
      )}
    </div>
  )
}

export default InterviewList