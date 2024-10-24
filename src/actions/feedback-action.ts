import { OpenAI } from 'openai';
import { z } from 'zod';
import { GetResultsSchema } from '@/lib/schemas';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

type KeyPoint = {
    point: string;
    explanation: string;
}

type ToneAnalysis = {
    overall_tone: string;
    professionalism: number;
    confidence: number;
    clarity: number;
}

interface FeedbackResponse {
    suggested_answer: string;
    constructive_feedback: {
        strengths: string[];
        areas_for_improvement: string[];
        actionable_tips: string[];
    };
    key_points: KeyPoint[];
    tone_analysis: ToneAnalysis;
    grade: {
        score: number;
        explanation: string;
      };
}

export async function getFeedbackTool(data: z.infer<typeof GetResultsSchema>): Promise<FeedbackResponse> {
    const { question, answer, position, skills } = GetResultsSchema.parse(data);
    try {
        const prompt = `As an expert interviewer for ${position} positions, evaluate the following answer to the question: ${question}. 
        Question: ${question}
        Candidate's Answer: ${answer}
        Required Skills: ${skills.join(', ')}

        Please analyze the response considering:
        1. Technical accuracy and completeness
        2. Alignment with required skills: ${skills.join(', ')}
        3. Communication effectiveness
        4. Professional context of a ${position} role

        Important: Provide the response in plain text without any markdown formatting.`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: "system",
                    content: "You are an expert interviewer and career coach specializing in technical roles. Provide detailed, constructive feedback in plain text format without markdown formatting. Use regular text formatting like numbering (1., 2., etc.) and indentation with spaces for structure."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            tools: [
                {
                    type: "function",
                    function: {
                        name: "feedback_response",
                        parameters: {
                            type: "object",
                            properties: {
                                suggested_answer: {
                                    type: "string",
                                    description: "A comprehensive and well-structured suggested answer that would impress an interviewer, in plain text format"
                                },
                                constructive_feedback: {
                                    type: "object",
                                    properties: {
                                        strengths: {
                                            type: "array",
                                            items: { type: "string" }
                                        },
                                        areas_for_improvement: {
                                            type: "array",
                                            items: { type: "string" }
                                        },
                                        actionable_tips: {
                                            type: "array",
                                            items: { type: "string" }
                                        }
                                    }
                                },
                                key_points: {
                                    type: "array",
                                    items: { type: "object" }
                                },
                                tone_analysis: {
                                    type: "object",
                                    properties: {
                                        overall_tone: { type: "string" },
                                        professionalism: { type: "number" },
                                        confidence: { type: "number" },
                                        clarity: { type: "number" }
                                    }
                                },
                                grade: {
                                    type: "object",
                                    properties: {
                                      score: {
                                        type: "number",
                                        description: "Numerical grade from 0-100"
                                      },
                                      explanation: {
                                        type: "string",
                                        description: "Explanation of the grade"
                                      }
                                    },
                                    required: ["score", "explanation"]
                                  }
                            },
                            required: ["suggested_answer", "constructive_feedback", "key_points", "tone_analysis", "grade"]
                        }
                    }
                }
            ],
            tool_choice: { type: "function", function: { name: "feedback_response" } },
            temperature: 0.7,
        });

        const toolCall = response.choices[0].message.tool_calls?.[0];

        if (!toolCall) {
            throw new Error("No function call found");
        }

        return JSON.parse(toolCall.function.arguments) as FeedbackResponse;
    } catch (error) {
        console.error('Feedback Generation Error:', error);
        throw new Error("Failed to generate feedback");
    }
}