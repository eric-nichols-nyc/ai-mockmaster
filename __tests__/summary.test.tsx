import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import Summary from '../src/app/(dashboard)/dashboard/interview/(components)/summary';

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
}));

test('Summary component renders with mock data', async () => {
  render(<Summary />);
  
  // Wait for the component to finish loading
  await screen.findByTestId('summary-component');

  // Check for key elements
  expect(screen.getByText('Mock Job Title')).toBeDefined();
  expect(screen.getByText('Mock Job Description')).toBeDefined();
  expect(screen.getByText('Mock Question')).toBeDefined();
  expect(screen.getByText('Mock Answer')).toBeDefined();
  expect(screen.getByText('Mock Suggested Answer')).toBeDefined();
  expect(screen.getByText('Mock Feedback')).toBeDefined();
  expect(screen.getByText('85')).toBeDefined();
  expect(screen.getByText('Mock Improvement 1')).toBeDefined();
  expect(screen.getByText('Mock Takeaway 1')).toBeDefined();
});
