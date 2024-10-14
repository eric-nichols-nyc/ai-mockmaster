import React from 'react'
import Summary from '../../../(components)/summary'
import { InterviewRecord } from '@/db/schema'
import { auth } from '@clerk/nextjs/server';

async function getInterviewById(id: string, qid:string): Promise<InterviewRecord | null> {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  try {
    const { getToken } = auth();
    const token = await getToken();

    const response = await fetch(`${baseUrl}/api/interviews/${id}/questions/${qid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch interview");
    }

    const interview = await response.json();
    return interview;
  } catch (error) {
    console.error("Error fetching interview:", error);
    return null;
  }
}

interface SummaryPageProps {
  params: {
    id: string;
    qid: string;
  }
}

const SummaryPage = async ({ params }: SummaryPageProps) => {
  const { id, qid } = params;
  const interview = await getInterviewById(id, qid);
  console.log(interview);

  if (!interview) {
    return <div>Error: Failed to load interview</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Summary />
    </div>
  )
}

export default SummaryPage
