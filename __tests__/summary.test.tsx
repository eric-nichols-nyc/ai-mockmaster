import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import Summary from '../src/app/interview/(components)/summary';
import { InterviewRecord } from '@/db/schema'; // Import the InterviewRecord type
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; 
// Import QueryClient and QueryClientProvider

// Mock the next/navigation module
vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'mock-interview-id', qid: 'mock-question-id' }),
}));

// Mock the useInterviews hook
vi.mock('../src/lib/api', () => ({
  useInterviews: () => ({
    getInterviewById: vi.fn().mockResolvedValue({
      id: 'mock-interview-id',
      jobTitle: 'Mock Job Title',
      jobDescription: 'Mock Job Description',
      questions: [
        {
          id: 'mock-question-id',
          question: 'Mock Question',
          answer: 'Mock Answer',
          suggested: 'Mock Suggested Answer',
          feedback: 'Mock Feedback',
          grade: '85',
          improvements: ['Mock Improvement 1', 'Mock Improvement 2'],
          keyTakeaways: ['Mock Takeaway 1', 'Mock Takeaway 2'],
        },
      ],
    }),
  }),
  useApi: () => ({ /* Mock implementation of useApi if needed */ }), // Added mock for useApi
}));

test('Summary component renders with mock data', async () => {
  const queryClient = new QueryClient(); // Create a new QueryClient instance

  const mockInterview: InterviewRecord = {
    id: 'mock-interview-id',
    jobTitle: 'Mock Job Title',
    jobDescription: 'Mock Job Description',
    date: new Date(),
    createdAt: new Date(),
    userId: 'mock-user-id',
    skills: ['Mock Skill 1', 'Mock Skill 2'],
    completed: false,
    questions: [],
  };

  const mockQuestion = {
    id: 'mock-question-id',
    question: 'Mock Question',
    answer: 'Mock Answer',
    suggested: 'Mock Suggested Answer',
    feedback: 'Mock Feedback',
    grade: 'B',
    improvements: ['Mock Improvement 1', 'Mock Improvement 2'],
    keyTakeaways: ['Mock Takeaway 1', 'Mock Takeaway 2'],
    saved: true,
    audioUrl: null,
    suggestedAudioUrl: null,
    createdAt: new Date(),
    interviewId: 'mock-interview-id',
    skills: ['Mock Skill 1', 'Mock Skill 2'],
    explanation: 'Mock Explanation',
  };

  render(
    <QueryClientProvider client={queryClient}> {/* Wrap with QueryClientProvider */}
      <Summary interview={mockInterview} question={mockQuestion} interviewId={mockInterview.id} />
    </QueryClientProvider>
  );
  
  // Wait for the component to finish loading
  await screen.findByTestId('summary-component');

  // Check for key elements
  expect(screen.getByText('Mock Job Title')).toBeDefined();
  expect(screen.getByText(/Mock Question/i)).toBeDefined(); // Updated to use regex
  expect(screen.queryByText(/Mock Answer/i)).toBeNull(); // Ensure "Mock Answer" is not defined
  expect(screen.getByText('Mock Feedback')).toBeDefined();
  expect(screen.getByText('B')).toBeDefined();
  expect(screen.getByText('Mock Improvement 1')).toBeDefined();
  expect(screen.getByText('Mock Takeaway 1')).toBeDefined();
});
