import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Interview from '../src/app/(dashboard)/dashboard/interview/[id]/page';

// Mock the useParams hook
jest.mock('next/navigation', () => ({
  useParams: () => ({
    id: 'test-interview-id',
  }),
}));

describe('Interview Component', () => {
  it('renders the interview component', () => {
    render(<Interview />);
    
    // Check if the component renders without crashing
    expect(screen.getByTestId('interview-component')).toBeInTheDocument();
    
    // Add more specific tests here based on the actual content of your Interview component
    // For example:
    // expect(screen.getByText('Interview Questions')).toBeInTheDocument();
    // expect(screen.getByRole('button', { name: 'Start Interview' })).toBeInTheDocument();
  });

  // Add more test cases as needed
});
