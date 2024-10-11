"use client";

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import InterviewList from './(components)/InterviewList'
import { useInterviews } from "@/lib/api"
import { InterviewRecord } from "@/db/schema"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { PlusCircle } from 'lucide-react';

const DashboardPage = () => {
  const { getSavedInterviewQuestions, deleteInterview } = useInterviews();
  const [interviews, setInterviews] = useState<InterviewRecord[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInterviews = async () => {
    try {
      const data = await getSavedInterviewQuestions();
      console.log('data ', data)
      setInterviews(data);
    } catch (err) {
      setError('Failed to fetch interviews. Please try again later.');
      console.error('Error fetching interviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

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
    <div className="flex flex-col min-h-screen bg-gray-50">
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

export default DashboardPage
