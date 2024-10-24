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
import { createInterview } from '@/actions/interview-actions';
import { interviewFormSchema } from '@/lib/schemas';
import { toast } from "sonner";

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

interface FormData {
  jobTitle: string;
  jobDescription: string;
  skills: string[];
  questions: [{ // This syntax ensures at least one question
    question: string;
    suggested: string;
  }, ...{
    question: string;
    suggested: string;
  }[]]; // The spread operator allows for additional questions
}

const QuestionGeneratorPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interviewId, setInterviewId] = useState<string | null>(null);

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


  const handleSubmit = async (data: FormData) => {
    console.log('handleSubmit', data);
    try {
      // Validate the form data
      const validationResult = interviewFormSchema.safeParse(data);
      
      if (!validationResult.success) {
        // Format validation errors into a readable message
        const errorMessages = validationResult.error.errors.map(err => {
          const field = err.path.join('.');
          return `${field}: ${err.message}`;
        });
        
        toast.error("Please check your form inputs", {
          description: errorMessages.join('\n')
        });
        setError(errorMessages.join('\n'));
        return; // Exit early if validation fails
      }

      const result = await createInterview({
        body: validationResult.data
      });

      if (result.success) {
        setInterviewId(result.data?.id || null); // Assuming the API returns interviewId
        toast.success("Interview created successfully");
      } else {
        toast.error(result.error || 'Failed to create interview');
        setError(result.error || 'Failed to create interview');
      }
    } catch (error) {
      console.error('Error creating interview:', error);
      toast.error('Failed to create interview');
      setError('Failed to create interview');
    }
  };

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
            onSubmit={(data) => handleSubmit(data as FormData)} 
            jobs={jobs}
            interviewId={interviewId}
          />
        )}
        </div>
      </div>
    </div>
  );
};

export default QuestionGeneratorPage;
