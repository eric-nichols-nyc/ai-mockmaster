import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import InterviewForm from '@/components/interview-form';

// Add this mock at the top with your other mocks
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn()
    }),
    useSearchParams: () => ({
        get: vi.fn(),
    }),
}));

// Mock ResizeObserver
beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

// Mock components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: {children: React.ReactNode}) => <div>{children}</div>,
  CardTitle: ({ children }: {children: React.ReactNode}) => <div>{children}</div>,
  CardDescription: ({ children }: {children: React.ReactNode}) => <div>{children}</div>,
}));

vi.mock('@/components/ui/radio-group', () => ({
  RadioGroup: ({ children }: {children: React.ReactNode}) => <div>{children}</div>,
  RadioGroupItem: ({ children }: {children: React.ReactNode}) => <div>{children}</div>,
}));

vi.mock('@/components/ui/label', () => ({
  Label: ({ children }: {children: React.ReactNode}) => <div>{children}</div>,
}));

vi.mock('@/components/ui/multi-select', () => ({
  __esModule: true,
  default: ({ children }: {children: React.ReactNode}) => <div>{children}</div>,
}));

describe('InterviewForm', () => {
  it('renders the form with all required elements', () => {
    const mockJobs = [
      {
        title: "Frontend Developer",
        description: "Example description",
        skills: ["React", "JavaScript"]
      }
    ];

    const { container, debug } = render(
      <InterviewForm 
        onSubmit={() => {}} 
        jobs={mockJobs}
        interviewId={null}
      />
    );

    // Debug output to see what's actually being rendered
    debug();

    // Check for form elements by role where possible
    expect(container.querySelector('form')).toBeInTheDocument();
    
    // Check for text content using getByText with a more flexible matcher
    expect(screen.getByText(/select a job title/i)).toBeInTheDocument();
    expect(screen.getByText(/job description/i)).toBeInTheDocument();
    expect(screen.getByText(/skills/i)).toBeInTheDocument();
    expect(screen.getByText(/frontend developer/i)).toBeInTheDocument();
    
    // Check for the submit button
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
