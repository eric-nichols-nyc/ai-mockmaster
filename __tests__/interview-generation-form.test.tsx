import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import InterviewForm from '../src/app/(dashboard)/dashboard/interview/(components)/interview-generation-form';
import { useApi } from '../src/lib/api';

// Mocks for external dependencies
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock('../src/components/ui/input', () => ({
  Input: ({ id, ...props }: any) => <input id={id} data-testid={id} {...props} />,
}));

vi.mock('../src/components/ui/textarea', () => ({
  Textarea: ({ id, ...props }: any) => <textarea id={id} data-testid={id} {...props} />,
}));

vi.mock('../src/app/(dashboard)/dashboard/interview/(components)/AnimatedButton', () => ({
    default: ({ onClick, isLoading, isSubmitted }: any) => (
      <button onClick={onClick} disabled={isLoading || isSubmitted}>
        {isLoading ? 'Thinking...' : isSubmitted ? 'Start Interview' : 'Generate Interview'}
      </button>
    ),
  }));

const mockFetchApi = vi.fn();
vi.mock('../src/lib/api', () => ({
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
    
    const submitButton = screen.getByRole('button', { name: 'Generate Interview' });
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

    const generateButton = screen.getByRole('button', { name: 'Generate Interview' });
    fireEvent.click(generateButton);

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

    const submitButton = screen.getByRole('button', { name: 'Generate Interview' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const errorElement = screen.getByText(/An error occurred while submitting the form/i);
      expect(errorElement).toBeInTheDocument();
      expect(errorElement.textContent).toContain('An error occurred while submitting the form: Invalid response from server');
    });
  });

  it('handles unexpected errors', async () => {
    mockFetchApi.mockImplementationOnce(() => {
      throw new Error('Unexpected error');
    });

    render(<InterviewForm />);
    
    const titleInput = screen.getByTestId('jobTitle');
    fireEvent.change(titleInput, { target: { value: 'Test Job' } });

    const generateButton = screen.getByRole('button', { name: 'Generate Interview' });
    fireEvent.click(generateButton);

    await waitFor(() => {
      const errorElement = screen.getByText(/An error occurred while submitting the form/i);
      expect(errorElement).toBeInTheDocument();
      expect(errorElement.textContent).toContain('An error occurred while submitting the form');
    });
  });

  it('handles successful form submission', async () => {
    // Mock successful API responses
    mockFetchApi
      .mockResolvedValueOnce({ questions: [{ question: 'Test question', suggested: 'Suggested answer' }] }) // For generate-questions
      .mockResolvedValueOnce({ id: 'test-interview-id' }); // For creating the interview

    render(<InterviewForm />);

    // Fill in the form fields
    const titleInput = screen.getByTestId('jobTitle');
    fireEvent.change(titleInput, { target: { value: 'Software Developer' } });

    const descriptionInput = screen.getByTestId('jobDescription');
    fireEvent.change(descriptionInput, { target: { value: 'We are looking for a skilled software developer.' } });

    const skillsInput = screen.getByTestId('skills');
    fireEvent.change(skillsInput, { target: { value: 'JavaScript, React, Node.js' } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Generate Interview' });
    fireEvent.click(submitButton);

    // Wait for the form submission to complete
    await waitFor(() => {
      const buttonElement = screen.getByRole('button');
      return buttonElement.textContent === 'Start Interview';
    }, { timeout: 5000 }); // Increase timeout to 5 seconds

    // Verify that the API was called with the correct data
    expect(mockFetchApi).toHaveBeenCalledWith('/openai/generate-questions', {
      method: 'POST',
      body: JSON.stringify({
        jobTitle: 'Software Developer',
        jobDescription: 'We are looking for a skilled software developer.',
        skills: ['JavaScript', 'React', 'Node.js'],
      }),
    });

    // expect the button to say Start Interview
    const startInterviewButton = screen.getByRole('button', { name: 'Start Interview' });
    expect(startInterviewButton).toBeInTheDocument();
  });

  it('displays "Thinking..." while submitting the form', async () => {
    mockFetchApi.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<InterviewForm />);
    
    const titleInput = screen.getByTestId('jobTitle');
    fireEvent.change(titleInput, { target: { value: 'Software Developer' } });

    const generateButton = screen.getByRole('button', { name: 'Generate Interview' });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Thinking...' })).toBeInTheDocument();
    });
  });
});
