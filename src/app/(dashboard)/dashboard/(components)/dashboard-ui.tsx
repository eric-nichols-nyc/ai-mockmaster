"use client";

import React from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import InterviewList from './InterviewList'
import { InterviewQuestion } from "@/db/schema"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { PlusCircle } from 'lucide-react';
import { useInterviews } from "@/lib/useInterviews"
import { useCallback } from 'react'
import { toast } from 'sonner'
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
}

const DashboardUI: React.FC<DashboardUIProps> = ({ initialInterviews }) => {
  const { interviews, isLoading, isError, error, deleteInterview } = useInterviews(initialInterviews);

  const onDeleteInterview = useCallback(async (id: string) => {
    try {
      await deleteInterview(id)
      toast("Event has been deleted", {
        action: {
          label: "Undo",
          onClick: () => console.log("Undo"),
        },
      })
    } catch (err) {
      console.error('Error deleting interview:', err)
      // Handle error (e.g., show a toast notification)
    }
  }, [deleteInterview]);

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
          ) : isError ? (
            <div className="text-center text-red-500 p-4 bg-red-100 rounded-md">
              <p className="font-semibold">{error?.message || 'An error occurred'}</p>
            </div>
          ) : (
            <div className="transition-all duration-300 ease-in-out">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Your Interviews</h2>
              <InterviewList interviews={interviews || []} onDeleteInterview={onDeleteInterview} />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default DashboardUI
