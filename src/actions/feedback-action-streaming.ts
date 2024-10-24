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

export async function getFeedbackToolStream(data: z.infer<typeof GetResultsSchema>) {
    const { question, answer, position, skills } = GetResultsSchema.parse(data);

    const encoder = new TextEncoder();
    let currentFeedback: Partial<FeedbackResponse> = {};
    
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

        const stream = await openai.chat.completions.create({
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
                                        score: { type: "number" },
                                        explanation: { type: "string" }
                                    },
                                    required: ["score", "explanation"]
                                }
                            },
                            required: ["suggested_answer", "constructive_feedback", "key_points", "tone_analysis", "grade"]
                        }
                    }
                }
            ],
            stream: true,
            tool_choice: { type: "function", function: { name: "feedback_response" } },
            temperature: 0.7,
        });

        const transformStream = new TransformStream({
            async transform(chunk, controller) {
                // Parse the function call data from the chunk
                if (chunk.choices[0]?.delta?.tool_calls?.[0]?.function?.arguments) {
                    try {
                        // Get the new argument chunk
                        const newArguments = chunk.choices[0].delta.tool_calls[0].function.arguments;
                        
                        // Try to parse any complete JSON objects from the accumulated arguments
                        try {
                            const partialData = JSON.parse(newArguments);
                            currentFeedback = { ...currentFeedback, ...partialData };
                            
                            // Encode and send the updated data
                            const encoded = encoder.encode(JSON.stringify(currentFeedback) + '\n');
                            controller.enqueue(encoded);
                        } catch (e) {
                            // If we can't parse the JSON yet, accumulate the chunk
                            // This happens when we receive partial JSON
                        }
                    } catch (e) {
                        console.error('Error processing chunk:', e);
                    }
                }
            }
        });

        const readableStream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of stream) {
                        controller.enqueue(chunk);
                    }
                    controller.close();
                } catch (err) {
                    controller.error(err);
                }
            }
        });

        return readableStream.pipeThrough(transformStream);
    } catch (error) {
        console.error('Feedback Generation Error:', error);
        throw new Error("Failed to generate feedback");
    }
}
