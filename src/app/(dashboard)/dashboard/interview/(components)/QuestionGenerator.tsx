'use client';

import React, { useState, useTransition } from 'react';
import { generateFeedback } from "@/actions/opeanai-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCompletion } from 'ai/react'
interface QuestionGeneratorProps {
  question: string;
}

const QuestionGenerator: React.FC<QuestionGeneratorProps> = ({ question }) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isPending, startTransition] = useTransition();
  const { complete, completion, isLoading } = useCompletion({
    api: '/api/stream',
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback('');

    startTransition(async () => {
      try {
        const feedbackResponse = await generateFeedback({
          question,
          userAnswer,
          jobTitle: 'Software Engineer',
          skills: []
        });

        if (feedbackResponse instanceof ReadableStream) {
          const reader = feedbackResponse.getReader();
          const decoder = new TextDecoder();
          let result = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            result += decoder.decode(value);
            setFeedback(result);
          }
        } else {
          setFeedback('Unexpected response format');
        }
      } catch (error) {
        console.error('Error generating feedback:', error);
        setFeedback('Error generating feedback. Please try again.');
      }
    });
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
        <Button type="submit" disabled={isPending || !question}>
          {isPending ? 'Generating Feedback...' : 'Get Feedback'}
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
