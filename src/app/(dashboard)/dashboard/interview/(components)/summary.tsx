import React from 'react'
import { InterviewRecord } from '@/db/schema'

interface SummaryProps {
  interview: InterviewRecord
}

const Summary: React.FC<SummaryProps> = ({ interview }) => {
  console.log(interview)

  return (
    <div>
      <h1>Interview Summary</h1>
      {/* We'll add more content here later */}
    </div>
  )
}

export default Summary
