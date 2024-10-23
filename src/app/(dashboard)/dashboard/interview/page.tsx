'use client';

import React, { useEffect, useState } from 'react';
import InterviewForm from '@/components/interview-form';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Loader2 } from "lucide-react";
import { Job } from '@/types'; // Importing Job type

export type FeedbackGrade = {
  letter: string;
  feedback?: string;
}

export interface FeedbackData {
  feedback: string;
  improvements: string[];
  keyTakeaways: string[];
  grade: FeedbackGrade;
}

const QuestionGeneratorPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/json/jobs.json');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        
        // Store full jobs data
        setJobs(data.jobs);

        console.log('Loaded data:', jobs);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setError('Failed to load job listings. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);


  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
      <div className="relative z-10 flex flex-col items-center space-y-6 p-4">
        <h1 className="text-2xl font-bold mb-4 text-black">Interview Question Generator</h1>
        <div>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Interview</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        {isLoading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading job listings...</span>
          </div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <InterviewForm 
            onSubmit={(data) => console.log(data)} 
            jobs={jobs}
          />
        )}
        </div>
      </div>
    </div>
  );
};

export default QuestionGeneratorPage;
