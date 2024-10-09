"use client";

import React, { useEffect, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInterviews } from "@/lib/api";
import { Interview } from "@/types";
import { format } from "date-fns";
import InterviewComponent from "../../(components)/interview";

const InterviewStart = () => {
  const [interview, setInterview] = useState<Interview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getInterviewById } = useInterviews();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    const fetchInterviewData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedInterview = await getInterviewById(id);
        if (fetchedInterview) {
          setInterview(fetchedInterview);
        } else {
          setError("Interview not found.");
        }
      } catch (err) {
        console.error("Error fetching interview:", err);
        setError("Failed to fetch the interview. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterviewData();
  }, []);

  if (isLoading) {
    return <div>Loading interview data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!interview) {
    return <div>No interview data available.</div>;
  }

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              Start Interview: {interview.jobTitle}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{interview.jobTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-2">
            <strong>Date:</strong>{" "}
            {format(new Date(interview.date), "MMMM d, yyyy")}
          </p>
          <p className="mb-4">
            <strong>Job Description:</strong> {interview.jobDescription}
          </p>
          <InterviewComponent />
        </CardContent>
      </Card>
    </div>
  );
};

export default InterviewStart;
