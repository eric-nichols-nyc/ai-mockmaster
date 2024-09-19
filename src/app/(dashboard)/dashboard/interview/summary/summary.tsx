"use client"
import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import useInterviewStore from '@/store/interviewStore';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface InterviewData {
  grade: string;
  question: string;
  userAnswer: string;
  answer: string;
  recordedAnswer: string;
  feedback: string;
  improvements: string[];
  keyTakeaways: string[];
}

const dummyInterview: InterviewData = {
  grade: "F",
  question: "Tell me about a time when you worked effectively in a team environment.",
  userAnswer: "Please provide your answer here.",
  answer: "I worked in a team environment for a software development company. During this time, I contributed to the development of a web application, where I was responsible for designing and implementing the user interface (UI) and backend functionality. I also had the opportunity to work on various aspects of the project, such as database design, API integration, and testing. The team's collaboration and communication were essential to the success of the project.",
  recordedAnswer: "/mp3/speech.mp3",
  feedback: "This answer is too generic and doesn't provide any specific examples of how the candidate demonstrates their teamwork skills. The candidate should provide concrete examples of situations where they have successfully worked in a team environment, highlighting their contributions and the positive outcomes. They should also mention specific skills that contribute to their teamwork abilities, such as communication, collaboration, conflict resolution, and problem-solving.",
  improvements: [
    "Provide specific examples of teamwork experiences and outcomes.",
    "Highlight specific skills related to teamwork."
  ],
  keyTakeaways: [
    "Specificity is crucial when answering behavioral questions.",
    "Highlighting skills and experiences is more impactful than simply stating general traits."
  ]
}

export default function Summary() {
  const interviewData = useInterviewStore();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSave = async () => {
    setIsSaving(true);
    // Add save functionality here
    console.log('Save button clicked');
    
    // Pause for 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Show toast
    toast.success('Interview summary saved successfully!');
    
    setIsSaving(false);
    
    // Redirect to dashboard
    router.push('/dashboard');
  };

  const renderAudio = (src: string) => {
    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Recorded Answer</CardTitle>
        </CardHeader>
        <CardContent>
          <audio controls src={src}>
            Your browser does not support the audio element.
          </audio>
        </CardContent>
      </Card>
    );
  };

  const renderCards = () => {
    const hasInterviewData = interviewData.question && interviewData.answer;
    const data: InterviewData = hasInterviewData ? interviewData as InterviewData : dummyInterview;
    console.log('Using data:', hasInterviewData ? 'interviewStore' : 'dummyInterview');
    console.log('Data:', JSON.stringify(data, null, 2));

    const cardOrder: (keyof InterviewData)[] = ['grade', 'question', 'userAnswer', 'answer', 'recordedAnswer', 'feedback', 'improvements', 'keyTakeaways'];

    return cardOrder.map(key => {
      if (key === 'grade') {
        return (
          <Card key={key} className="mb-4">
            <CardHeader>
              <CardTitle>Grade</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{data[key]}</p>
            </CardContent>
          </Card>
        );
      } else if (key === 'recordedAnswer') {
        return renderAudio(data[key]);
      } else {
        return (
          <Card key={key} className="mb-4">
            <CardHeader>
              <CardTitle className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</CardTitle>
            </CardHeader>
            <CardContent>
              {Array.isArray(data[key]) ? (
                <ul className="list-disc pl-5">
                  {(data[key] as string[]).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p>{String(data[key])}</p>
              )}
            </CardContent>
          </Card>
        );
      }
    });
  };

  return (
    <div className="space-y-6">
      {renderCards()}
      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          'Save'
        )}
      </Button>
    </div>
  );
}