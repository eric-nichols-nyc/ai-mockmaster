"use client"
import React from "react";
import { useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useInterviews, Interview } from "@/lib/api";

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

      <Tabs defaultValue="questions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>
        <TabsContent value="questions">
          <Accordion type="multiple" className="w-full">
            {interview.questions.map((question, index) => (
              <AccordionItem key={index} value={`question-${index}`}>
                <AccordionTrigger>{question.text}</AccordionTrigger>
                <AccordionContent>
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Your Answer</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{question.answer}</p>
                    </CardContent>
                  </Card>
                  {question.feedback && (
                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle>Feedback</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>{question.feedback}</p>
                      </CardContent>
                    </Card>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>
        <TabsContent value="summary">
          <h2 className="text-2xl font-bold mb-4">Interview Summary</h2>
          <p>{interview.summary}</p>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InterviewReviewPage;
