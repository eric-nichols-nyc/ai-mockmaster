import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AvatarWithPlay from '@/app/(dashboard)/dashboard/interview/(components)/interview';
import { useRouter } from 'next/navigation';

// Mock the useRouter hook
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock the useInterviewStore hook
vi.mock('@/store/interviewStore', () => ({
  default: vi.fn().mockReturnValue({
    question: 'Mocked question',
    setRecordedAnswer: vi.fn(),
  }),
}));

// Mock the next/image component
vi.mock('next/image', () => ({
  default: (props: {src:string, alt:string}) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={props.src} alt={props.alt} />;
  },
}));

// Mock the AudioRecorderUploader component
vi.mock('@/app/(dashboard)/dashboard/interview/(components)/audio-recorder', () => ({
  default: () => <div data-testid="audio-recorder">Mocked AudioRecorderUploader</div>,
}));

// Mock the Button component
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>) => (
    <button {...props}>{children}</button>
  ),
}));

// Mock the Card components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  CardHeader: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  CardContent: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  CardTitle: ({ children }: React.PropsWithChildren) => <h2>{children}</h2>,
}));

describe('AvatarWithPlay Component', () => {
  beforeEach(() => {
    // Setup useRouter mock
    (useRouter as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      push: vi.fn(),
    });
  });

  it('renders without crashing', () => {
    render(<AvatarWithPlay />);
    expect(screen.getByText(/User Information/i)).toBeInTheDocument();
  });

  it('displays the avatar image', () => {
    render(<AvatarWithPlay />);
    const avatarImage = screen.getByAltText('Avatar');
    expect(avatarImage).toBeInTheDocument();
  });

  it('displays the play button', () => {
    render(<AvatarWithPlay />);
    const playButton = screen.getByRole('button');
    expect(playButton).toBeInTheDocument();
  });

  it('displays the question when play button is clicked', async () => {
    render(<AvatarWithPlay />);
    const playButton = screen.getByRole('button');
    fireEvent.click(playButton);
    expect(await screen.findByText('Mocked question')).toBeInTheDocument();
  });

  it('renders the AudioRecorderUploader component', () => {
    render(<AvatarWithPlay />);
    expect(screen.getByTestId('audio-recorder')).toBeInTheDocument();
  });

  // Add more tests here as needed
});
