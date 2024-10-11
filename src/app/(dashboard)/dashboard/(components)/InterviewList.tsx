import React from 'react'
import InterviewCard from './interview-card'
import { InterviewRecord, InterviewQuestionRecord } from '@/db/schema';
import { motion } from 'framer-motion';

interface InterviewListProps {
  interviews: (Omit<InterviewRecord, 'questions'> & { questions: InterviewQuestionRecord[] })[] | undefined;
  onDeleteInterview: (id: string) => void;
}

const InterviewList: React.FC<InterviewListProps> = ({ interviews, onDeleteInterview }) => {
  return (
    <div className="space-y-6">
      {interviews && interviews.length > 0 ? (
        <motion.div 
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {interviews.map((interview, index) => (
            <motion.div
              key={interview.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <InterviewCard
                id={interview.id}
                jobTitle={interview.jobTitle}
                jobDescription={interview.jobDescription}
                questions={interview.questions}
                userId={interview.userId}
                skills={interview.skills || []}
                date={interview.date}
                createdAt={interview.createdAt}
                completed={interview.completed}
                onDelete={onDeleteInterview}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div 
          className="text-center py-12 bg-gray-100 rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-gray-600 text-lg mb-4">No interviews found.</p>
          <p className="text-gray-500">Start a new interview to see it here!</p>
        </motion.div>
      )}
    </div>
  )
}

export default InterviewList
