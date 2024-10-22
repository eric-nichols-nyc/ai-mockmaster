import React from 'react'
import Summary from '../../../(components)/summary'
import { getInterviewAndQuestion } from '@/actions/interview-actions'
import { notFound } from 'next/navigation'

interface SummaryPageProps {
  params: {
    id: string;
    qid: string;
  }
}

const SummaryPage = async ({ params }: SummaryPageProps) => {
  const { qid } = params;
  
  try {
    const result = await getInterviewAndQuestion({ questionId: qid });
    console.log('Interview and question result:', result);

    if (!result) {
      notFound();
    }

    const { interview, question } = result;

    return (
      <div className="max-w-4xl mx-auto p-4">
        <Summary interview={interview} question={question} interviewId={interview.id}/>
      </div>
    )
  } catch (error) {
    console.error('Error fetching interview and question:', error);
    notFound();
  }
}

export default SummaryPage
