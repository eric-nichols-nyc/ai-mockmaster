'use client';

import React from 'react';
import InterviewForm from './(components)/interview-form';

const InterviewPage = () => {

  return (
    <div className="flex flex-col items-center space-y-6 p-4">
      <h1 className="text-2xl font-bold mb-4">Interview Question Generator</h1>
      <InterviewForm />
    </div>
  );
};

export default InterviewPage;