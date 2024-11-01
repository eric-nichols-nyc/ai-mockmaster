import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import InterviewComponent from "@/components/interview";
//import { getInterviewAndQuestion } from "@/actions/interview-actions";

// get the interview and question from the database and set in memory with tanstack query actions
// async function getInterviewAndQuestionFromDatabase(id: string, qid: string) {
//   const data = await getInterviewAndQuestion({ id, qid });
//   return data;
// }

export default async function InterviewStart({
  params,
}: {
  params: { id: string, qid: string };
}) {

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
              Start Interview
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <InterviewComponent interviewId={params.id} />
    </div>
  );
}