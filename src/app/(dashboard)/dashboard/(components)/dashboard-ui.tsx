"use client";

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import InterviewList from './InterviewList'
import { InterviewRecord, InterviewQuestion } from "@/db/schema"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { PlusCircle } from 'lucide-react';
import { useInterviews } from "@/lib/api"

interface DashboardUIProps {
    initialInterviews: Array<{
      jobTitle: string;
      jobDescription: string | null;
      skills: string[] | null;
      id: string;
      date: Date;
      createdAt: Date;
      userId: string;
      completed: boolean;
      questions: InterviewQuestion[];
    }>;
    getInterviews: () => Promise<InterviewRecord[]>;
  }

const DashboardUI: React.FC<DashboardUIProps> = ({ initialInterviews, getInterviews }) => {
  const [interviews, setInterviews] = useState<InterviewRecord[]>(initialInterviews);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { deleteInterview } = useInterviews();

  const fetchInterviews = async () => {
    try {
      setIsLoading(true);
      const data = await getInterviews();
      setInterviews(data);
    } catch (err) {
      setError('Failed to fetch interviews. Please try again later.');
      console.error('Error fetching interviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const onDeleteInterview = async (id: string) => {
    try {
      await deleteInterview(id);
      await fetchInterviews(); // Refresh the list after deletion
    } catch (err) {
      console.error('Error deleting interview:', err);
      setError('Failed to delete interview. Please try again.');
    }
  };

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <header className="mb-8 mt-4 bg-white shadow-md rounded-lg p-6 transition-all duration-300 ease-in-out hover:shadow-lg">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">Interview Dashboard</h1>
          <p className="text-gray-600 mb-6 text-lg">Manage and review your interviews</p>
          <Link href="/dashboard/interview">
            <Button className="hover:bg-gray-100">
              <PlusCircle className="mr-2 h-4 w-4" /> New Interview
            </Button>
          </Link>
        </header>
        <main className="bg-white shadow-md rounded-lg p-6 transition-all duration-300 ease-in-out hover:shadow-lg">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 p-4 bg-red-100 rounded-md">
              <p className="font-semibold">{error}</p>
              <Button 
                onClick={() => fetchInterviews()} 
                className="mt-4 bg-red-500 hover:bg-red-600 text-white"
              >
                Retry
              </Button>
            </div>
          ) : (
            <div className="transition-all duration-300 ease-in-out">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Your Interviews</h2>
              <InterviewList interviews={interviews} onDeleteInterview={onDeleteInterview} />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default DashboardUI
