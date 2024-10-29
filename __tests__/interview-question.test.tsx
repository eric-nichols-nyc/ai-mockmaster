import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InterviewQuestion from '@/components/interview-question';
import { useApi } from '@/lib/api';
import { useInterview } from '@/hooks/use-tanstack-interview';
import useBlobStore from '@/store/interviewStore';

// Mock the dependencies
vi.mock('@/lib/api', () => ({
  useApi: vi.fn(),
}));

vi.mock('@/hooks/use-tanstack-interview', () => ({
  useInterview: vi.fn(),
}));

vi.mock('@/store/interviewStore', () => ({
  default: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'mock-interview-id' }),
}));

describe('InterviewQuestion', () => {
  const mockQuestion = {
    id: '1',
    interviewId: 'mock-interview-id',
    question: 'Tell me about yourself',
    skills: ['communication'],
    answer: null,
    audioUrl: null,
    feedback: null,
    saved: false,
    suggested: '',
    createdAt: new Date(),
    suggestedAudioUrl: null,
    transcribing: false,
    loading: false,
    improvements: null,
    keyTakeaways: null,
    grade: null,
    explanation: null
  };

  const mockInterview = {
    id: 'mock-interview-id',
    jobTitle: 'Software Engineer',
    questions: [mockQuestion],
  };

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Setup default mock implementations
    (useApi as unknown as Mock).mockReturnValue({
      transcribeAudio: vi.fn().mockResolvedValue({
        answer: 'Transcribed answer',
        audioUrl: 'mock-audio-url',
      }),
    });

    (useInterview as unknown as Mock).mockReturnValue({
      interview: mockInterview,
      updateQuestion: vi.fn().mockResolvedValue({}),
    });

    // Mock Blob with a proper implementation
    const mockBlob = new Blob(['mock audio data'], { type: 'audio/webm' });
    (useBlobStore as unknown as Mock).mockReturnValue({
      currentBlob: mockBlob,
    });
  });

  it('renders the component with initial state', () => {
    render(<InterviewQuestion question={mockQuestion} jobTitle="Software Engineer" />);
    
    expect(screen.getByText(/Please enable your microphone/i)).toBeInTheDocument();
    expect(screen.getByText(mockQuestion.question)).toBeInTheDocument();
  });

  it('shows error message when timer completes', async () => {
    render(<InterviewQuestion question={mockQuestion} jobTitle="Software Engineer" />);
    
    // Simulate timer completion
    const timer = screen.getByRole('timer'); // You'll need to add role="timer" to your InterviewTimer component
    fireEvent.timeUpdate(timer);
    
    await waitFor(() => {
      expect(screen.getByText(/Interview time has ended/i)).toBeInTheDocument();
    });
  });

  it('handles recording submission successfully', async () => {
    render(<InterviewQuestion question={mockQuestion} jobTitle="Software Engineer" />);
    
    // Find and click the submit button
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      // Verify the success state
      expect(screen.getByText(/success/i)).toBeInTheDocument();
    });
  });

  it('displays error message on submission failure', async () => {
    // Mock API failure
    (useApi as unknown as Mock).mockReturnValue({
      transcribeAudio: vi.fn().mockRejectedValue(new Error('API Error')),
    });

    render(<InterviewQuestion question={mockQuestion} jobTitle="Software Engineer" />);
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to process your answer/i)).toBeInTheDocument();
    });
  });
}); 