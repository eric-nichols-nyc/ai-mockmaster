import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Interview from '../src/app/(dashboard)/dashboard/interview/(components)/interview';
import { InterviewRecord } from '../src/db/schema';

// Mock the necessary dependencies
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => React.createElement('img', props),
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

describe('Interview Component', () => {
  it('renders without crashing', () => {
    render(<Interview interview={{} as InterviewRecord} />);
    
    // Check for no interview questions available message
    expect(screen.getByText('No interview questions available.')).toBeDefined();
  });

  it('renders interview content when interview data is available', async () => {
    const mockInterview: InterviewRecord = {
      id: '1',
      jobTitle: 'Software Developer',
      questions: [
        {
          id: '1',
          question: 'What is your experience with React?',
        },
      ],
    } as InterviewRecord;

    render(<Interview interview={mockInterview} />);

    // Check for the question
    const questionElement = screen.getByText('What is your experience with React?');
    expect(questionElement).toBeDefined();

    // Check for other key elements
    expect(screen.getByText('Please enable your microphone to start the interview.')).toBeDefined();
    expect(screen.getByText('Play Question Audio')).toBeDefined();
    expect(screen.getByTestId('mock-visualizer')).toBeDefined();
  });
});
