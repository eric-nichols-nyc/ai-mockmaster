import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Interview from '../src/app/(dashboard)/dashboard/interview/(components)/interview';

// Mock the necessary dependencies
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
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
  default: () => <div data-testid="mock-visualizer">Mock Visualizer</div>,
}));

describe('Interview Component', () => {
  it('renders without crashing', () => {
    render(<Interview />);
    
    // Check for loading state
    expect(screen.getByText('Loading interview...')).toBeDefined();
  });

  it('renders interview content when interview data is available', async () => {
    vi.mock('../src/store/interviewStore', () => ({
      default: () => ({
        currentBlob: null,
      }),
    }));

    vi.mock('../src/lib/api', () => ({
      useApi: () => ({
        fetchApi: vi.fn().mockResolvedValue({
          id: '1',
          jobTitle: 'Software Developer',
          questions: [
            {
              id: '1',
              question: 'What is your experience with React?',
            },
          ],
        }),
      }),
    }));

    render(<Interview />);

    // Wait for the interview content to load
    const questionElement = await screen.findByText('What is your experience with React?');
    expect(questionElement).toBeDefined();

    // Check for other key elements
    expect(screen.getByText('Please enable your microphone to start the interview.')).toBeDefined();
    expect(screen.getByText('Play Question Audio')).toBeDefined();
    expect(screen.getByTestId('mock-visualizer')).toBeDefined();
  });
});
