'use client';

import React, { useState } from 'react';
import { generateFeedback } from '@/actions/opeanai-actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface QuestionGeneratorProps {
  question: string;
}

const QuestionGenerator: React.FC<QuestionGeneratorProps> = ({ question }) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsGenerating(true);
    setFeedback('');

    try {
      const feedbackResponse = await generateFeedback({
        question,
        userAnswer,
        jobTitle: 'Software Engineer',
        skills: []
      });

      setFeedback(JSON.stringify(feedbackResponse.result, null, 2));
    } catch (error) {
      console.error('Error generating feedback:', error);
      setFeedback('Error generating feedback. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="mt-4 p-4 bg-gray-100 rounded-md">
        <h3 className="font-bold mb-2">Interview Question:</h3>
        <p>{question || 'No question available'}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Your answer"
          required
        />
        <Button type="submit" disabled={isGenerating || !question}>
          {isGenerating ? 'Generating Feedback...' : 'Get Feedback'}
        </Button>
      </form>
      {feedback && (
        <div className="mt-4 p-4 bg-gray-100 rounded-md">
          <h3 className="font-bold mb-2">Feedback:</h3>
          <pre>{feedback}</pre>
        </div>
      )}
    </div>
  );
};

export default QuestionGenerator;
