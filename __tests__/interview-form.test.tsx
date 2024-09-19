import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import InterviewForm from '@/app/(dashboard)/dashboard/interview/(components)/interview-form';
import useInterviewStore from '@/store/interviewStore';
import { useRouter } from 'next/navigation';

// Mock the useInterviewStore hook
vi.mock('@/store/interviewStore', () => ({
  default: vi.fn(),
}));

// Mock the useRouter hook
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('InterviewForm', () => {
  const mockSetQuestionAndAnswer = vi.fn();
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();

    (useInterviewStore as any).mockReturnValue({
      question: '',
      answer: '',
      setQuestionAndAnswer: mockSetQuestionAndAnswer,
    });

    (useRouter as any).mockReturnValue({
      push: mockPush,
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        response: JSON.stringify({
          question: 'Test question',
          answer: 'Test answer',
        }),
      }),
    });
  });

  it('renders the form correctly', () => {
    render(<InterviewForm />);
    
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/skills/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate question/i })).toBeInTheDocument();
  });

  it('submits the form with valid data', async () => {
    render(<InterviewForm />);
    
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Test Title' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByLabelText(/skills/i), { target: { value: 'react, testing' } });
    
    fireEvent.click(screen.getByRole('button', { name: /generate question/i }));

    expect(screen.getByRole('button', { name: /generating question/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(mockSetQuestionAndAnswer).toHaveBeenCalledWith('Test question', 'Test answer');
      expect(mockPush).toHaveBeenCalledWith('/dashboard/interview/start');
    });
  });

  it('displays validation errors for empty fields', async () => {
    render(<InterviewForm />);
    
    fireEvent.click(screen.getByRole('button', { name: /generate question/i }));

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      expect(screen.getByText(/description is required/i)).toBeInTheDocument();
      expect(screen.getByText(/skills are required/i)).toBeInTheDocument();
    });

    expect(mockSetQuestionAndAnswer).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('handles API error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('API Error'));

    render(<InterviewForm />);
    
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Test Title' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByLabelText(/skills/i), { target: { value: 'react, testing' } });
    
    fireEvent.click(screen.getByRole('button', { name: /generate question/i }));

    await waitFor(() => {
      expect(screen.getByText(/an error occurred while submitting the form: api error/i)).toBeInTheDocument();
    });

    expect(mockSetQuestionAndAnswer).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('displays generated question and answer', async () => {
    (useInterviewStore as any).mockReturnValue({
      question: 'Test question',
      answer: 'Test answer',
      setQuestionAndAnswer: mockSetQuestionAndAnswer,
    });

    render(<InterviewForm />);

    expect(screen.getByText('Generated Question:')).toBeInTheDocument();
    expect(screen.getByText('Test question')).toBeInTheDocument();
    expect(screen.getByText('Answer:')).toBeInTheDocument();
    expect(screen.getByText('Test answer')).toBeInTheDocument();
  });
});