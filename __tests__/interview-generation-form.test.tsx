import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import InterviewForm from '../src/app/(dashboard)/dashboard/interview/(components)/interview-generation-form';
import { useApi } from '@/lib/api';

// Mocks for external dependencies
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

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

const mockFetchApi = vi.fn();
vi.mock('lib/api', () => ({
  useApi: () => ({
    fetchApi: mockFetchApi,
  }),
}));

describe('InterviewForm Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays validation errors for empty required fields', async () => {
    render(<InterviewForm />);
    
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });
  });

  it('displays API error when fetching questions fails', async () => {
    mockFetchApi.mockRejectedValueOnce(new Error('API Error'));

    render(<InterviewForm />);
    
    const titleInput = screen.getByTestId('jobTitle');
    fireEvent.change(titleInput, { target: { value: 'Test Job' } });

    const submitButton = screen.getByRole('button', { name: 'Submit' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const errorElement = screen.getByText(/An error occurred while submitting the form/i);
      expect(errorElement).toBeInTheDocument();
      expect(errorElement.textContent).toContain('An error occurred while submitting the form:');
    });
  });

  it('displays error for invalid server response', async () => {
    mockFetchApi.mockResolvedValueOnce({ invalidData: 'Invalid response' });

    render(<InterviewForm />);
    
    const titleInput = screen.getByTestId('jobTitle');
    fireEvent.change(titleInput, { target: { value: 'Test Job' } });

    const submitButton = screen.getByRole('button', { name: 'Submit' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const errorElement = screen.getByText(/An error occurred while submitting the form/i);
      expect(errorElement).toBeInTheDocument();
      expect(errorElement.textContent).toContain('An error occurred while submitting the form: Failed to parse URL from /api/openai/generate-questions');
    });
  });

  it('handles unexpected errors', async () => {
    mockFetchApi.mockImplementationOnce(() => {
      throw new Error('Unexpected error');
    });

    render(<InterviewForm />);
    
    const titleInput = screen.getByTestId('jobTitle');
    fireEvent.change(titleInput, { target: { value: 'Test Job' } });

    const submitButton = screen.getByRole('button', { name: 'Submit' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const errorElement = screen.getByText(/An error occurred while submitting the form/i);
      expect(errorElement).toBeInTheDocument();
      expect(errorElement.textContent).toContain('An error occurred while submitting the form');
    });
  });
});