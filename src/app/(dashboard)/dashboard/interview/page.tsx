'use client';

import React from 'react';
import InterviewForm from './(components)/interview-form';

const InterviewPage = () => {
  const handleSubmit = (formData: { title: string; description: string; skills: string }) => {
    console.log('Form submitted with data:', formData);
    // You can add additional logic here if needed
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-4">
      <h1 className="text-2xl font-bold mb-4">Interview Question Generator</h1>
      <InterviewForm onSubmit={handleSubmit} />
    </div>
  );
};

export default InterviewPage;