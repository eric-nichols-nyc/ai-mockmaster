import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Hero from '@/app/_components/hero';

describe('Hero component', () => {
  it('renders the hero section with correct content', () => {
    render(<Hero />);

    // Check if the hero image is present
    const heroImage = screen.getByAltText('Hero image');
    expect(heroImage).toBeInTheDocument();

    // Check if the title is present
    const title = screen.getByRole('heading', { name: /Welcome to Our App/i });
    expect(title).toBeInTheDocument();

    // Check if the description is present
    const description = screen.getByText(/Discover amazing features and benefits/i);
    expect(description).toBeInTheDocument();

    // Check if the "Start Now" button is present
    const startButton = screen.getByRole('button', { name: /Start Now/i });
    expect(startButton).toBeInTheDocument();
  });
});
