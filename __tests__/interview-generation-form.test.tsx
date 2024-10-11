import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import InterviewForm from '../src/app/(dashboard)/dashboard/interview/(components)/interview-generation-form';

// Mock the next/navigation module
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock the custom components
vi.mock('components/ui/input', () => ({
  Input: ({ id, ...props }: any) => <input id={id} data-testid={id} {...props} />,
}));

vi.mock('components/ui/textarea', () => ({
  Textarea: ({ id, ...props }: any) => <textarea id={id} data-testid={id} {...props} />,
}));

vi.mock('../src/app/(dashboard)/dashboard/interview/(components)/AnimatedButton', () => ({
  default: ({ onClick, isLoading, isSubmitted }: any) => (
    <button onClick={onClick} disabled={isLoading || isSubmitted}>
      Submit
    </button>
  ),
}));

// Mock the lib/api module
vi.mock('lib/api', () => ({
  useApi: () => ({
    fetchApi: vi.fn(),
  }),
}));

describe('InterviewForm', () => {
  it('renders the form with all required fields', () => {
    render(<InterviewForm />);

    // Check if the form title is present
    expect(screen.getByText('Generate Interview')).toBeInTheDocument();

    // Check if the required input field is present
    expect(screen.getByTestId('jobTitle')).toBeInTheDocument();

    // Check if the optional fields are present
    expect(screen.getByTestId('jobDescription')).toBeInTheDocument();
    expect(screen.getByTestId('skills')).toBeInTheDocument();

    // Check if the submit button is present
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });
});
