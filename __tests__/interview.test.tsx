import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Interview from '../src/app/(dashboard)/dashboard/interview/(components)/interview';
import { InterviewRecord, InterviewQuestion } from '../src/db/schema';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // Import QueryClient and QueryClientProvider

// Mock the necessary dependencies
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('../src/store/interviewStore', () => ({
  default: () => ({
    currentBlob: null,
  }),
}));

vi.mock('../src/lib/api', () => ({
  useApi: () => ({
    fetchApi: vi.fn(),
  }),
}));

vi.mock('../src/app/(dashboard)/dashboard/interview/(components)/visualizer', () => ({
  default: () => React.createElement('div', { 'data-testid': 'mock-visualizer' }, 'Mock Visualizer'),
}));

// Create a new QueryClient instance
const queryClient = new QueryClient();

describe('Interview Component', () => {
  it('renders without crashing and shows no questions available message', () => {
    const emptyInterview: InterviewRecord = {
      id: '1',
      userId: 'user1',
      jobTitle: 'Software Developer',
      jobDescription: 'A challenging role in software development',
      skills: ['JavaScript', 'React'],
      date: new Date(),
      createdAt: new Date(),
      completed: false,
      questions: []
    };

    // Wrap the component with QueryClientProvider
    render(
      <QueryClientProvider client={queryClient}>
        <Interview interview={emptyInterview} />
      </QueryClientProvider>
    );
    
    // Check for no interview questions available message
    expect(screen.getByText('No interview questions available.')).toBeDefined();
  });

  it('renders interview content when interview data is available', async () => {
    const mockQuestion: InterviewQuestion = {
      id: '1',
      interviewId: '1',
      question: 'What is your experience with React?',
      suggested: 'Discuss your projects and expertise with React',
      answer: null,
      audioUrl: null,
      feedback: null,
      improvements: null,
      keyTakeaways: null,
      suggestedAudioUrl: null,
      grade: null,
      explanation: null,
      skills: ['React'],
      saved: false,
      createdAt: new Date()
    };

    const mockInterview: InterviewRecord = {
      id: '1',
      userId: 'user1',
      jobTitle: 'Software Developer',
      jobDescription: 'A challenging role in software development',
      skills: ['JavaScript', 'React'],
      date: new Date(),
      createdAt: new Date(),
      completed: false,
      questions: [mockQuestion]
    };

    // Wrap the component with QueryClientProvider
    render(
      <QueryClientProvider client={queryClient}>
        <Interview interview={mockInterview} />
      </QueryClientProvider>
    );

    // Check for the question
    const questionElement = screen.getByText('What is your experience with React?');
    expect(questionElement).toBeDefined();

    // Check for other key elements
    expect(screen.getByText('Please enable your microphone to start the interview.')).toBeDefined();
    expect(screen.getByText('Play Question Audio')).toBeDefined();
    expect(screen.getByTestId('mock-visualizer')).toBeDefined();
  });
});
