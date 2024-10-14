import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateQuestions } from '@/actions/opeanai-actions';

// Mock the server action
vi.mock('@/actions/opeanai-actions', () => ({
  generateQuestions: vi.fn(),
}));

// Mock the useRouter hook
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

// Mock the useApi hook
vi.mock('@/lib/api', () => ({
  useApi: vi.fn(() => ({
    fetchApi: vi.fn(),
  })),
}));

describe('InterviewForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generates questions successfully', async () => {
    const mockQuestions = {
      questions: [
        {
          question: 'Test question',
          suggested: 'Test answer',
          skills: ['skill1', 'skill2'],
          saved: false,
        },
      ],
    };

    vi.mocked(generateQuestions).mockResolvedValue(mockQuestions);

    const result = await generateQuestions({
      jobTitle: 'Test Job',
      jobDescription: 'Test Description',
      skills: ['skill1', 'skill2'],
    });

    expect(generateQuestions).toHaveBeenCalledWith({
      jobTitle: 'Test Job',
      jobDescription: 'Test Description',
      skills: ['skill1', 'skill2'],
    });

    expect(result).toEqual(mockQuestions);
  });

  it('handles error when generating questions', async () => {
    vi.mocked(generateQuestions).mockRejectedValue(new Error('Test error'));

    await expect(generateQuestions({
      jobTitle: 'Test Job',
      jobDescription: 'Test Description',
      skills: ['skill1', 'skill2'],
    })).rejects.toThrow('Test error');
  });
});
