import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Interview from '../src/app/(dashboard)/dashboard/interview/page';

describe('Interview Component', () => {
  it('renders without crashing', () => {
    render(<Interview />);
    // This is a basic test to ensure the component renders without throwing an error
  });

  it('displays the interview title', () => {
    render(<Interview />);
    expect(screen.getByText(/Interview/i)).toBeInTheDocument();
    // This test assumes there's a title or heading with "Interview" text
  });

  // Add more tests here as you implement features in your Interview component
  // For example:
  // - Test if the question is displayed
  // - Test if the answer input field is present
  // - Test any button interactions
  // - Test state changes if applicable
});
