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

export type Job = {
  title: string;
  description: string;
  skills: string[];
}

const QuestionGeneratorPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobTitles, setJobTitles] = useState<string[]>([]);
  const [jobDescriptions, setJobDescriptions] = useState<string[]>([]);
  const [jobSkills, setJobSkills] = useState<string[][]>([]);
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

        // Extract and store titles separately
        const titles = data.jobs.map((job: Job) => job.title);
        setJobTitles(titles);

        // Extract and store descriptions separately
        const descriptions = data.jobs.map((job: Job) => job.description);
        setJobDescriptions(descriptions);

        // Extract and store skills separately
        const skills = data.jobs.map((job: Job) => job.skills);
        setJobSkills(skills);

        console.log('Loaded data:', {
          titles,
          descriptions,
          skills
        });
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setError('Failed to load job listings. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Function to get description and skills for a selected job title
  const getJobDetails = (selectedTitle: string) => {
    const index = jobTitles.indexOf(selectedTitle);
    if (index !== -1) {
      return {
        description: jobDescriptions[index],
        skills: jobSkills[index]
      };
    }
    return null;
  };

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
      <div className="relative z-10 flex flex-col items-center space-y-6 p-4">
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
        <h1 className="text-2xl font-bold mb-4 text-white">Interview Question Generator</h1>
        
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
            jobTitles={jobTitles}
            jobDescriptions={jobDescriptions}
            jobSkills={jobSkills}
            getJobDetails={getJobDetails}
          />
        )}
      </div>
    </div>
  );
};

export default QuestionGeneratorPage;
