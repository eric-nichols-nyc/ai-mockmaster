import React from 'react';
import { generateQuestion } from '@/actions/opeanai-actions';
import QuestionGenerator from './(components)/QuestionGenerator';
import SkillAssessment from './(components)/skills';

export default async function InterviewPage() {
  const question = await generateQuestion({ jobTitle: 'Software Engineer' });
  console.log(question);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Interview Practice</h1>
      <SkillAssessment />
    </div>
  );
}
