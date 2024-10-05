"use client"
import React from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useInterviews } from "@/lib/api";
import { Interview } from "@/db/schema";

const InterviewReviewPage: React.FC = () => {
  const params = useParams();
  const id = params.id as string;
  const { getInterviewById } = useInterviews();
  const [interview, setInterview] = React.useState<Interview | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchInterview = async () => {
      const fetchedInterview = await getInterviewById(id);
      console.log(fetchedInterview)
      setInterview(fetchedInterview);
      setLoading(false);
    };
    fetchInterview();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!interview) {
    return <div>Interview not found</div>;
  }

  return (
    <div className="container max-w-2xl mx-auto p-4">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Interview Review: {interview.jobTitle}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      
      <Card><CardTitle></CardTitle><CardContent>review summary goes here...</CardContent></Card>
    </div>
  );
};

export default InterviewReviewPage;
