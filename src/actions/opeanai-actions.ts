"use server"

import { OpenAI } from "openai"
import { z } from "zod"

// Define Zod schemas for route validation
const GenerateQuestionsSchema = z.object({
  jobTitle: z.string().min(1, "Job title is required"),
  jobDescription: z.string().optional(),
  skills: z.array(z.string()).optional(),
})

const FeedbackRequestSchema = z.object({
  question: z.string(),
  userAnswer: z.string(),
  jobTitle: z.string(),
  skills: z.array(z.string()).optional(),
})

const openai = new OpenAI()

export async function generateQuestion(data: z.infer<typeof GenerateQuestionsSchema>): Promise<string> {
  try {
    const validatedData = GenerateQuestionsSchema.parse(data);

    const questionPrompt = `Generate 1 challenging interview question for a ${validatedData.jobTitle} position.
${validatedData.jobDescription ? `Job description: ${validatedData.jobDescription}` : ''}
${validatedData.skills ? `Required skills: ${validatedData.skills.join(', ')}` : ''}

Ensure the question is relevant, challenging, and covers important aspects of the job. The question must be a single sentence, similar to: 'How have you implemented typescript in your projects?'`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert at generating relevant and challenging interview questions." },
        { role: "user", content: questionPrompt }
      ],
      temperature: 0.7,
    });

    let generatedQuestion = response.choices[0]?.message?.content;
    if (!generatedQuestion) {
      throw new Error('No question generated');
    }

    // Post-processing to ensure a single sentence
    generatedQuestion = generatedQuestion.trim().replace(/^["']|["']$/g, ''); // Remove surrounding quotes if present
    generatedQuestion = generatedQuestion.split(/[.!?]+/)[0] + '?'; // Keep only the first sentence and ensure it ends with a question mark

    return generatedQuestion;

  } catch (error) {
    console.error('Question Generation Error:', error);
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.errors));
    }
    throw new Error('Failed to generate interview question');
  }
}

const feedbackFunction = {
  name: "provideFeedback",
  description: "Provide comprehensive feedback on an interview answer",
  parameters: {
    type: "object",
    properties: {
      suggestedAnswer: {
        type: "string",
        description: "A comprehensive suggested answer to the interview question"
      },
      constructiveFeedback: {
        type: "string",
        description: "Constructive feedback on the user's answer"
      },
      keyPoints: {
        type: "array",
        items: {
          type: "string"
        },
        description: "Key points that should be included in a good answer"
      },
      toneAnalysis: {
        type: "string",
        description: "Analysis of the tone and style of the user's answer"
      },
      grade: {
        type: "string",
        enum: ["A", "B", "C", "D", "F"],
        description: "A letter grade assessing the quality of the user's answer"
      }
    },
    required: ["suggestedAnswer", "constructiveFeedback", "keyPoints", "toneAnalysis", "grade"]
  }
};

export async function generateFeedback(data: z.infer<typeof FeedbackRequestSchema>) {
  try {
    const validatedData = FeedbackRequestSchema.parse(data);
    const start = performance.now();

    const feedbackPrompt = `Provide comprehensive feedback for the following interview question and user response:

Question: ${validatedData.question}
User's Answer: ${validatedData.userAnswer}
Job Title: ${validatedData.jobTitle}
${validatedData.skills ? `Required Skills: ${validatedData.skills.join(', ')}` : ''}

Analyze the answer and provide a suggested answer, constructive feedback, key points, tone analysis, and a grade.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert at evaluating interview answers and providing comprehensive, constructive feedback." },
        { role: "user", content: feedbackPrompt }
      ],
      functions: [feedbackFunction],
      function_call: { name: "provideFeedback" },
      temperature: 0.7
    });

    const functionCall = response.choices[0].message.function_call;
    if (!functionCall || functionCall.name !== "provideFeedback") {
      throw new Error("Unexpected response from OpenAI API");
    }

    const feedback = JSON.parse(functionCall.arguments);
    const end = performance.now();

    return {
      result: feedback,
      timeTaken: end - start
    };

  } catch (error) {
    console.error('Feedback Generation Error:', error);
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.errors));
    }
    throw new Error('Failed to generate comprehensive feedback');
  }
}
