"use client"
import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useInterviewStore } from '@/store/interviewStore';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Interview } from '@/db/schema';

type QuestionData = {
  id: string;
  grade?: string;
  question: string;
  suggested?: string;
  answer?: string;
  audioUrl?: string;
  feedback?: string;
  improvements?: string[];
  keyTakeaways?: string[];
  createdAt: Date;
};

const dummyInterview: Interview = {
  id: 'dummy',
  userId: 'dummy-user',
  jobTitle: 'Software Developer',
  jobDescription: 'Developing web applications',
  skills: ['JavaScript', 'React', 'Node.js'],
  date: new Date(),
  createdAt: new Date(),
  completed: false,
  questions: [{
    id: 'dummy-question',
    grade: "F",
    question: "Tell me about a time when you worked effectively in a team environment.",
    suggested: "Please provide your answer here.",
    answer: "I worked in a team environment for a software development company...",
    audioUrl: "/mp3/speech.mp3",
    feedback: "This answer is too generic and doesn't provide any specific examples...",
    improvements: [
      "Provide specific examples of teamwork experiences and outcomes.",
      "Highlight specific skills related to teamwork."
    ],
    keyTakeaways: [
      "Specificity is crucial when answering behavioral questions.",
      "Highlighting skills and experiences is more impactful than simply stating general traits."
    ],
    createdAt: new Date('2024-09-24T17:40:20.227535Z')
  }] as unknown as Interview['questions']
}

export default function Summary() {
  const { interview } = useInterviewStore();
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
    const data: Interview = interview || dummyInterview;
    console.log('Using data:', interview ? 'interviewStore' : 'dummyInterview');
    console.log('Data:', JSON.stringify(data, null, 2));

    const interviewCards = [
      { key: 'jobTitle', title: 'Job Title' },
      { key: 'jobDescription', title: 'Job Description' },
      { key: 'skills', title: 'Skills' },
      { key: 'date', title: 'Interview Date' },
    ];

    const questionCards: (keyof QuestionData)[] = ['grade', 'question', 'answer', 'feedback', 'improvements', 'keyTakeaways'];

    const questions: QuestionData[] = data.questions as unknown as QuestionData[];

    return (
      <>
        {interviewCards.map(({ key, title }) => (
          <Card key={key} className="mb-4">
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
              {Array.isArray(data[key as keyof Interview]) ? (
                <ul className="list-disc pl-5">
                  {(data[key as keyof Interview] as string[]).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p>{String(data[key as keyof Interview])}</p>
              )}
            </CardContent>
          </Card>
        ))}
        {questions.length > 0 && questionCards.map(key => (
          <Card key={key} className="mb-4">
            <CardHeader>
              <CardTitle className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</CardTitle>
            </CardHeader>
            <CardContent>
              {Array.isArray(questions[0][key]) ? (
                <ul className="list-disc pl-5">
                  {(questions[0][key] as string[]).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p>{String(questions[0][key] || '')}</p>
              )}
            </CardContent>
          </Card>
        ))}
        {questions.length > 0 && questions[0].audioUrl && renderAudio(questions[0].audioUrl)}
      </>
    );
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