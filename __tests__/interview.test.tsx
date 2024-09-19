import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import InterviewPage from '../src/app/(dashboard)/dashboard/interview/page';
import '@testing-library/jest-dom';

// Mock the InterviewForm component
jest.mock('../src/app/(dashboard)/dashboard/interview/(components)/interview-form', () => {
  return function DummyInterviewForm({ onSubmit }: { onSubmit: (formData: any) => void }) {
    return (
      <button onClick={() => onSubmit({ title: 'Test', description: 'Test', skills: 'Test' })}>
        Submit
      </button>
    );
  };
});

describe('InterviewPage', () => {
  it('renders the page title', () => {
    render(<InterviewPage />);
    expect(screen.getByText('Interview Question Generator')).toBeInTheDocument();
  });

  it('renders the InterviewForm component', () => {
    render(<InterviewPage />);
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });

  it('handles form submission', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    render(<InterviewPage />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    
    expect(consoleSpy).toHaveBeenCalledWith('Form submitted with data:', {
      title: 'Test',
      description: 'Test',
      skills: 'Test'
    });
    
    consoleSpy.mockRestore();
  });
});
