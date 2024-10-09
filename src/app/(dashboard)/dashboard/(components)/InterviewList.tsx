import React from 'react'
import InterviewCard from './interview-card'
import { InterviewRecord } from '@/db/schema';
import { motion } from 'framer-motion';

interface InterviewListProps {
  interviews: InterviewRecord[] | undefined;
}

const InterviewList: React.FC<InterviewListProps> = ({ interviews }) => {
  return (
    <div className="space-y-6">
      {interviews && interviews.length > 0 ? (
        <motion.div 
          className="grid gap-6 md:grid-cols-2"
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
              <InterviewCard {...interview} />
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