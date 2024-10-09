"use client";

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import InterviewList from './(components)/InterviewList'
import { useInterviews } from "@/lib/api"
import { InterviewRecord } from '@/db/schema';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"

const DashboardPage = () => {
  const { getSavedInterviewQuestions } = useInterviews();
  const [interviews, setInterviews] = useState<InterviewRecord[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const data = await getSavedInterviewQuestions();
        setInterviews(data);
      } catch (err) {
        setError('Failed to fetch interviews. Please try again later.');
        console.error('Error fetching interviews:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <header className="mb-8 mt-4 text-center bg-white shadow-md rounded-lg p-6 transition-all duration-300 ease-in-out hover:shadow-lg">
          <div className="flex justify-center mb-6">
            <svg width="200" height="120" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="200" height="120" fill="#F3F4F6"/>
              <circle cx="60" cy="60" r="30" fill="#D1D5DB"/>
              <circle cx="140" cy="60" r="30" fill="#D1D5DB"/>
              <path d="M70 70C70 75.5228 65.5228 80 60 80C54.4772 80 50 75.5228 50 70" stroke="#4B5563" strokeWidth="3"/>
              <path d="M150 70C150 75.5228 145.523 80 140 80C134.477 80 130 75.5228 130 70" stroke="#4B5563" strokeWidth="3"/>
              <path d="M90 50H110" stroke="#4B5563" strokeWidth="3"/>
              <path d="M85 60H115" stroke="#4B5563" strokeWidth="3"/>
              <path d="M90 70H110" stroke="#4B5563" strokeWidth="3"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-4 text-gray-800">Interview Dashboard</h1>
          <p className="text-gray-600 mb-6 text-lg">Manage and review your interviews</p>
          <Link href="/dashboard/interview">
            <Button className="px-6 py-3 text-lg transition-all duration-300 ease-in-out transform hover:scale-105">
              Start New Interview
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
                onClick={() => window.location.reload()} 
                className="mt-4 bg-red-500 hover:bg-red-600 text-white"
              >
                Retry
              </Button>
            </div>
          ) : (
            <div className="transition-all duration-300 ease-in-out">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Your Interviews</h2>
              <InterviewList interviews={interviews} />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default DashboardPage