import { z } from 'zod';

export const GetResultsSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  position: z.string().min(1, "Position is required"),
  skills: z.array(z.string()),
});

export const GetInterviewByIdSchema = z.object({
  id: z.string().uuid(),
});

export const GetInterviewAndQuestionSchema = z.object({
  questionId: z.string().uuid(),
});

export const DeleteQuestionSchema = z.object({
  questionId: z.string().uuid(),
});

export const CreateInterviewSchema = z.object({
  body: z.object({
    jobTitle: z.string().min(1),
    jobDescription: z.string().optional(),
    skills: z.array(z.string()),
    questions: z.array(z.object({
      question: z.string().min(1),
      suggested: z.string().min(1),
    })).nonempty(), // Ensure there's at least one question
  }),
});

export const UpdateInterviewSchema = z.object({
  body: z.object({
    jobTitle: z.string().min(1).optional(),
    jobDescription: z.string().optional(),
  }),
});

export const SaveAnswerSchema = z.object({
  body: z.object({
    answer: z.string().min(1),
    audioUrl: z.string().url().optional(),
  }),
});

export const UpdateQuestionSchema = z.object({
  question: z.string().optional(),
  suggested: z.string().optional(),
  suggestedAudioUrl: z.string().url().nullable().optional(),
  answer: z.string().optional(),
  audioUrl: z.string().url().optional(),
  feedback: z.string().optional(),
  improvements: z.array(z.string()).optional(),
  keyTakeaways: z.array(z.string()).optional(),
  grade: z.string().optional(),
  saved: z.boolean().optional(),
  skills: z.array(z.string()).nullable().optional(),
});

export const UpdateQuestionSavedSchema = z.object({
  body: z.object({
    saved: z.boolean()
  })
});

// You    export const interviewFormSchema = z.object({
export const interviewFormSchema = z.object({
  jobTitle: z.string().min(1, 'Job title is required'),
  jobDescription: z.string().min(1, 'Job description is required'),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
});

export type InterviewFormData = z.infer<typeof interviewFormSchema>;
