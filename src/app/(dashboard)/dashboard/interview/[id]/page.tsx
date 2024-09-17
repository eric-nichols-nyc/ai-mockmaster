import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

const InterviewReviewPage = () => {
  return (
    <div className="container max-w-2xl mx-auto p-4">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Interview Review</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Tabs defaultValue="questions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>
        <TabsContent value="questions">
          <Accordion type="multiple" className="w-full" defaultValue={["question"]}>
            <AccordionItem value="question">
              <AccordionTrigger>Question</AccordionTrigger>
              <AccordionContent>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>What is your greatest strength?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      My greatest strength is my ability to quickly adapt to new
                      situations and learn new skills...
                    </p>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="feedback">
              <AccordionTrigger>Feedback</AccordionTrigger>
              <AccordionContent>
                <p>
                  Your answer demonstrates self-awareness and highlights a
                  valuable skill. To improve, consider providing a specific
                  example that illustrates how you have used this strength in a
                  professional setting.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="sample-response">
              <AccordionTrigger>Sample Response</AccordionTrigger>
              <AccordionContent>
                <p>
                  One of my greatest strengths is my adaptability. In my
                  previous role as a project manager, we often faced unexpected
                  challenges. For instance, when a key team member left
                  mid-project, I quickly learned their responsibilities and
                  redistributed tasks among the team. This allowed us to
                  complete the project on time despite the setback. My ability
                  to adapt not only helps me navigate challenges but also
                  enables me to continually grow and take on new
                  responsibilities.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>
        <TabsContent value="summary">
          <h2 className="text-2xl font-bold mb-4">Interview Summary</h2>
          {/* Add your summary content here */}
          <p>Summary content goes here...</p>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InterviewReviewPage;
