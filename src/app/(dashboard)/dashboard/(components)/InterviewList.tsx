import React from 'react'
import Interview from './Interview'

interface Interview {
  id: number;
  jobTitle: string;
  date: string;
  jobDescription: string;
}

interface InterviewListProps {
  interviews: Interview[];
}

const InterviewList: React.FC<InterviewListProps> = ({ interviews }) => { 
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Your Interviews</h2>
      {interviews.length > 0 ? (
        <div className="space-y-4">
          {interviews.map((interview) => (
            <Interview
              key={interview.id}
              id={interview.id}
              jobTitle={interview.jobTitle}
              date={interview.date}
              jobDescription={interview.jobDescription}
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