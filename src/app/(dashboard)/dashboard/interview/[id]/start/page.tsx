import React from "react";
import { auth } from "@clerk/nextjs/server";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { InterviewRecord } from "@/db/schema";
import InterviewComponent from "../../(components)/interview";

async function getInterviewById(id: string): Promise<InterviewRecord | null> {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  try {
    const { getToken } = auth();
    const token = await getToken();

    const response = await fetch(`${baseUrl}/api/interviews/${id}`, {
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

async function getInterview(id: string): Promise<InterviewRecord | null> {
  try {
    const interview = await getInterviewById(id);
    return interview;
  } catch (error) {
    console.error("Error fetching interview:", error);
    return null;
  }
}

export default async function InterviewStart({
  params,
}: {
  params: { id: string };
}) {
  const interview = await getInterview(params.id);

  if (!interview) {
    return <div>Error: Interview not found or failed to load.</div>;
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
      <InterviewComponent interview={interview} />
    </div>
  );
}
