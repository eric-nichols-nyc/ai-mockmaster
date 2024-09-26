'use client';

import React from 'react';
import InterviewGenerationForm from './(components)/interview-generation-form';


// do api call to load interview questions from database and display them in a list.


const QuestionGeneratorPage = () => {

  return (
    <div className="flex flex-col items-center space-y-6 p-4">
      <h1 className="text-2xl font-bold mb-4">Interview Question Generator</h1>
      <InterviewGenerationForm />
    </div>
  );
};

export default QuestionGeneratorPage;