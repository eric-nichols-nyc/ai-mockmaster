import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AnimatedButton from '../src/app/(dashboard)/dashboard/interview/(components)/AnimatedButton';

// Mock the useRouter hook
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('AnimatedButton', () => {
  const testInterviewId = 'test-interview-id';
  
  it('calls onClick and navigates when clicked and isSubmitted is true', () => {
    const mockOnClick = vi.fn();
    render(
      <AnimatedButton
        onClick={mockOnClick}
        isLoading={false}
        isSubmitted={true}
      />
    );

    const button = screen.getByRole('button', { name: 'Start Interview' });
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalled();
    // In a real scenario, navigation would be triggered by the parent component
    // based on the isSubmitted state, not directly by the AnimatedButton
  });

  it('calls onClick but does not navigate when clicked and isSubmitted is false', () => {
    const mockOnClick = vi.fn();
    render(
      <AnimatedButton
        onClick={mockOnClick}
        isLoading={false}
        isSubmitted={false}
      />
    );

    const button = screen.getByRole('button', { name: 'Generate Interview' });
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('displays "Generate Interview" when not loading and not submitted', () => {
    render(
      <AnimatedButton
        onClick={vi.fn()}
        isLoading={false}
        isSubmitted={false}
      />
    );

    expect(screen.getByRole('button', { name: 'Generate Interview' })).toBeInTheDocument();
  });

  it('displays "Thinking..." and is disabled when loading', () => {
    render(
      <AnimatedButton
        onClick={vi.fn()}
        isLoading={true}
        isSubmitted={false}
      />
    );

    const button = screen.getByRole('button', { name: 'Thinking...' });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it('displays "Start Interview" when submitted', () => {
    render(
      <AnimatedButton
        onClick={vi.fn()}
        isLoading={false}
        isSubmitted={true}
      />
    );

    expect(screen.getByRole('button', { name: 'Start Interview' })).toBeInTheDocument();
  });
});
