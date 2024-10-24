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
    answer_feedback: string;
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
        Please structure your response like this example:
        {
            "suggested_answer": "'When faced with conflicting priorities, I follow a systematic approach: First, I assess each task's urgency and impact using a priority matrix. For critical issues, I immediately communicate with stakeholders to set expectations and gather requirements. I use project management tools to track deadlines and dependencies, and I'm not afraid to escalate when necessary. For example, in my last role, I had to balance an urgent client deliverable with a planned system upgrade. I evaluated both tasks' impact, consulted with stakeholders, and ultimately split my team to handle both priorities while keeping everyone informed of progress.'",
            "feedback_response": "Your answer shows good understanding of basic prioritization, you mention stakeholder communication, and you demonstrate awareness of project management tools. However, you could provide more specific examples and expand on managing expectations.",
            "constructive_feedback": {
                "strengths": [
                    "You Show good understanding of basic prioritization",
                    "Mentions stakeholder communication",
                    "You Demonstrate awareness of project management tools"
                ],
                "areas_for_improvement": [
                    "You Could provide more specific examples",
                    "You could mention of risk assessment",
                    "You Could elaborate on team coordination strategies"
                ],
                "actionable_tips": [
                    "Include a specific example of a challenging prioritization decision you've made",
                    "Mention how you handle unexpected changes in priorities",
                    "Describe your communication strategy with different stakeholders"
                ]
            },
            
            "key_points": [
                {
                    "point": "Prioritization Method",
                    "explanation": "You used a structured approach but you could be more detailed about criteria"
                },
                {
                    "point": "Stakeholder Management",
                    "explanation": "Good mention of communication but you could expand on managing expectations"
                }
            ],
            
            "tone_analysis": {
                "overall_tone": "Professional but you could be more confident",
                "professionalism": 85,
                "confidence": 70,
                "clarity": 80
            },
            


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
                                    description: "A comprehensive and well-structured suggested answer that would impress an interviewer given in a conversational tone, in plain text format"
                                },
                                answer_feedback: {
                                    type: "string",
                                    description: "An overall analysis of the user answer, be sure to address the user with the pronoun 'your'"
                                },
                                constructive_feedback: {
                                    type: "object",
                                    properties: {
                                        strengths: {
                                            type: "array",
                                            items: { type: "string" },
                                            description: "A list of strengths that the user has demonstrated in their answer, be sure to address the user with the pronoun 'your'"
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
                                        professionalism: {
                                            type: "number",
                                            description: "Numerical grade from 0-100"
                                        },
                                        confidence: {
                                            type: "number",
                                            description: "Numerical grade from 0-100"
                                        },
                                        clarity: {
                                            type: "number",
                                            description: "Numerical grade from 0-100"
                                        },
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